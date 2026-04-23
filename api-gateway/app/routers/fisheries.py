from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db

router = APIRouter(prefix="/fisheries", tags=["Fisheries"])


# ================= FISHING EFFORT =================

@router.get("/fishing-effort")
def get_fishing_effort(year:int=2023, db: Session = Depends(get_db)):

    result = db.execute(text("""
        SELECT latitude, longitude, fishing_hours
        FROM fishing_effort
        TABLESAMPLE SYSTEM (0.02)
        LIMIT 40000
    """))

    rows = result.fetchall()

    return [
        {
            "latitude": r.latitude,
            "longitude": r.longitude,
            "fishing_hours": r.fishing_hours
        }
        for r in rows
    ]


# ================= CAPTURE DATA =================

@router.get("/capture")
def get_capture(db: Session = Depends(get_db)):

    result = db.execute(text("""
        SELECT 
            "Country Name En",
            "2023 value",
            "2022 value",
            "2021 value",
            "2020 value"
        FROM fish_capture
        LIMIT 30000
    """))

    rows = result.fetchall()

    data = []

    for r in rows:
        data.append({
            "country": r[0],
            "2023": r[1],
            "2022": r[2],
            "2021": r[3],
            "2020": r[4]
        })

    return data


# ================= SPECIES DATA =================

@router.get("/species")
def get_species(db: Session = Depends(get_db)):

    result = db.execute(text("""
        SELECT *
        FROM fish_species
        LIMIT 50000
    """))

    rows = result.fetchall()

    return [dict(r._mapping) for r in rows]

# ================== TOP SPECIES ====================

@router.get("/top-species")
def get_top_species(db: Session = Depends(get_db)):

    result = db.execute(text("""
        SELECT species, SUM(pounds) as total_catch
        FROM noaa_landings
        WHERE confidentiality = 'Public'
        GROUP BY species
        ORDER BY total_catch DESC
        LIMIT 10
    """))

    rows = result.fetchall()

    return [
        {
            "species": r[0],
            "catch": float(r[1])
        }
        for r in rows
    ]

# =========================== SPECIES VALUE ==================== #

@router.get("/species-value")
def species_value(db: Session = Depends(get_db)):

    result = db.execute(text("""
        SELECT species,
               SUM(dollars) as value
        FROM noaa_landings
        WHERE dollars IS NOT NULL
        GROUP BY species
        ORDER BY value DESC
        LIMIT 8
    """))

    rows = result.fetchall()

    return [
        {"species": r[0], "value": float(r[1])}
        for r in rows
    ]

# ======================== YEARLYCATCH ================ #

@router.get("/yearly-catch")
def get_yearly_catch(db: Session = Depends(get_db)):

    result = db.execute(text("""
        SELECT year, SUM(pounds) as total_catch
        FROM noaa_landings
        WHERE confidentiality = 'Public'
        GROUP BY year
        ORDER BY year
    """))

    rows = result.fetchall()

    return [
        {
            "year": r[0],
            "catch": float(r[1])
        }
        for r in rows
    ]

# ===================== SPECIES SEARCH ============================== #

@router.get("/species-search")
def species_search(q: str, db: Session = Depends(get_db)):

    result = db.execute(text("""
        SELECT species,
               SUM(pounds) AS catch
        FROM noaa_landings
        WHERE LOWER(species) LIKE LOWER(:query)
        GROUP BY species
        ORDER BY catch DESC
        LIMIT 10
    """), {"query": f"%{q}%"})


    rows = result.fetchall()

    return [
        {"species": r[0], "value": float(r[1])}
        for r in rows
    ]

# ===================== total reacords ============================== #

@router.get("/total-records")
def get_fisheries_total(db: Session = Depends(get_db)):

    result = db.execute(text("""
        SELECT
        (SELECT COUNT(*) FROM fish_capture) +
        (SELECT COUNT(*) FROM fish_species) +
        (SELECT COUNT(*) FROM noaa_landings)
    """))

    total = result.scalar()

    return {"total": total}

# =================== countries count =================== #

@router.get("/countries-count")
def fishing_countries(db: Session = Depends(get_db)):

    result = db.execute(text("""
        SELECT COUNT(DISTINCT "Country Name En")
        FROM fish_capture
        WHERE "Country Name En" IS NOT NULL
    """))

    total = result.scalar()

    return {"count": total}

# =================== total effort =================== #

@router.get("/total-effort")
def total_fishing_effort(db: Session = Depends(get_db)):

    result = db.execute(text("""
        SELECT COALESCE(SUM(fishing_hours),0)
        FROM fishing_effort
        TABLESAMPLE SYSTEM (0.5)
    """))

    total = result.scalar()

    return {"effort": total}
