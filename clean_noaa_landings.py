import pandas as pd

print("Loading Indian Ocean dataset...")

occ = pd.read_csv(
    "data/biodiversity/indian_ocean.csv",
    sep="\t",
    on_bad_lines="skip",
    low_memory=False
)

# remove dwc prefix if present
occ.columns = occ.columns.str.replace("dwc:", "", regex=False)

# detect species column
species_col = "species" if "species" in occ.columns else "scientificName"

# keep only required columns
occ = occ[
    [
        species_col,
        "family",
        "decimalLatitude",
        "decimalLongitude",
        "countryCode"
    ]
]

# rename columns
occ.columns = [
    "species",
    "family",
    "latitude",
    "longitude",
    "country"
]

print("Indian Ocean records:", len(occ))

print("Loading Taxon dataset...")

tax = pd.read_csv(
    "data/biodiversity/Taxon.tsv",
    sep="\t",
    on_bad_lines="skip",
    low_memory=False
)

tax.columns = tax.columns.str.replace("dwc:", "", regex=False)

tax = tax[["taxonID","scientificName"]]

print("Loading Vernacular names...")

vern = pd.read_csv(
    "data/biodiversity/VernacularName.tsv",
    sep="\t",
    on_bad_lines="skip",
    low_memory=False
)

vern.columns = vern.columns.str.replace("dwc:", "", regex=False)

# detect language column
lang_col = None
for c in vern.columns:
    if "language" in c.lower():
        lang_col = c
        break

# keep only English names
if lang_col:
    vern = vern[vern[lang_col] == "eng"]

vern = vern[["taxonID","vernacularName"]]

print("Building scientificName → common name mapping...")

name_map = tax.merge(
    vern,
    on="taxonID",
    how="left"
)

name_map = name_map[["scientificName","vernacularName"]]

name_map.columns = [
    "species",
    "common_name"
]

print("Merging common names into Indian Ocean dataset...")

merged = occ.merge(
    name_map,
    on="species",
    how="left"
)

clean = merged[
    [
        "species",
        "common_name",
        "family",
        "latitude",
        "longitude",
        "country"
    ]
]

# remove invalid coordinates
clean = clean.dropna(subset=["latitude","longitude"])
clean = clean[(clean.latitude != 0) & (clean.longitude != 0)]

# remove duplicates
clean = clean.drop_duplicates()

print("Final dataset size:", len(clean))

print("Saving cleaned dataset...")

clean.to_csv(
    "data/biodiversity/indian_ocean_final.csv",
    index=False
)

print("Dataset saved at:")
print("data/biodiversity/indian_ocean_final.csv")