from openai import OpenAI

from app.core.config import settings


def main() -> None:
    if not settings.OPENAI_API_KEY:
        raise SystemExit("OPENAI_API_KEY backend/.env içinde yapılandırılmamış.")

    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    print("Kullanılabilir OpenAI modelleri:")
    for model in client.models.list():
        print(model.id)


if __name__ == "__main__":
    main()
