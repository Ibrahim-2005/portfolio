from sqlalchemy import Column, Integer, String
from app.core.database import Base

class CertificatesConfig(Base):
    __tablename__ = "certificates_config"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String, nullable=True)
