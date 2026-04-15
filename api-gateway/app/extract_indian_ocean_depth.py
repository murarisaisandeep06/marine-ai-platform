from netCDF4 import Dataset
import numpy as np

print("Opening GEBCO dataset...")
ds = Dataset("/data/GEBCO_2024.nc")

lats = ds.variables["lat"][:]
lons = ds.variables["lon"][:]
elevation = ds.variables["elevation"]

print("Finding Indian Ocean bounds...")

lat_mask = (lats >= -40) & (lats <= 30)
lon_mask = (lons >= 20) & (lons <= 120)

lat_indices = np.where(lat_mask)[0]
lon_indices = np.where(lon_mask)[0]

subset = elevation[lat_indices.min():lat_indices.max()+1,
                   lon_indices.min():lon_indices.max()+1]

print("Creating new NetCDF file...")

new_ds = Dataset("/data/gebco_indian_ocean.nc", "w")

new_ds.createDimension("lat", len(lat_indices))
new_ds.createDimension("lon", len(lon_indices))

lat_var = new_ds.createVariable("lat", "f4", ("lat",))
lon_var = new_ds.createVariable("lon", "f4", ("lon",))
elev_var = new_ds.createVariable("elevation", "f4", ("lat", "lon"))

lat_var[:] = lats[lat_indices]
lon_var[:] = lons[lon_indices]
elev_var[:] = subset

new_ds.close()
ds.close()

print("Indian Ocean depth extraction complete.")