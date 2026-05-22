import requests

url = "http://localhost:8000/moderate/image"
file_path = "uploads/1779226485_Screenshot 2026-05-19 000650.png"

print(f"Uploading file: {file_path}")
with open(file_path, "rb") as f:
    files = {"file": ("Screenshot.png", f, "image/png")}
    # We enable all models, including nsfw
    params = {"enabled_models": "nsfw"}
    response = requests.post(url, files=files, params=params)

print("Status Code:", response.status_code)
if response.status_code == 200:
    import json
    print("Response JSON:")
    print(json.dumps(response.json(), indent=2))
else:
    print("Error output:", response.text)
