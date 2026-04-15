import pandas as pd
from sqlalchemy import create_engine

DATABASE_URL = "postgresql://marine:marine123@localhost:5432/marine_db"

print("Loading capture dataset...")

df = pd.read_csv("data/capture_quantity.csv")

engine = create_engine(DATABASE_URL)

print("Inserting into database...")

df.to_sql("fish_capture", engine, if_exists="replace", index=False)

print("Capture dataset inserted!")