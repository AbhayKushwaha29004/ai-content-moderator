from PIL import Image
from transformers import pipeline
import sys

try:
    img_path = "uploads/1779226485_Screenshot 2026-05-19 000650.png"
    print(f"Opening image: {img_path}")
    image = Image.open(img_path)
    
    print("\n--- Model 1: Falconsai/nsfw_image_detection ---")
    model1 = pipeline("image-classification", model="Falconsai/nsfw_image_detection", device=-1)
    result1 = model1(image)
    print(result1)
    
    print("\n--- Model 2: AdamCodd/vit-base-nsfw-detector ---")
    model2 = pipeline("image-classification", model="AdamCodd/vit-base-nsfw-detector", device=-1)
    result2 = model2(image)
    print(result2)
    
except Exception as e:
    print("Error:", e)
