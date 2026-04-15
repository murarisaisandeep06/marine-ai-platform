import pandas as pd
import os

DATA_FOLDER = "data/fishing_effort"

all_files = []

for file in os.listdir(DATA_FOLDER):
    if file.endswith(".csv"):
        path = os.path.join(DATA_FOLDER, file)
        print("Reading:", file)

        df = pd.read_csv(path)

        # keep only needed columns
        df = df[["cell_ll_lat","cell_ll_lon","fishing_hours"]]

        df = df.rename(columns={
            "cell_ll_lat":"latitude",
            "cell_ll_lon":"longitude"
        })

        all_files.append(df)

merged = pd.concat(all_files, ignore_index=True)

print("Total records:", len(merged))

merged.to_csv("data/fishing_effort_combined.csv", index=False)

print("Merged dataset saved")