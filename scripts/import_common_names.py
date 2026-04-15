import pandas as pd
import psycopg2
from io import StringIO

print("Loading Taxon dataset...")

taxon = pd.read_csv(
    "data/biodiversity/Taxon.tsv",
    sep="\t",
    engine="python",
    on_bad_lines="skip"
)

taxon = taxon[["dwc:taxonID", "dwc:scientificName"]]

taxon.columns = ["taxon_id", "scientific_name"]

print("Taxon rows:", len(taxon))


print("Loading Vernacular names dataset...")

vernacular = pd.read_csv(
    "data/biodiversity/VernacularName.tsv",
    sep="\t",
    low_memory=False
)

vernacular = vernacular[vernacular["dcterms:language"] == "eng"]

vernacular = vernacular[["dwc:taxonID", "dwc:vernacularName"]]

vernacular.columns = ["taxon_id", "common_name"]

print("English names:", len(vernacular))


print("Merging datasets...")

merged = taxon.merge(vernacular, on="taxon_id")

merged = merged.drop_duplicates()

print("Mapped names:", len(merged))


conn = psycopg2.connect(
    host="localhost",
    database="marine_db",
    user="marine",
    password="marine123",
    port=5432
)

cur = conn.cursor()

print("Creating temporary table...")

cur.execute("""
DROP TABLE IF EXISTS temp_common_names;

CREATE TEMP TABLE temp_common_names (
    scientific_name TEXT,
    common_name TEXT
)
""")

conn.commit()


buffer = StringIO()

merged[["scientific_name", "common_name"]].to_csv(
    buffer,
    index=False,
    header=False,
    sep="\t"
)

buffer.seek(0)

print("Copying into PostgreSQL...")

cur.copy_from(
    buffer,
    "temp_common_names",
    sep="\t",
    columns=("scientific_name", "common_name")
)

conn.commit()


print("Updating biodiversity table...")

cur.execute("""
UPDATE marine_biodiversity m
SET common_name = t.common_name
FROM temp_common_names t
WHERE m.scientific_name = t.scientific_name
""")

conn.commit()

print("Common names successfully linked!")

cur.close()
conn.close()