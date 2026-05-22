from transformers import pipeline

try:
    print("Loading zero-shot classifier...")
    classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli", device=-1)
    
    text_input = "I will hunt you down and destroy you with a weapon."
    
    labels = ["violent, graphic, or threatening", "peaceful and safe", "neutral, professional, or tabular data"]
    print("Running classification with 3 labels on violent text...")
    res = classifier(text_input, labels)
    print("Result Labels:", res['labels'])
    print("Result Scores:", res['scores'])
    
except Exception as e:
    print("Error:", e)
