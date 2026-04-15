from netCDF4 import Dataset
import numpy as np
from app.database import SessionLocal
from app.models import OceanData


def classify_ocean(lat, lon):

    # Indian Ocean
    if -40 <= lat <= 30 and 20 <= lon <= 120:
        return "Indian Ocean"

    # Atlantic Ocean
    if -60 <= lat <= 70 and -100 <= lon <= 20:
        return "Atlantic Ocean"

    # Pacific Ocean
    if -60 <= lat <= 65 and (lon >= 120 or lon <= -70):
        return "Pacific Ocean"

    # Southern Ocean
    if lat < -40:
        return "Southern Ocean"

    # Arctic Ocean
    if lat > 66:
        return "Arctic Ocean"

    return "Other Ocean"

def ingest_sst(file_path):
    print("Opening NetCDF file...")

    ds = Dataset(file_path)

    lats = ds.variables["lat"][:]
    lons = ds.variables["lon"][:]

    sst_var = ds.variables["sst"]

    if len(sst_var.shape) == 4:
        sst = sst_var[0, 0, :, :]
    elif len(sst_var.shape) == 3:
        sst = sst_var[0, :, :]
    else:
        raise Exception("Unexpected SST dimensions")

    db = SessionLocal()

    print("Processing global SST grid...")

    count = 0

    for i, lat in enumerate(lats):
        for j, lon in enumerate(lons):

            temp = sst[i, j]

            if np.ma.is_masked(temp):
                continue

            temp = float(np.asarray(temp))

            region = classify_ocean(float(lat), float(lon))

            record = OceanData(
                latitude=float(lat),
                longitude=float(lon),
                temperature=temp,
                depth=0,
                region=region
            )

            db.add(record)
            count += 1

            if count % 10000 == 0:
                db.commit()
                print(f"{count} records inserted...")

    db.commit()
    db.close()

    print("Finished ingestion successfully.")

if __name__ == "__main__":
    ingest_sst("/data/avhrr-only-v2.20200101.nc")
