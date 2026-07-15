import os
from google import genai

# Load env variables from backend/.env manually
env_path = "backend/.env"
if os.path.exists(env_path):
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, val = line.split("=", 1)
                os.environ[key.strip()] = val.strip().strip('"').strip("'")

api_key = os.getenv("GEMINI_API_KEY")
print("API Key loaded:", api_key[:8] + "..." if api_key else "None")

try:
    client = genai.Client(api_key=api_key)
    models = client.models.list()
    print("Available models:")
    for m in models:
        print(f" - {m.name}")
except Exception as e:
    print("Error listing models:", str(e))
