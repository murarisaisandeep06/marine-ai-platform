from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import engine, get_db

router = APIRouter(prefix="/biodiversity", tags=["Biodiversity"])


# 🌍 Species locations for map
@router.get("/species")
def get_species():
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT
                species,
                common_name,
                genus,
                family,
                latitude,
                longitude,
                country
            FROM marine_biodiversity
            WHERE latitude IS NOT NULL
            AND longitude IS NOT NULL
            ORDER BY RANDOM()
            LIMIT 70000
        """))

        return [dict(r._mapping) for r in result]


# 📊 Biodiversity hotspots
@router.get("/hotspots")
def biodiversity_hotspots():
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT
                country,
                COUNT(DISTINCT species) as species_count
            FROM marine_biodiversity
            WHERE country IS NOT NULL
            GROUP BY country
            ORDER BY species_count DESC
            LIMIT 2000
        """))

        return [dict(r._mapping) for r in result]


# 🔎 Search species
@router.get("/search")
def search_species(name: str):
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT
                species,
                common_name,
                genus,
                family,
                latitude,
                longitude,
                country
            FROM marine_biodiversity
            WHERE species ILIKE :name
               OR common_name ILIKE :name
               OR genus ILIKE :name
               OR family ILIKE :name
            LIMIT 100
        """), {"name": f"%{name}%"})

        return [dict(r._mapping) for r in result]

# =================== total records ===================#

@router.get("/total-records")
def get_biodiversity_total(db: Session = Depends(get_db)):

    result = db.execute(text("""
        SELECT
        (SELECT COUNT(*) FROM biodiversity_data) +
        (SELECT COUNT(*) FROM marine_biodiversity)
    """))

    total = result.scalar()

    return {"total": total}

# =================== total effort =================== #

@router.get("/total-effort")
def total_fishing_effort(db: Session = Depends(get_db)):

    result = db.execute(text("""
        SELECT COALESCE(SUM(fishing_hours),0)
        FROM fishing_effort
        WHERE fishing_hours IS NOT NULL
    """))

    total = result.scalar()

    return {"effort": total}