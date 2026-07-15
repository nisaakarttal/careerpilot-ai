from google import genai
try:
    client = genai.Client()
    print("Available Gemini models:")
    for m in client.models.list():
        print(m.name)
except Exception as e:
    print("Error:", str(e))
