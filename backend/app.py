from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import numpy as np
import logging
import requests
import json
import os
from model_loader import CustomModelLoader

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

class NewsAnalyzer:
    def __init__(self):
        self.models = {}
        self.custom_model = None
        self.load_models()
    
    def load_models(self):
        """Load your custom trained model and other pre-trained models"""
        try:
            # Load custom model using our improved loader
            self.custom_model = CustomModelLoader("./models")
            
            if self.custom_model.model is not None:
                self.models['custom'] = True
                logger.info("Custom model loaded successfully")
            else:
                logger.warning("Custom model failed to load")
                
        except Exception as e:
            logger.error(f"Error loading models: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
    
    def analyze_with_custom_model(self, text):
        """Analyze text with your custom trained model"""
        try:
            if self.custom_model is None:
                return {'prediction': 'UNKNOWN', 'confidence': 0.5, 'error': 'Model not loaded'}
            
            result = self.custom_model.predict(text)
            return result
            
        except Exception as e:
            logger.error(f"Error in custom model analysis: {str(e)}")
            return {'prediction': 'UNKNOWN', 'confidence': 0.5, 'error': str(e)}
    
    def analyze_with_rule_based(self, text):
        """Simple rule-based analysis as fallback"""
        # Simple heuristic rules
        text_lower = text.lower()
        suspicious_words = ['breaking', 'shocking', 'urgent', 'must read', 'viral']
        reliable_indicators = ['according to sources', 'official statement', 'research shows']
        
        suspicious_count = sum(1 for word in suspicious_words if word in text_lower)
        reliable_count = sum(1 for phrase in reliable_indicators if phrase in text_lower)
        
        score = 0.5  # neutral start
        
        # Adjust score based on indicators
        if suspicious_count > 2:
            score -= 0.3
        if reliable_count > 0:
            score += 0.3
            
        # Normalize to 0-1 range
        confidence = max(0.1, min(0.9, abs(score - 0.5) * 2))
        
        prediction = "REAL" if score > 0.5 else "FAKE"
        
        return {
            'prediction': prediction,
            'confidence': confidence,
            'details': {
                'suspicious_indicators': suspicious_count,
                'reliable_indicators': reliable_count
            }
        }
    
    def analyze_with_length_analysis(self, text):
        """Analyze based on text characteristics"""
        words = text.split()
        sentences = text.split('.')
        
        # Calculate features
        avg_sentence_length = len(words) / max(1, len(sentences))
        word_count = len(words)
        
        # Heuristic: Very short or very long articles might be suspicious
        if word_count < 50:
            confidence = 0.7
            prediction = "FAKE"
        elif word_count > 1000:
            confidence = 0.6
            prediction = "FAKE"
        elif 100 <= word_count <= 800:
            confidence = 0.7
            prediction = "REAL"
        else:
            confidence = 0.5
            prediction = "REAL"
            
        return {
            'prediction': prediction,
            'confidence': confidence,
            'details': {
                'word_count': word_count,
                'avg_sentence_length': avg_sentence_length
            }
        }

# Initialize analyzer
analyzer = NewsAnalyzer()

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'models_loaded': len(analyzer.models)})

@app.route('/analyze', methods=['POST'])
def analyze_news():
    try:
        data = request.get_json()
        text = data.get('text', '').strip()
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        logger.info(f"Analyzing text: {text[:100]}...")
        
        # Get predictions from all models
        model_results = []
        
        # 1. Custom trained model
        custom_result = analyzer.analyze_with_custom_model(text)
        model_results.append({
            'model_name': 'Custom AI Model',
            'prediction': custom_result['prediction'],
            'confidence': custom_result['confidence'],
            'details': custom_result.get('details', {})
        })
        
        # 2. Rule-based analysis
        rule_result = analyzer.analyze_with_rule_based(text)
        model_results.append({
            'model_name': 'Rule-Based Analysis',
            'prediction': rule_result['prediction'],
            'confidence': rule_result['confidence'],
            'details': rule_result.get('details', {})
        })
        
        # 3. Length analysis
        length_result = analyzer.analyze_with_length_analysis(text)
        model_results.append({
            'model_name': 'Text Structure Analysis',
            'prediction': length_result['prediction'],
            'confidence': length_result['confidence'],
            'details': length_result.get('details', {})
        })
        
        # Calculate final verdict (weighted average)
        real_scores = []
        fake_scores = []
        
        for result in model_results:
            if result['prediction'] == 'REAL':
                real_scores.append(result['confidence'])
            else:
                fake_scores.append(result['confidence'])
        
        avg_real = sum(real_scores) / len(real_scores) if real_scores else 0
        avg_fake = sum(fake_scores) / len(fake_scores) if fake_scores else 0
        
        if avg_real > avg_fake:
            final_verdict = "REAL"
            final_confidence = avg_real
        else:
            final_verdict = "FAKE"
            final_confidence = avg_fake
        
        response = {
            'final_verdict': final_verdict,
            'confidence': final_confidence,
            'model_results': model_results,
            'text_preview': text[:200] + '...' if len(text) > 200 else text
        }
        
        logger.info(f"Analysis complete: {final_verdict} with {final_confidence:.2f} confidence")
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error in analysis: {str(e)}")
        return jsonify({'error': 'Analysis failed', 'details': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)