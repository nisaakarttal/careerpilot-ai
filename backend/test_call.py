from langchain_openai import ChatOpenAI

from app.core.config import settings


def main() -> None:
    if not settings.OPENAI_API_KEY:
        raise SystemExit("OPENAI_API_KEY backend/.env içinde yapılandırılmamış.")

    model = ChatOpenAI(
        api_key=settings.OPENAI_API_KEY,
        model=settings.OPENAI_MODEL,
        temperature=0,
    )
    response = model.invoke("Türkçe olarak kısa bir merhaba mesajı yaz.")
    print(response.text)


if __name__ == "__main__":
    main()
