"""
Configuration settings for TruthLens Fake News Detection System
Centralized configuration for easy maintenance and deployment
"""

class Config:
    """Main configuration class for TruthLens application"""
    
    # Flask Application Settings
    DEBUG = True  # Set to False in production
    SECRET_KEY = 'truthlens_advanced_ai_detection_2025'
    
    # AI Model Configuration
    MODEL_NAME = 'bert-base-uncased'  # Pre-trained BERT model
    MAX_SEQUENCE_LENGTH = 256  # Reduced from 512 for 16GB optimization
    MODEL_CACHE_DIR = './model_cache'  # Directory for cached models
    
    # Text Processing Settings
    MIN_TEXT_LENGTH = 50  # Minimum characters for analysis
    MAX_TEXT_LENGTH = 2000  # Maximum characters for analysis
    
    # Training Configuration for 16GB RAM
    BATCH_SIZE = 12  # Optimized for 16GB memory
    TRAINING_EPOCHS = 3  # Number of training epochs
    LEARNING_RATE = 2e-5  # Learning rate for fine-tuning
    VALIDATION_SPLIT = 0.15  # Validation set size
    TEST_SPLIT = 0.15  # Test set size
    MAX_TRAINING_SAMPLES = 6000  # Maximum samples for training
    
    # Performance Settings
    CONFIDENCE_THRESHOLD = 0.6  # Minimum confidence to show result
    
    # UI Settings
    APP_NAME = "TruthLens AI"
    APP_VERSION = "2.0.0"
    APP_DESCRIPTION = "Advanced Fake News Detection using Transformer Models"
    
    # API Settings
    API_VERSION = "v1"
    RATE_LIMIT = "100/hour"  # Rate limiting for API calls

# Create configuration instance
config = Config()