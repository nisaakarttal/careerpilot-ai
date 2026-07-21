#!/bin/bash

set -Eeuo pipefail

# macOS Terminal'de tutarlı komut çıktısı üretir.
export LC_ALL=C
export LANG=C

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
ACTION="start"
OPEN_BROWSER=1

usage() {
    cat <<'EOF'
CareerPilot AI - Docker ile çalıştırma

Kullanım:
  Çift tıklama
  ./setup_venv_and_run.command
      Docker Desktop kapalıysa açar, image'ları build eder ve servisleri başlatır.

  ./setup_venv_and_run.command --restart
      CareerPilot servislerini yeniden oluşturup başlatır.

  ./setup_venv_and_run.command --stop
      Yalnızca CareerPilot servislerini durdurur. Veritabanı verisini korur.

  ./setup_venv_and_run.command --stop-docker
      CareerPilot servislerini durdurur ve Docker Desktop'ı kapatır.
      Diğer projelerin çalışan konteynerleri de etkileneceği için dikkatli kullanın.

  ./setup_venv_and_run.command --status
      CareerPilot konteynerlerinin durumunu gösterir.

  ./setup_venv_and_run.command --logs
      Servis loglarını canlı takip eder. Çıkmak için Control+C kullanın.

  ./setup_venv_and_run.command --no-open
      Başlattıktan sonra tarayıcıyı otomatik açmaz.
EOF
}

log() {
    printf '\n[%s] %s\n' "$1" "$2"
}

warn() {
    printf '\n[UYARI] %s\n' "$1" >&2
}

die() {
    printf '\n[HATA] %s\n' "$1" >&2
    if [ -t 0 ]; then
        printf 'Pencereyi kapatmak için Enter tuşuna basın...'
        read -r _
    fi
    exit 1
}

for argument in "$@"; do
    case "$argument" in
        --restart)
            ACTION="restart"
            ;;
        --stop)
            ACTION="stop"
            ;;
        --stop-docker)
            ACTION="stop-docker"
            ;;
        --status)
            ACTION="status"
            ;;
        --logs)
            ACTION="logs"
            ;;
        --no-open)
            OPEN_BROWSER=0
            ;;
        --help|-h)
            usage
            exit 0
            ;;
        *)
            usage
            die "Bilinmeyen seçenek: $argument"
            ;;
    esac
done

cd "$ROOT_DIR"

printf '\n==========================================\n'
printf ' CareerPilot AI - Docker Yönetimi\n'
printf '==========================================\n'

require_docker_cli() {
    command -v docker >/dev/null 2>&1 || die "Docker komutu bulunamadı. Docker Desktop kurulumunu kontrol edin."
    docker compose version >/dev/null 2>&1 || die "Docker Compose bulunamadı. Docker Desktop kurulumunu güncelleyin."
}

docker_is_ready() {
    docker info >/dev/null 2>&1
}

start_docker_desktop() {
    require_docker_cli

    if docker_is_ready; then
        printf '[OK] Docker Desktop hazır.\n'
        return
    fi

    if [ "$(uname -s)" != "Darwin" ]; then
        die "Docker servisi çalışmıyor. Docker daemon'ı başlatıp tekrar deneyin."
    fi

    log "DOCKER" "Docker Desktop açılıyor..."
    open -a Docker || die "Docker Desktop açılamadı. Uygulamalar klasöründeki Docker'ı kontrol edin."

    local attempt
    for attempt in $(seq 1 90); do
        if docker_is_ready; then
            printf '[OK] Docker Desktop hazır.\n'
            return
        fi
        printf '.'
        sleep 2
    done

    printf '\n'
    die "Docker Desktop 3 dakika içinde hazır olmadı. Docker Desktop ekranındaki hatayı kontrol edin."
}

prepare_environment() {
    log "ENV" "Ortam dosyaları kontrol ediliyor..."

    if [ ! -f backend/.env ]; then
        cp backend/.env.example backend/.env
        printf '[OK] backend/.env oluşturuldu.\n'
    else
        printf '[OK] Mevcut backend/.env korundu.\n'
    fi

    if [ ! -f frontend/.env.local ] && [ -f frontend/.env.local.example ]; then
        cp frontend/.env.local.example frontend/.env.local
        printf '[OK] frontend/.env.local oluşturuldu.\n'
    elif [ -f frontend/.env.local ]; then
        printf '[OK] Mevcut frontend/.env.local korundu.\n'
    fi

    local provider
    local provider_key
    provider="$(awk -F= '$1 == "AI_PROVIDER" {print tolower($2); exit}' backend/.env | tr -d '[:space:]')"
    provider="${provider:-gemini}"

    if [ "$provider" = "openai" ]; then
        provider_key="$(awk -F= '$1 == "OPENAI_API_KEY" {sub(/^[^=]*=/, ""); print; exit}' backend/.env | tr -d '[:space:]')"
        if [ -z "$provider_key" ]; then
            warn "Canlı AI yanıtları için backend/.env dosyasına OPENAI_API_KEY ekleyin."
        fi
    elif [ "$provider" = "gemini" ]; then
        provider_key="$(awk -F= '$1 == "GEMINI_API_KEY" {sub(/^[^=]*=/, ""); print; exit}' backend/.env | tr -d '[:space:]')"
        if [ -z "$provider_key" ]; then
            warn "Canlı AI yanıtları için backend/.env dosyasına GEMINI_API_KEY ekleyin."
        fi
    else
        warn "backend/.env içindeki AI_PROVIDER değeri 'openai' veya 'gemini' olmalıdır."
    fi
}

