from pydantic_settings import BaseSettings
from pathlib import Path
import os

class Settings(BaseSettings):
    """Application settings"""
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = ENVIRONMENT == "development"
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./content_moderation.db"
    )
    
    # Paths
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    MODEL_DIR: str = os.getenv("MODEL_DIR", "./models")
    
    # API Settings
    API_TITLE: str = "Content Moderation AI"
    API_VERSION: str = "1.0.0"
    API_DESCRIPTION: str = "Detect harmful content with 6 advanced classifiers"
    
    # ML Settings
    MODEL_DEVICE: str = "cuda" if os.getenv("USE_CUDA", "false").lower() == "true" else "cpu"
    MAX_UPLOAD_SIZE: int = 50 * 1024 * 1024  # 50MB
    
    # Moderation thresholds
    HATE_SPEECH_THRESHOLD: float = 0.7
    TOXICITY_THRESHOLD: float = 0.7
    NSFW_THRESHOLD: float = 0.7
    SPAM_THRESHOLD: float = 0.7
    VIOLENCE_THRESHOLD: float = 0.7
    MISINFORMATION_THRESHOLD: float = 0.7
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create settings instance
settings = Settings()

# Log settings on load
if __name__ != "__main__":
    print(f"[OK] Configuration loaded - Environment: {settings.ENVIRONMENT}")
    print(f"   Database: {settings.DATABASE_URL}")
    print(f"   Upload Dir: {settings.UPLOAD_DIR}")
    print(f"   Model Dir: {settings.MODEL_DIR}")
    print(f"   Device: {settings.MODEL_DEVICE}")