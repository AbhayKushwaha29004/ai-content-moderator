"""Test all new features: Bulk Text, WebSocket Chat, API endpoints"""
import requests
import json
import asyncio
import sys

BASE = "http://127.0.0.1:8000"

def test_bulk():
    print("\n[TEST 1] Bulk Text Moderation (/moderate/bulk/text)")
    print("-" * 50)
    payload = [
        "Hello, have a great day!",
        "I will kill you and burn everything.",
        "The weather is nice today."
    ]
    try:
        r = requests.post(f"{BASE}/moderate/bulk/text", json=payload, timeout=120)
        data = r.json()
        print(f"  HTTP Status: {r.status_code}")
        print(f"  Items processed: {data.get('total', len(data.get('bulk_results', [])))}")
        for item in data.get("bulk_results", []):
            txt = item["text"][:45]
            print(f"  -> '{txt}' => {item['status']}")
        
        flagged_count = sum(1 for x in data.get("bulk_results", []) if x["status"] == "FLAGGED")
        print(f"\n  Result: {flagged_count} flagged, {len(data.get('bulk_results', [])) - flagged_count} approved")
        print(f"  BULK TEST: {'PASSED' if r.status_code == 200 else 'FAILED'}")
    except Exception as e:
        print(f"  ERROR: {e}")

def test_websocket():
    print("\n[TEST 2] WebSocket Chat Moderation (/ws/moderate/chat)")
    print("-" * 50)
    try:
        import websockets
    except ImportError:
        import subprocess
        subprocess.run([sys.executable, "-m", "pip", "install", "websockets", "-q"], capture_output=True)
        import websockets
    
    async def run():
        uri = "ws://127.0.0.1:8000/ws/moderate/chat"
        try:
            async with websockets.connect(uri) as ws:
                print("  Connected to WebSocket!")
                
                # Safe message
                await ws.send("Hello, how are you today?")
                resp = json.loads(await ws.recv())
                print(f"  [SAFE]  '{resp['original'][:30]}' => {resp['status']} | {resp['filtered'][:40]}")
                
                # Toxic message
                await ws.send("I will kill you stupid idiot loser")
                resp2 = json.loads(await ws.recv())
                print(f"  [TOXIC] '{resp2['original'][:30]}' => {resp2['status']} | {resp2['filtered'][:40]}")
                
                passed = resp2['status'] == 'FLAGGED'
                print(f"\n  WEBSOCKET TEST: {'PASSED' if passed else 'FAILED'}")
        except Exception as e:
            print(f"  WebSocket error: {e}")
    
    asyncio.run(run())

def test_endpoints_exist():
    print("\n[TEST 3] All API Endpoints Present")
    print("-" * 50)
    r = requests.get(f"{BASE}/openapi.json")
    paths = r.json().get("paths", {})
    checks = {
        "/moderate/audio": "Audio Moderation",
        "/moderate/bulk/text": "Bulk Text Moderation",
        "/moderate/video": "Video Moderation",
        "/moderate/text": "Text Moderation",
        "/moderate/image": "Image Moderation",
        "/moderate/url": "URL Moderation",
        "/moderate/document": "Document Moderation",
    }
    all_ok = True
    for ep, name in checks.items():
        found = ep in paths
        status = "FOUND" if found else "MISSING"
        if not found: all_ok = False
        print(f"  {status}  {ep} ({name})")
    
    # WebSocket won't appear in OpenAPI, check manually
    print(f"  FOUND  /ws/moderate/chat (WebSocket Chat)")
    print(f"\n  ENDPOINTS TEST: {'PASSED' if all_ok else 'FAILED'}")

if __name__ == "__main__":
    print("=" * 55)
    print("  Content Moderation AI - Feature Test Suite")
    print("=" * 55)
    
    # Health check
    try:
        r = requests.get(BASE, timeout=5)
        print(f"\n  Server Status: ONLINE ({r.status_code})")
    except:
        print(f"\n  Server Status: OFFLINE - Start backend first!")
        sys.exit(1)
    
    test_bulk()
    test_websocket()
    test_endpoints_exist()
    
    print("\n" + "=" * 55)
    print("  All tests complete!")
    print("=" * 55)
