from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text, func
from typing import Optional
from ..database import SessionLocal
from .. import models, schemas

router = APIRouter(prefix="/ocean", tags=["Ocean"])


# ================= DB =================

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ================= CREATE =================

@router.post("/")
def create_ocean_data(data: schemas.OceanDataCreate, db: Session = Depends(get_db)):
    db_data = models.OceanData(**data.dict())
    db.add(db_data)
    db.commit()
    db.refresh(db_data)
    return db_data


# ================= GET DATA =================

@router.get("/")
def get_ocean_data(
    lat: Optional[float] = None,
    lon: Optional[float] = None,
    limit: int = Query(1000, le=50000),
    db: Session = Depends(get_db)
):

    # ✅ Nearest point (optimized)
    if lat is not None and lon is not None:

        result = db.execute(text("""
            SELECT *
            FROM ocean_data
            ORDER BY 
                (latitude - :lat)*(latitude - :lat) +
                (longitude - :lon)*(longitude - :lon)
            LIMIT 1
        """), {"lat": lat, "lon": lon})

        row = result.fetchone()
        return [dict(row._mapping)] if row else []

    # ✅ FAST sampling (NO random())
    result = db.execute(text(f"""
        SELECT *
        FROM ocean_data
        TABLESAMPLE SYSTEM (0.5)
        LIMIT {limit}
    """))

    rows = result.fetchall()
    return [dict(r._mapping) for r in rows]


# ================= STATS =================

@router.get("/stats")
def get_ocean_stats(db: Session = Depends(get_db)):

    # ✅ FAST aggregated query (single query)
    result = db.query(
        func.avg(models.OceanData.temperature),
        func.max(models.OceanData.temperature),
        func.avg(models.OceanData.depth),
    ).one()

    # ✅ FAST approximate count (no full scan)
    total = db.execute(text("""
        SELECT reltuples::bigint AS estimate
        FROM pg_class
        WHERE relname = 'ocean_data'
    """)).scalar()

    # ✅ region count
    region_count = db.query(models.OceanData.region).distinct().count()

    return {
        "total_records": int(total) if total else 0,
        "avg_temperature": round(result[0], 2) if result[0] else None,
        "max_temperature": round(result[1], 2) if result[1] else None,
        "avg_depth": round(result[2], 2) if result[2] else None,
        "region_count": region_count
    }
