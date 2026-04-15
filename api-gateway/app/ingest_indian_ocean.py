import pandas as pd
from sqlalchemy import text
from app.database import engine

df = pd.read_csv("data/biodiversity/indian_ocean.csv")

# Rename columns if needed
df = df.rename(columns={
    "scientificName": "species",
    "decimalLatitude": "latitude",
    "decimalLongitude": "longitude",
    "countryCode": "country"
})

df = df.dropna(subset=["latitude","longitude"])

with engine.begin() as conn:
    for _, row in df.iterrows():
        conn.execute(text("""
        INSERT INTO marine_biodiversity
        (species, latitude, longitude, country)
        VALUES (:species, :lat, :lon, :country)
        """), {
            "species": row.get("species","Unknown"),
            "lat": float(row["latitude"]),
            "lon": float(row["longitude"]),
            "country": row.get("country","Indian Ocean")
        })

print("Indian Ocean biodiversity inserted!")