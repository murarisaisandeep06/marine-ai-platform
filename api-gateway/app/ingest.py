import csv
from .database import SessionLocal
from .models import OceanData

def ingest_ocean_data(file_path):
    db = SessionLocal()

    with open(file_path, newline='') as csvfile:
        reader = csv.DictReader(csvfile)

        for row in reader:
            record = OceanData(
                region=row["region"],
                latitude=float(row["latitude"]),
                longitude=float(row["longitude"]),
                temperature=float(row["temperature"]),
                salinity=float(row["salinity"]),
                depth=float(row["depth"])
            )

            db.add(record)

    db.commit()
    db.close()
    print("Data ingestion complete.")


if __name__ == "__main__":
    ingest_ocean_data("/data/ocean_sample.csv")