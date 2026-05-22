"""
Pydantic models for API request/response validation
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# ============================================
# REQUEST MODELS
# ============================================

class SubmissionRequest(BaseModel):
    """Text moderation request"""
    text: str = Field(..., min_length=1, max_length=5000, description="Text to moderate")
    
    class Config:
        json_schema_extra = {
            "example": {
                "text": "This is content to be moderated"
            }
        }


class BatchRequest(BaseModel):
    """Batch moderation request"""
    submissions: List[str] = Field(..., min_items=1, max_items=100, description="List of texts to moderate")
    
    class Config:
        json_schema_extra = {
            "example": {
                "submissions": [
                    "Content 1",
                    "Content 2",
                    "Content 3"
                ]
            }
        }


class ManualReviewRequest(BaseModel):
    """Manual review request"""
    submission_id: str = Field(..., description="Submission ID to review")
    review_decision: str = Field(..., description="APPROVE, REJECT, or FLAG")
    review_notes: Optional[str] = Field(None, description="Reviewer notes")
    confidence_override: Optional[float] = Field(None, ge=0, le=1, description="Override confidence score")
    
    class Config:
        json_schema_extra = {
            "example": {
                "submission_id": "sub_123456",
                "review_decision": "APPROVE",
                "review_notes": "Content is safe",
                "confidence_override": 0.95
            }
        }


# ============================================
# RESPONSE MODELS
# ============================================

class ClassifierScores(BaseModel):
    """Individual classifier scores"""
    hate_speech: float = Field(0.0, ge=0, le=1, description="Hate speech score (0-1)")
    violence: float = Field(0.0, ge=0, le=1, description="Violence score (0-1)")
    adult_content: float = Field(0.0, ge=0, le=1, description="Adult content score (0-1)")
    self_harm: float = Field(0.0, ge=0, le=1, description="Self-harm score (0-1)")
    misinformation: float = Field(0.0, ge=0, le=1, description="Misinformation score (0-1)")
    child_safety: float = Field(0.0, ge=0, le=1, description="Child safety risk score (0-1)")


class ModerationResponse(BaseModel):
    """Moderation response"""
    submission_id: str = Field(..., description="Unique submission ID")
    content_type: str = Field(..., description="Type of content (text/image/video)")
    results: Dict[str, Any] = Field(..., description="Moderation results from all classifiers")
    timestamp: datetime = Field(default_factory=datetime.now, description="Response timestamp")
    
    class Config:
        json_schema_extra = {
            "example": {
                "submission_id": "sub_123456",
                "content_type": "text",
                "results": {
                    "hate_speech": 0.15,
                    "violence": 0.08,
                    "adult_content": 0.12,
                    "self_harm": 0.05,
                    "misinformation": 0.20,
                    "child_safety": 0.03,
                    "risk_level": "LOW",
                    "overall_score": 0.20
                },
                "timestamp": "2026-05-18T00:15:00"
            }
        }


class BatchModerationResponse(BaseModel):
    """Batch moderation response"""
    total_submissions: int = Field(..., description="Total submissions in batch")
    processed: int = Field(..., description="Number successfully processed")
    results: List[Dict[str, Any]] = Field(..., description="Results for each submission")
    timestamp: str = Field(..., description="Response timestamp")
    
    class Config:
        json_schema_extra = {
            "example": {
                "total_submissions": 3,
                "processed": 3,
                "results": [
                    {
                        "submission_id": "sub_001",
                        "text": "Content 1",
                        "results": {
                            "hate_speech": 0.1,
                            "violence": 0.05,
                            "risk_level": "LOW"
                        }
                    }
                ],
                "timestamp": "2026-05-18T00:15:00"
            }
        }


class StatisticsResponse(BaseModel):
    """Statistics response"""
    total_submissions: int = Field(..., description="Total submissions processed")
    average_scores: Dict[str, float] = Field(..., description="Average scores per classifier")
    high_risk_count: int = Field(..., description="Number of high-risk submissions")
    timestamp: str = Field(..., description="Response timestamp")
    
    class Config:
        json_schema_extra = {
            "example": {
                "total_submissions": 100,
                "average_scores": {
                    "hate_speech": 0.15,
                    "violence": 0.12,
                    "adult_content": 0.18,
                    "self_harm": 0.05,
                    "misinformation": 0.22,
                    "child_safety": 0.08
                },
                "high_risk_count": 12,
                "timestamp": "2026-05-18T00:15:00"
            }
        }


class HealthResponse(BaseModel):
    """Health check response"""
    status: str = Field(..., description="Status message")
    version: str = Field(..., description="API version")
    timestamp: str = Field(..., description="Response timestamp")


class ErrorResponse(BaseModel):
    """Error response"""
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Error details")
    timestamp: str = Field(..., description="Error timestamp")
    
    class Config:
        json_schema_extra = {
            "example": {
                "error": "Invalid request",
                "detail": "Text cannot be empty",
                "timestamp": "2026-05-18T00:15:00"
            }
        }


# ============================================
# UTILITY MODELS
# ============================================

class ContentItem(BaseModel):
    """Individual content item"""
    submission_id: str
    content_type: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class ModificationResult(BaseModel):
    """Moderation result detail"""
    submission_id: str
    violence_score: float
    adult_content_score: float
    hate_speech_score: float
    self_harm_score: float
    misinformation_score: float
    child_safety_score: float
    overall_risk_level: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class ReviewItem(BaseModel):
    """Manual review item"""
    submission_id: str
    reviewer_id: Optional[str]
    review_decision: str
    review_notes: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True