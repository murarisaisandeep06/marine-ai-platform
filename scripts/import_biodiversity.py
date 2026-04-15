import pandas as pd
import psycopg2

print("Loading biodiversity dataset...")

df = pd.read_csv(
    "data/biodiversity/marine_biodiversity_raw.csv",
    sep="\t",
    low_memory=False
)

print("Filtering required columns...")

df = df[
    [
        "scientificName",
        "decimalLatitude",
        "decimalLongitude",
        "eventDate",
        "countryCode",
        "family",
        "genus",
        "species"
    ]
]

df = df.rename(
    columns={
        "scientificName": "scientific_name",
        "decimalLatitude": "latitude",
        "decimalLongitude": "longitude",
        "eventDate": "event_date",
        "countryCode": "country"
    }
)

# Remove rows without coordinates
df = df.dropna(subset=["latitude", "longitude"])

# Convert dates
df["event_date"] = pd.to_datetime(df["event_date"], errors="coerce")

# Convert NaT → None for PostgreSQL
df["event_date"] = df["event_date"].where(df["event_date"].notnull(), None)

print("Rows to import:", len(df))

conn = psycopg2.connect(
    host="localhost",
    database="marine_db",
    user="marine",
    password="marine123",
    port=5432
)

cur = conn.cursor()

for _, row in df.iterrows():

    event_date = row["event_date"]

    # convert NaT to None
    if pd.isna(event_date):
        event_date = None

    cur.execute(
        """
        INSERT INTO marine_biodiversity
        (scientific_name, latitude, longitude, event_date, country, family, genus, species)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
        """,
        (
            row["scientific_name"],
            row["latitude"],
            row["longitude"],
            event_date,
            row["country"],
            row["family"],
            row["genus"],
            row["species"]
        )
    )

conn.commit()

cur.close()
conn.close()

print("✅ Biodiversity data imported successfully!")