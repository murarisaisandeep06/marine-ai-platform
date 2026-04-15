import pandas as pd
from sqlalchemy import create_engine

DATABASE_URL = "postgresql://marine:marine123@localhost:5432/marine_db"

print("Loading fish species dataset...")

df = pd.read_csv("data/Fish.csv")

engine = create_engine(DATABASE_URL)

print("Inserting species data...")

df.to_sql("fish_species", engine, if_exists="replace", index=False)

print("Fish species inserted!")