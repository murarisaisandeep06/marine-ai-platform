from netCDF4 import Dataset
import numpy as np
from app.database import SessionLocal
from app.models import OceanData

print("Loading GEBCO Indian Ocean depth...")

ds = Dataset("/data/gebco_indian_ocean.nc")

depth_lats = ds.variables["lat"][:]
depth_lons = ds.variables["lon"][:]
elevation = ds.variables["elevation"][:]

db = SessionLocal()

print("Updating depth values in batches...")

batch_size = 5000
offset = 0
total_updated = 0

while True:
    records = (
        db.query(OceanData)
        .offset(offset)
        .limit(batch_size)
        .all()
    )

    if not records:
        break

    for record in records:
        lat = record.latitude
        lon = record.longitude

        lat_idx = (np.abs(depth_lats - lat)).argmin()
        lon_idx = (np.abs(depth_lons - lon)).argmin()

        depth_value = elevation[lat_idx, lon_idx]

        record.depth = float(depth_value)

    db.commit()

    total_updated += len(records)
    offset += batch_size

    print(f"{total_updated} records updated...")

db.close()
print("Depth update complete.")