import sqlite3
import json

conn = sqlite3.connect("content_moderation.db")
cursor = conn.cursor()

cursor.execute("""
SELECT cs.id, cs.content_type, cs.file_name, mr.overall_status, mr.classifier_results
FROM content_submissions cs
LEFT JOIN moderation_results mr ON cs.id = mr.submission_id
ORDER BY cs.id DESC
LIMIT 10
""")

rows = cursor.fetchall()
for row in rows:
    print(f"ID: {row[0]}")
    print(f"Type: {row[1]}")
    print(f"File Name: {row[2]}")
    print(f"Status: {row[3]}")
    try:
        results = json.loads(row[4]) if isinstance(row[4], str) else row[4]
        # Summarize results to make it shorter but informative
        if isinstance(results, dict):
            summary = {k: v.get("score") for k, v in results.items() if isinstance(v, dict)}
            print(f"Scores: {summary}")
        else:
            print(f"Results: {results}")
    except Exception as e:
        print(f"Results error: {e}, raw: {row[4]}")
    print("-" * 40)

conn.close()
