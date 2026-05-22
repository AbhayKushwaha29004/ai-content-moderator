"""
Utility functions for content moderation system
"""
import os
import uuid
import hashlib
import logging
from pathlib import Path
from typing import Optional, Tuple
from datetime import datetime

from config import settings

logger = logging.getLogger(__name__)


def generate_unique_id(prefix: str = "sub") -> str:
    """
    Generate unique submission ID
    
    Args:
        prefix: Prefix for ID (default: 'sub')
    
    Returns:
        Unique ID string
    """
    unique_id = str(uuid.uuid4())[:8]
    return f"{prefix}_{unique_id}"


def validate_file(filename: str) -> bool:
    """
    Validate if file extension is allowed
    
    Args:
        filename: Name of file to validate
    
    Returns:
        True if valid, False otherwise
    """
    if not filename:
        return False
    
    extension = filename.rsplit('.', 1)[-1].lower()
    return extension in settings.ALLOWED_EXTENSIONS


def validate_file_size(file_size: int) -> bool:
    """
    Validate if file size is within limits
    
    Args:
        file_size: Size of file in bytes
    
    Returns:
        True if valid, False otherwise
    """
    return file_size <= settings.MAX_FILE_SIZE


def save_uploaded_file(file, submission_id: str) -> Path:
    """
    Save uploaded file to disk
    
    Args:
        file: Uploaded file object
        submission_id: Submission ID for organizing files
    
    Returns:
        Path to saved file
    """
    try:
        # Create submission-specific folder
        submission_folder = Path(settings.UPLOAD_DIR) / submission_id
        submission_folder.mkdir(parents=True, exist_ok=True)
        
        # Save file with original name
        file_path = submission_folder / file.filename
        
        # Read and save file content
        contents = file.file.read()
        with open(file_path, 'wb') as f:
            f.write(contents)
        
        logger.info(f"File saved: {file_path}")
        return file_path
        
    except Exception as e:
        logger.error(f"File save error: {str(e)}")
        raise


def delete_uploaded_file(file_path: str) -> bool:
    """
    Delete uploaded file
    
    Args:
        file_path: Path to file to delete
    
    Returns:
        True if deleted, False otherwise
    """
    try:
        path = Path(file_path)
        if path.exists():
            path.unlink()
            logger.info(f"File deleted: {file_path}")
            return True
        return False
    except Exception as e:
        logger.error(f"File delete error: {str(e)}")
        return False


def clean_old_files(days: int = 7) -> int:
    """
    Clean uploaded files older than specified days
    
    Args:
        days: Number of days (default: 7)
    
    Returns:
        Number of files deleted
    """
    try:
        upload_dir = Path(settings.UPLOAD_DIR)
        deleted_count = 0
        current_time = datetime.now().timestamp()
        
        for file_path in upload_dir.rglob('*'):
            if file_path.is_file():
                file_age = current_time - file_path.stat().st_mtime
                if file_age > (days * 24 * 3600):  # Convert days to seconds
                    file_path.unlink()
                    deleted_count += 1
        
        logger.info(f"Cleaned {deleted_count} old files")
        return deleted_count
        
    except Exception as e:
        logger.error(f"File cleanup error: {str(e)}")
        return 0


def calculate_file_hash(file_path: str) -> str:
    """
    Calculate SHA256 hash of file
    
    Args:
        file_path: Path to file
    
    Returns:
        SHA256 hash string
    """
    try:
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()
    except Exception as e:
        logger.error(f"Hash calculation error: {str(e)}")
        return ""


def format_file_size(size_bytes: int) -> str:
    """
    Format file size to human-readable format
    
    Args:
        size_bytes: Size in bytes
    
    Returns:
        Formatted size string
    """
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.2f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.2f} TB"


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename to prevent path traversal
    
    Args:
        filename: Original filename
    
    Returns:
        Sanitized filename
    """
    # Remove path separators
    filename = filename.replace('/', '_').replace('\\', '_')
    # Remove special characters
    filename = "".join(c for c in filename if c.isalnum() or c in ('._-'))
    return filename


def get_file_info(file_path: str) -> dict:
    """
    Get file information
    
    Args:
        file_path: Path to file
    
    Returns:
        Dictionary with file info
    """
    try:
        path = Path(file_path)
        return {
            "name": path.name,
            "size": path.stat().st_size,
            "size_formatted": format_file_size(path.stat().st_size),
            "created_at": datetime.fromtimestamp(path.stat().st_ctime).isoformat(),
            "modified_at": datetime.fromtimestamp(path.stat().st_mtime).isoformat(),
            "extension": path.suffix
        }
    except Exception as e:
        logger.error(f"Get file info error: {str(e)}")
        return {}


def log_submission(submission_id: str, content_type: str, status: str):
    """
    Log submission details
    
    Args:
        submission_id: ID of submission
        content_type: Type of content
        status: Processing status
    """
    timestamp = datetime.now().isoformat()
    logger.info(f"[{timestamp}] Submission: {submission_id} | Type: {content_type} | Status: {status}")