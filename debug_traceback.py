import sys
import traceback
from pathlib import Path
from PIL import Image
from transformers import pipeline

# Setup models exactly as in main.py
print("Loading models...")
models = {}
device = -1

models['nsfw_image'] = pipeline(
    "image-classification",
    model="Falconsai/nsfw_image_detection",
    device=device
)

models['nsfw_image_robust'] = pipeline(
    "image-classification",
    model="AdamCodd/vit-base-nsfw-detector",
    device=device
)

file_path = Path("uploads/1779226485_Screenshot 2026-05-19 000650.png")

try:
    print("Running moderation...")
    scores = []
    
    # 1. Falconsai
    if 'nsfw_image' in models:
        try:
            image = Image.open(file_path)
            res = models['nsfw_image'](image)
            raw_score = float(res[0]['score'])
            label = res[0]['label']
            nsfw_score = raw_score if label != "normal" else (1.0 - raw_score)
            scores.append(nsfw_score)
            print("Falconsai score:", nsfw_score)
        except Exception as e:
            print("Falconsai failed:")
            traceback.print_exc()

    # 2. AdamCodd
    if 'nsfw_image_robust' in models:
        try:
            image = Image.open(file_path)
            res = models['nsfw_image_robust'](image)
            raw_score = float(res[0]['score'])
            label = res[0]['label']
            nsfw_score = raw_score if label == "nsfw" else (1.0 - raw_score)
            scores.append(nsfw_score)
            print("AdamCodd score:", nsfw_score)
        except Exception as e:
            print("AdamCodd failed:")
            traceback.print_exc()

except Exception as e:
    print("Error:", e)
    traceback.print_exc()
