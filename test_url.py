import requests

url = "https://www.youtube.com/watch?v=f_rk5vqS4Mo"
resp = requests.post("http://localhost:8000/moderate/url", params={"url": url})
data = resp.json()

with open("url_result.txt", "w", encoding="utf-8") as f:
    f.write(f"Status: {data.get('status')}\n")
    f.write(f"Text extracted: {data.get('text_length', 0)} chars\n\n")
    for cat, v in sorted(data.get("results", {}).items()):
        score = v.get("score", 0)
        label = v.get("label", "?")
        reason = v.get("reason", "")
        flag = "[FLAGGED]" if label == "FLAGGED" else "[SAFE]   "
        f.write(f"{flag} {cat:20s} {score*100:5.1f}%  {reason[:90]}\n")

print("Done - check url_result.txt")
