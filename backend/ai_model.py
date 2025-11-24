import torch
import torch.nn as nn
from transformers import AutoTokenizer, AutoModel
import numpy as np
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FakeNewsClassifier(nn.Module):
    def __init__(self, base_model_name="bert-base-uncased", num_classes=2):
        super(FakeNewsClassifier, self).__init__()
        self.bert = AutoModel.from_pretrained(base_model_name)
        self.dropout = nn.Dropout(0.1)
        self.classifier = nn.Linear(self.bert.config.hidden_size, num_classes)
        
    def forward(self, input_ids, attention_mask):
        outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        pooled_output = outputs.pooler_output
        output = self.dropout(pooled_output)
        return self.classifier(output)

class FakeNewsDetector:
    def __init__(self, model_path="D:\\truthlens-app\\trained_models\\trained_model.pth"):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        logger.info(f"🚀 Using device: {self.device}")
        
        try:
            # Initialize model architecture
            self.model = FakeNewsClassifier()
            
            # Load trained weights
            self.model.load_state_dict(torch.load(model_path, map_location=self.device))
            self.model.to(self.device)
            self.model.eval()
            
            # Load tokenizer
            self.tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
            
            logger.info("✅ AI Model loaded successfully from .pth file")
            
        except Exception as e:
            logger.error(f"❌ Failed to load model: {e}")
            raise
    
    def predict(self, text):
        """
        Analyze text and return fake news detection results
        """
        try:
            # Tokenize input
            inputs = self.tokenizer(
                text,
                return_tensors="pt",
                truncation=True,
                max_length=256,
                padding=True
            )
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            # Get prediction
            with torch.no_grad():
                outputs = self.model(**inputs)
                probabilities = torch.softmax(outputs, dim=-1)
            
            # Get confidence scores
            formal_style_prob = probabilities[0][0].item()
            sensational_style_prob = probabilities[0][1].item()
            
            # Determine prediction
            if sensational_style_prob > 0.7:
                prediction = "FAKE"
                confidence = sensational_style_prob
                explanation = "Sensational/informal writing style detected - common in fake news"
            elif formal_style_prob > 0.7:
                prediction = "REAL"
                confidence = formal_style_prob
                explanation = "Formal/professional writing style detected - common in real news"
            else:
                prediction = "UNCERTAIN"
                confidence = max(formal_style_prob, sensational_style_prob)
                explanation = "Writing style is ambiguous - requires human verification"
            
            return {
                "prediction": prediction,
                "confidence": round(confidence, 4),
                "explanation": explanation,
                "probabilities": {
                    "formal_style": round(formal_style_prob, 4),
                    "sensational_style": round(sensational_style_prob, 4)
                },
                "text_preview": text[:100] + "..." if len(text) > 100 else text
            }
            
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            return {
                "prediction": "ERROR",
                "confidence": 0.0,
                "explanation": f"Analysis failed: {str(e)}",
                "probabilities": {"formal_style": 0.0, "sensational_style": 0.0},
                "text_preview": text[:100] + "..." if len(text) > 100 else text
            }
    
    def batch_predict(self, texts):
        """Analyze multiple texts at once"""
        results = []
        for text in texts:
            if text.strip():
                results.append(self.predict(text.strip()))
        return results

# Singleton instance
detector = None

def get_detector():
    global detector
    if detector is None:
        detector = FakeNewsDetector()
    return detector