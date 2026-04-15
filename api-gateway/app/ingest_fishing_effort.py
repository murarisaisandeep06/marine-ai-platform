import pandas as pd
from sqlalchemy import create_engine

DATABASE_URL = "postgresql://marine:marine123@localhost:5432/marine_db"

engine = create_engine(DATABASE_URL)

print("Loading merged dataset...")

chunksize = 100000   # 100k rows per batch (stable)

for chunk in pd.read_csv(
    "data/fishing_effort_combined.csv",
    chunksize=chunksize
):

    chunk = chunk[["latitude", "longitude", "fishing_hours"]]

    chunk.to_sql(
        "fishing_effort",
        engine,
        if_exists="append",
        index=False,
        method="multi"
    )

    print("Inserted", len(chunk), "rows")

print("Finished inserting dataset")