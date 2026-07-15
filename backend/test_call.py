from google import genai
try:
    client = genai.Client()
    response = client.models.generate_content(
        model="gemini-3.5-flash",
        contents="Hi, say hello!"
    )
    print("Success:", response.text)
except Exception as e:
    print("Error:", str(e))
