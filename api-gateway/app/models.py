from sqlalchemy import Column, Integer, Float, String, Index
from .database import Base

class OceanData(Base):
    __tablename__ = "ocean_data"

    id = Column(Integer, primary_key=True, index=True)

    latitude = Column(Float, index=True)
    longitude = Column(Float, index=True)

    temperature = Column(Float)
    depth = Column(Float)

    region = Column(String)

# Composite index for geo queries
Index("idx_lat_lon", OceanData.latitude, OceanData.longitude)


class FisheriesData(Base):
    __tablename__ = "fisheries_data"

    id = Column(Integer, primary_key=True, index=True)
    species = Column(String)
    region = Column(String)
    catch_volume = Column(Float)
    year = Column(Integer)


class BiodiversityData(Base):
    __tablename__ = "biodiversity_data"

    id = Column(Integer, primary_key=True, index=True)
    species_detected = Column(String)
    region = Column(String)
    confidence_score = Column(Float)