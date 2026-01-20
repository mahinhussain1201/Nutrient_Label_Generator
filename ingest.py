import os
import json
import psycopg2
from tqdm import tqdm
from dotenv import load_dotenv

load_dotenv()  # Load environment variables

DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")

conn = psycopg2.connect(
    dbname=DB_NAME,
    user=DB_USER,
    password=DB_PASSWORD,
    host=DB_HOST,
    port=DB_PORT
)
cur = conn.cursor()

# Drop old table and create new
cur.execute("DROP TABLE IF EXISTS food_json;")
cur.execute("""
CREATE TABLE food_json (
    data JSONB NOT NULL
);
""")
conn.commit()

# Insert in batches with progress bar
batch_size = 5000
batch = []

file_path = "/Users/mahinhussain/Desktop/Nutritional Label Generator/nutrient.json"

# First, count lines for tqdm
print("Counting total lines...")
with open(file_path, "r", encoding="utf-8") as f:
    total_lines = sum(1 for _ in f)
print(f"Total rows: {total_lines}")

with open(file_path, "r", encoding="utf-8") as f, tqdm(total=total_lines, desc="Inserting JSON") as pbar:
    for line in f:
        obj = json.loads(line.strip())
        batch.append((json.dumps(obj),))  # tuple for execute

        if len(batch) >= batch_size:
            args_str = ','.join(cur.mogrify("(%s::jsonb)", x).decode("utf-8") for x in batch)
            cur.execute(f"INSERT INTO food_json(data) VALUES {args_str}")
            batch = []
            conn.commit()
            pbar.update(batch_size)

    # Insert remaining
    if batch:
        args_str = ','.join(cur.mogrify("(%s::jsonb)", x).decode("utf-8") for x in batch)
        cur.execute(f"INSERT INTO food_json(data) VALUES {args_str}")
        conn.commit()
        pbar.update(len(batch))

cur.close()
conn.close()

print("✅ JSON ingestion completed successfully!")




# nutrition_db= SELECT
#   data->>'orig_source_name' AS nutrient,
#   data->>'standard_content' AS value,
#   data->>'orig_unit' AS unit
# FROM food_json
# WHERE LOWER(data->>'orig_food_common_name') = 'carrot'
#   AND data->>'source_type' = 'Nutrient';