wait_for_url() {
    local name="$1"
    local url="$2"
    local attempt

    for attempt in $(seq 1 60); do
        if curl -fsS "$url" >/dev/null 2>&1; then
            printf '[OK] %s hazır: %s\n' "$name" "$url"
            return 0
        fi
        sleep 2
    done

    warn "$name 2 dakika içinde HTTP yanıtı vermedi: $url"
    return 1
}

show_status() {
    if ! docker_is_ready; then
        warn "Docker Desktop çalışmıyor."
        return 1
    fi
    docker compose ps
}

stop_services() {
    if ! docker_is_ready; then
        printf '[OK] Docker Desktop zaten kapalı; durdurulacak CareerPilot servisi yok.\n'
        return
    fi

    log "STOP" "CareerPilot servisleri durduruluyor..."
    docker compose down
    printf "[OK] Servisler durduruldu. PostgreSQL volume'u korundu.\n"
}

quit_docker_desktop() {
    if [ "$(uname -s)" != "Darwin" ]; then
        warn "Docker Desktop'ı otomatik kapatma yalnızca macOS'ta destekleniyor."
        return
    fi

    log "DOCKER" "Docker Desktop kapatılıyor..."
    osascript -e 'quit app "Docker"' >/dev/null 2>&1 || warn "Docker Desktop otomatik kapatılamadı."
}

open_frontend() {
    if [ "$(uname -s)" = "Darwin" ]; then
        open http://localhost:3000 >/dev/null 2>&1 || warn "Tarayıcı otomatik açılamadı."
    fi
}

interactive_menu() {
    if [ ! -t 0 ]; then
        return
    fi

    while true; do
        printf '\nNe yapmak istersiniz?\n'
        printf '  1) Uygulamayı tarayıcıda aç\n'
        printf '  2) Konteyner durumunu göster\n'
        printf '  3) Canlı logları göster\n'
        printf '  4) CareerPilot servislerini durdur\n'
        printf '  5) Servisleri durdur ve Docker Desktop\x27ı kapat\n'
        printf '  0) Pencereyi kapat; servisler çalışmaya devam etsin\n'
        printf 'Seçim: '

        if ! read -r selection; then
            return
        fi

        case "$selection" in
            1)
                open_frontend
                ;;
            2)
                show_status || true
                ;;
            3)
                printf '\nLog takibinden menüye dönmek için Control+C kullanın.\n'
                docker compose logs --follow --tail=100 || true
                ;;
            4)
                stop_services
                return
                ;;
            5)
                warn "Docker Desktop kapanırsa diğer projelerin konteynerleri de durur."
                printf 'Devam etmek için EVET yazın: '
                read -r confirmation
                if [ "$confirmation" = "EVET" ]; then
                    stop_services
                    quit_docker_desktop
                    return
                fi
                printf 'İşlem iptal edildi.\n'
                ;;
            0)
                printf 'CareerPilot servisleri arka planda çalışmaya devam ediyor.\n'
                return
                ;;
            *)
                warn "Geçersiz seçim."
                ;;
        esac
    done
}

require_docker_cli

case "$ACTION" in
    stop)
        stop_services
        exit 0
        ;;
    stop-docker)
        stop_services
        quit_docker_desktop
        exit 0
        ;;
    status)
        show_status
        exit $?
        ;;
    logs)
        docker_is_ready || die "Docker Desktop çalışmıyor."
        docker compose logs --follow --tail=100
        exit 0
        ;;
esac

start_docker_desktop
prepare_environment

if [ "$ACTION" = "restart" ]; then
    log "RESTART" "Mevcut CareerPilot servisleri durduruluyor..."
    docker compose down
fi

log "START" "CareerPilot image'ları hazırlanıyor ve servisler başlatılıyor..."
docker compose up -d --build

log "CHECK" "Servislerin HTTP yanıtları bekleniyor..."
wait_for_url "Backend" "http://localhost:8000/api/health" || true
wait_for_url "Frontend" "http://localhost:3000" || true

printf '\nCareerPilot hazır:\n'
printf '  Frontend: http://localhost:3000\n'
printf '  Swagger:  http://localhost:8000/docs\n'
printf '  API:      http://localhost:8000/api\n'

show_status || true

if [ "$OPEN_BROWSER" -eq 1 ]; then
    open_frontend
fi

interactive_menu
