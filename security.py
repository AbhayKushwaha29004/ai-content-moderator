"""
Security utilities for API authentication and authorization
"""
from fastapi import HTTPException, status, Header
from typing import Optional
import logging
from config import settings

logger = logging.getLogger(__name__)


def verify_api_key(x_api_key: Optional[str] = Header(None)) -> str:
    """
    Verify API key from request header
    
    Args:
        x_api_key: API key from X-API-Key header
    
    Returns:
        API key if valid
    
    Raises:
        HTTPException: If API key is invalid or missing
    """
    if not x_api_key:
        # API key is optional in development
        if settings.DEBUG:
            return "development"
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key required in X-API-Key header"
        )
    
    if x_api_key != settings.API_KEY:
        logger.warning(f"Invalid API key attempt: {x_api_key[:10]}...")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key"
        )
    
    return x_api_key


def is_admin_key(api_key: str) -> bool:
    """
    Check if API key has admin privileges
    
    Args:
        api_key: API key to verify
    
    Returns:
        True if admin key, False otherwise
    """
    return api_key == settings.API_KEY


def hash_api_key(api_key: str) -> str:
    """
    Hash API key for storage
    
    Args:
        api_key: Plain text API key
    
    Returns:
        Hashed API key
    """
    import hashlib
    return hashlib.sha256(api_key.encode()).hexdigest()


def verify_hashed_api_key(plain_key: str, hashed_key: str) -> bool:
    """
    Verify plain key against hashed key
    
    Args:
        plain_key: Plain text API key
        hashed_key: Hashed API key
    
    Returns:
        True if keys match, False otherwise
    """
    return hash_api_key(plain_key) == hashed_key


class SecurityHeaders:
    """Security headers for responses"""
    
    HEADERS = {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        "Content-Security-Policy": "default-src 'self'"
    }
    
    @staticmethod
    def get_headers() -> dict:
        """Get security headers"""
        return SecurityHeaders.HEADERS


def rate_limit_check(client_ip: str, max_requests: int = 100, window_seconds: int = 60) -> bool:
    """
    Check if client has exceeded rate limit
    (Simple in-memory implementation - use Redis for production)
    
    Args:
        client_ip: Client IP address
        max_requests: Max requests allowed
        window_seconds: Time window in seconds
    
    Returns:
        True if within limit, False if exceeded
    """
    # In production, use Redis or similar
    # This is a placeholder implementation
    return True


def validate_request_size(content_length: Optional[int], max_size: int) -> bool:
    """
    Validate request content size
    
    Args:
        content_length: Content-Length header value
        max_size: Maximum allowed size in bytes
    
    Returns:
        True if valid, False if too large
    """
    if content_length is None:
        return True
    return content_length <= max_size


def sanitize_input(user_input: str, max_length: int = 5000) -> str:
    """
    Sanitize user input
    
    Args:
        user_input: User provided input
        max_length: Maximum allowed length
    
    Returns:
        Sanitized input
    """
    if not user_input:
        return ""
    
    # Truncate if too long
    user_input = user_input[:max_length]
    
    # Remove null bytes
    user_input = user_input.replace('\x00', '')
    
    return user_input.strip()


def create_cors_headers() -> dict:
    """Create CORS headers"""
    return {
        "Access-Control-Allow-Origin": ", ".join(settings.CORS_ORIGINS),
        "Access-Control-Allow-Credentials": str(settings.CORS_CREDENTIALS).lower(),
        "Access-Control-Allow-Methods": ", ".join(settings.CORS_METHODS),
        "Access-Control-Allow-Headers": ", ".join(settings.CORS_HEADERS)
    }


def log_security_event(event_type: str, details: dict):
    """
    Log security-related events
    
    Args:
        event_type: Type of security event
        details: Event details
    """
    logger.warning(f"SECURITY EVENT: {event_type} - {details}")


def is_valid_submission_id(submission_id: str) -> bool:
    """
    Validate submission ID format
    
    Args:
        submission_id: Submission ID to validate
    
    Returns:
        True if valid format, False otherwise
    """
    if not submission_id or len(submission_id) == 0:
        return False
    
    # Check if it matches expected format (sub_xxxxxxxx)
    if submission_id.startswith("sub_") and len(submission_id) > 4:
        return True
    
    return False