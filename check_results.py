import sqlite3
import json

conn = sqlite3.connect("content_moderation.db")
cursor = conn.cursor()

# Get all columns from content_submissions and moderation_results
cursor.execute("""
SELECT cs.id, cs.content_type, cs.file_name, mr.overall_status, mr.classifier_results
FROM content_submissions cs
LEFT JOIN moderation_results mr ON cs.id = mr.submission_id
ORDER BY cs.id DESC
LIMIT 5
""")

rows = cursor.fetchall()
for row in rows:
    print(f"ID: {row[0]}")
    print(f"Type: {row[1]}")
    print(f"File Name: {row[2]}")
    print(f"Status: {row[3]}")
    try:
        results = json.loads(row[4]) if isinstance(row[4], str) else row[4]
        print(f"Results: {json.dumps(results, indent=2)}")
    except Exception as e:
        print(f"Results error: {e}, raw: {row[4]}")
    print("-" * 40)

conn.close()
