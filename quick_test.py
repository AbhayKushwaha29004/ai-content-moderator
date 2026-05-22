import asyncio, json
try:
    import websockets
except:
    import subprocess, sys
    subprocess.run([sys.executable, "-m", "pip", "install", "websockets", "-q"])
    import websockets

async def test():
    async with websockets.connect("ws://127.0.0.1:8000/ws/moderate/chat") as ws:
        await ws.send("Hello friend!")
        r1 = json.loads(await ws.recv())
        print(f"Safe msg: '{r1['original']}' => {r1['status']} | {r1['filtered']}")
        
        await ws.send("I will kill you stupid idiot")
        r2 = json.loads(await ws.recv())
        print(f"Toxic msg: '{r2['original']}' => {r2['status']} | {r2['filtered']}")

asyncio.run(test())
