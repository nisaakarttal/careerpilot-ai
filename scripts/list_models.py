import os
from pathlib import Path

from openai import OpenAI


def load_backend_env() -> None:
    env_path = Path("backend/.env")
    if not env_path.exists():
        return

    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, value = line.split("=", 1)
            os.environ.setdefault(
                key.strip(),
                value.strip().strip('"').strip("'"),
            )


def main() -> None:
    load_backend_env()
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise SystemExit("OPENAI_API_KEY backend/.env içinde yapılandırılmamış.")

    client = OpenAI(api_key=api_key)
    print("Kullanılabilir OpenAI modelleri:")
    for model in client.models.list():
        print(f" - {model.id}")


if __name__ == "__main__":
    main()
