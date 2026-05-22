"""
Database configuration and models
"""
from sqlalchemy import create_engine, Column, Integer, String, Float, JSON, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from config import settings

# Database setup
DATABASE_URL = settings.DATABASE_URL

print(f"[DB] Connecting to database: {DATABASE_URL}")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# Database Models
class ContentSubmission(Base):
    """Store submitted content (text/images)"""
    __tablename__ = "content_submissions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    content_type = Column(String(50), nullable=False)  # 'text', 'image'
    content_text = Column(Text, nullable=True)
    file_path = Column(String(500), nullable=True, default="")
    file_name = Column(String(500), nullable=True, default="")
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<ContentSubmission(id={self.id}, type={self.content_type})>"


class ModerationResult(Base):
    """Store moderation results"""
    __tablename__ = "moderation_results"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    submission_id = Column(Integer, index=True, nullable=False)
    classifier_results = Column(JSON, nullable=True)
    overall_status = Column(String(50), default="APPROVED")  # APPROVED, FLAGGED, NEEDS_REVIEW
    # Keep legacy columns for compatibility
    violence_score = Column(Float, default=0.0)
    adult_content_score = Column(Float, default=0.0)
    hate_speech_score = Column(Float, default=0.0)
    self_harm_score = Column(Float, default=0.0)
    misinformation_score = Column(Float, default=0.0)
    child_safety_score = Column(Float, default=0.0)
    overall_risk_level = Column(String(50), default="LOW")  # LOW, MEDIUM, HIGH
    result_details = Column(JSON, nullable=True)
    moderated_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<ModerationResult(submission_id={self.submission_id}, status={self.overall_status})>"


class ManualReview(Base):
    """Store manual review decisions"""
    __tablename__ = "manual_reviews"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    submission_id = Column(Integer, index=True, nullable=False)
    reason = Column(Text, nullable=True)
    reviewer_id = Column(String(100), nullable=True)
    review_decision = Column(String(50), nullable=True)  # APPROVE, REJECT, FLAG
    review_notes = Column(Text, nullable=True)
    confidence_override = Column(Float, nullable=True)
    flagged_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<ManualReview(submission_id={self.submission_id}, decision={self.review_decision})>"


# Database initialization function
def init_db():
    """Initialize database tables"""
    try:
        Base.metadata.create_all(bind=engine)
        print("[OK] Database tables created successfully!")
    except Exception as e:
        print(f"[ERROR] Database initialization error: {str(e)}")


# Dependency for getting database session
def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Initialize on import
if __name__ != "__main__":
    try:
        init_db()
    except Exception as e:
        print(f"[WARN] Database initialization: {str(e)}")