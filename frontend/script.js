// Sample texts for testing
const sampleTexts = {
    fake1: "SHOCKING BREAKING NEWS: Government reveals secret alien technology that will give you FREE energy forever! This revolutionary device they've been hiding can power your entire home for just $99. Click here to learn the secret they don't want you to know! This groundbreaking discovery promises unlimited clean energy for the entire world.",
    
    fake2: "URGENT: Celebrity doctor reveals one weird trick to lose weight overnight! Doctors hate him! Click now to discover the secret! This simple method requires no exercise or dieting. Thousands of people are already seeing amazing results. Don't wait - this offer won't last long!",
    
    fake3: "This 25-year-old millionaire reveals his secret system for making $10,000 per month from home working just 2 hours per day. No experience needed! His proven method has already helped thousands achieve financial freedom. Sign up now for his FREE webinar to learn how you can quit your job and live the life you deserve!",
    
    real1: "Researchers at Harvard University have published a new study in the Journal of Medical Science confirming that regular exercise can reduce the risk of heart disease by up to 35%. The study followed 10,000 participants over five years and found consistent results across all age groups. According to lead researcher Dr. Sarah Johnson, 'These findings underscore the importance of physical activity in maintaining cardiovascular health.'",
    
    real2: "According to the National Weather Service, temperatures are expected to drop significantly tomorrow, with a high of 45 degrees Fahrenheit and overnight lows near freezing. Meteorologists predict a 60% chance of precipitation, possibly turning to snow in higher elevations. Residents are advised to prepare for winter driving conditions and protect sensitive plants from frost damage.",
    
    real3: "Apple Inc. announced today that it will be investing $1.5 billion in new manufacturing facilities in the United States, creating approximately 2,000 jobs. The technology giant plans to establish production lines for its latest iPhone models and Mac computers. According to CEO Tim Cook, 'This investment reinforces our commitment to American manufacturing and innovation economy.'"
};

// Fake news indicators for pattern display
const fakeIndicatorsList = [
    "Emotional/urgent language (SHOCKING, BREAKING, URGENT)",
    "Secret/revealed claims (secret, revealed, they don't want you to know)",
    "Free offers and miracle claims",
    "Price mentions ($99, $199, etc.)",
    "Call-to-action phrases (click here, learn more, discover)",
    "Authority opposition (doctors hate, experts hate)",
    "Quick results promises (overnight, instantly, immediately)",
    "Excessive punctuation (!!!, ???)",
    "ALL CAPS phrases for emphasis",
    "Get-rich-quick schemes",
    "Miracle health solutions",
    "Limited time offers"
];

const realIndicatorsList = [
    "Credible sources mentioned (university, research institute)",
    "Study/research references",
    "Official statements (according to, confirmed by)",
    "Specific data and statistics",
    "Balanced reporting without hype",
    "Professional language and tone",
    "Attribution to experts or officials",
    "Context and background information",
    "Measured conclusions",
    "Peer-reviewed references",
    "Established institutions",
    "Factual reporting without emotional manipulation"
];

// Tab navigation
function showTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    
    // Activate corresponding nav button
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Initialize tab navigation
document.addEventListener('DOMContentLoaded', function() {
    // Add click events to nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            showTab(this.dataset.tab);
        });
    });
    
    // Initialize character and word count
    updateTextStats();
    
    // Add input event to textarea
    document.getElementById('newsText').addEventListener('input', updateTextStats);
    
    // Add button event listeners
    document.getElementById('clearBtn').addEventListener('click', clearText);
    document.getElementById('pasteBtn').addEventListener('click', pasteText);
    document.getElementById('exportBtn').addEventListener('click', exportReport);
});

// Update character and word count
function updateTextStats() {
    const textarea = document.getElementById('newsText');
    const text = textarea.value;
    const charCount = text.length;
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    
    document.getElementById('charCount').textContent = `${charCount} characters`;
    document.getElementById('wordCount').textContent = `${wordCount} words`;
}

// Clear text area
function clearText() {
    document.getElementById('newsText').value = '';
    updateTextStats();
    hideResults();
}

// Paste text from clipboard
async function pasteText() {
    try {
        const text = await navigator.clipboard.readText();
        document.getElementById('newsText').value = text;
        updateTextStats();
    } catch (err) {
        alert('Unable to paste from clipboard. Please paste manually (Ctrl+V).');
    }
}

// Load sample text
function loadSample(sampleId) {
    if (sampleTexts[sampleId]) {
        document.getElementById('newsText').value = sampleTexts[sampleId];
        updateTextStats();
        showTab('analyzer');
        // Scroll to textarea
        document.getElementById('newsText').scrollIntoView({ behavior: 'smooth' });
    }
}

// Hide results section
function hideResults() {
    document.getElementById('results').style.display = 'none';
}

// Main analysis function
async function analyzeNews() {
    const newsText = document.getElementById('newsText').value.trim();
    
    if (!newsText) {
        alert('Please enter some news text to analyze.');
        return;
    }

    if (newsText.length < 10) {
        alert('Please enter at least 10 characters for meaningful analysis.');
        return;
    }

    // Show loading, hide results
    document.getElementById('loading').style.display = 'block';
    document.getElementById('results').style.display = 'none';

    try {
        // Simulate loading steps animation
        simulateLoadingSteps();
        
        const response = await fetch('http://localhost:5000/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: newsText })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        displayResults(data);
        
    } catch (error) {
        console.error('Error:', error);
        showError('Error analyzing news. Please check if the backend server is running on http://localhost:5000');
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

// Simulate loading steps animation
function simulateLoadingSteps() {
    const steps = document.querySelectorAll('.loading-steps .step');
    let currentStep = 0;
    
    const interval = setInterval(() => {
        if (currentStep > 0) {
            steps[currentStep - 1].classList.remove('active');
        }
        if (currentStep < steps.length) {
            steps[currentStep].classList.add('active');
            currentStep++;
        } else {
            clearInterval(interval);
        }
    }, 500);
}

// Display analysis results
function displayResults(data) {
    const resultsDiv = document.getElementById('results');
    const modelsGrid = document.getElementById('modelsGrid');
    const finalVerdictText = document.getElementById('finalVerdictText');
    const finalConfidence = document.getElementById('finalConfidence');
    const verdictDescription = document.getElementById('verdictDescription');

    // Clear previous results
    modelsGrid.innerHTML = '';
    
    // Display final verdict
    finalVerdictText.textContent = `${data.final_verdict} NEWS`;
    finalVerdictText.className = `verdict-text ${data.final_verdict.toLowerCase()}`;
    
    const confidencePercent = (data.confidence * 100).toFixed(1);
    finalConfidence.textContent = `${confidencePercent}% confidence`;
    finalConfidence.className = `confidence-badge ${data.final_verdict.toLowerCase()}`;
    
    // Set verdict description
    if (data.final_verdict === 'REAL') {
        verdictDescription.textContent = 'This content appears to be credible and trustworthy based on our analysis.';
        document.querySelector('.final-verdict-card').style.background = 'linear-gradient(135deg, #10b981, #059669)';
    } else {
        verdictDescription.textContent = 'This content shows characteristics commonly associated with fake or misleading information.';
        document.querySelector('.final-verdict-card').style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
    }

    // Display individual model results
    data.model_results.forEach(result => {
        const modelCard = createModelCard(result);
        modelsGrid.appendChild(modelCard);
    });

    // Display pattern analysis
    displayPatternAnalysis(data);
    
    // Display analysis summary
    displayAnalysisSummary(data);
    
    // Show results section
    resultsDiv.style.display = 'block';
    
    // Scroll to results
    resultsDiv.scrollIntoView({ behavior: 'smooth' });
}

// Create model card
function createModelCard(result) {
    const card = document.createElement('div');
    card.className = `model-card ${result.prediction.toLowerCase()}`;
    
    const confidencePercent = (result.confidence * 100).toFixed(1);
    
    // Add icon based on model type
    let icon = 'fas fa-brain';
    if (result.model_name.includes('Rule-Based')) icon = 'fas fa-ruler-combined';
    if (result.model_name.includes('Structure')) icon = 'fas fa-chart-line';
    
    card.innerHTML = `
        <h5><i class="${icon}"></i> ${result.model_name}</h5>
        <div class="prediction ${result.prediction.toLowerCase()}">
            ${result.prediction}
        </div>
        <div class="confidence-bar">
            <div class="confidence-fill ${result.prediction.toLowerCase()}" 
                 style="width: ${confidencePercent}%"></div>
        </div>
        <div class="confidence-text">Confidence: ${confidencePercent}%</div>
    `;
    
    // Add details if available
    if (result.details && Object.keys(result.details).length > 0) {
        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'model-details';
        
        let detailsHTML = '<strong>Analysis Details:</strong><br>';
        for (const [key, value] of Object.entries(result.details)) {
            if (key === 'fake_indicators' || key === 'real_indicators') {
                detailsHTML += `${key.replace('_', ' ')}: ${value}<br>`;
            }
        }
        
        detailsDiv.innerHTML = detailsHTML;
        card.appendChild(detailsDiv);
    }
    
    return card;
}

// Display pattern analysis
function displayPatternAnalysis(data) {
    const fakeIndicatorsListElem = document.getElementById('fakeIndicatorsList');
    const realIndicatorsListElem = document.getElementById('realIndicatorsList');
    
    // Clear previous indicators
    fakeIndicatorsListElem.innerHTML = '';
    realIndicatorsListElem.innerHTML = '';
    
    // Get custom model result for detailed indicators
    const customModel = data.model_results.find(m => m.model_name === 'Custom AI Model');
    
    if (customModel && customModel.details) {
        const fakeCount = customModel.details.fake_indicators || 0;
        const realCount = customModel.details.real_indicators || 0;
        
        // Show top indicators based on count
        const fakeToShow = Math.min(fakeCount, fakeIndicatorsList.length);
        const realToShow = Math.min(realCount, realIndicatorsList.length);
        
        // Display fake indicators
        for (let i = 0; i < fakeToShow; i++) {
            const indicatorItem = document.createElement('div');
            indicatorItem.className = 'indicator-item';
            indicatorItem.textContent = fakeIndicatorsList[i];
            fakeIndicatorsListElem.appendChild(indicatorItem);
        }
        
        // Display real indicators
        for (let i = 0; i < realToShow; i++) {
            const indicatorItem = document.createElement('div');
            indicatorItem.className = 'indicator-item';
            indicatorItem.textContent = realIndicatorsList[i];
            realIndicatorsListElem.appendChild(indicatorItem);
        }
        
        // Show message if no strong indicators
        if (fakeToShow === 0) {
            fakeIndicatorsListElem.innerHTML = '<div class="indicator-item">No strong fake news indicators detected</div>';
        }
        if (realToShow === 0) {
            realIndicatorsListElem.innerHTML = '<div class="indicator-item">No strong real news indicators detected</div>';
        }
    }
}

// Display analysis summary
function displayAnalysisSummary(data) {
    const summaryContent = document.getElementById('summaryContent');
    
    const customModel = data.model_results.find(m => m.model_name === 'Custom AI Model');
    const totalModels = data.model_results.length;
    const agreeingModels = data.model_results.filter(m => m.prediction === data.final_verdict).length;
    
    let summaryHTML = `
        <p><strong>Analysis Overview:</strong></p>
        <ul>
            <li>Final verdict: <strong>${data.final_verdict}</strong> with ${(data.confidence * 100).toFixed(1)}% confidence</li>
            <li>${agreeingModels} out of ${totalModels} models agree with the final verdict</li>
            <li>Analysis completed using ensemble AI methodology</li>
    `;
    
    if (customModel && customModel.details) {
        summaryHTML += `
            <li>Fake news indicators detected: ${customModel.details.fake_indicators || 0}</li>
            <li>Real news indicators detected: ${customModel.details.real_indicators || 0}</li>
        `;
    }
    
    summaryHTML += `
        </ul>
        <p><strong>Recommendation:</strong> ${
            data.final_verdict === 'REAL' 
            ? 'This content appears credible, but always verify through multiple sources.' 
            : 'Exercise caution with this content and verify through trusted news sources.'
        }</p>
    `;
    
    summaryContent.innerHTML = summaryHTML;
}

// Export report function
function exportReport() {
    const finalVerdict = document.getElementById('finalVerdictText').textContent;
    const confidence = document.getElementById('finalConfidence').textContent;
    const newsText = document.getElementById('newsText').value;
    
    const report = `
TRUTHLENS AI - ANALYSIS REPORT
===============================

ANALYSIS DATE: ${new Date().toLocaleString()}
FINAL VERDICT: ${finalVerdict}
CONFIDENCE: ${confidence}

ORIGINAL TEXT:
--------------
${newsText}

SUMMARY:
--------
${document.getElementById('summaryContent').textContent}

MODEL ANALYSIS:
---------------
${Array.from(document.querySelectorAll('.model-card')).map(card => {
    const title = card.querySelector('h5').textContent;
    const prediction = card.querySelector('.prediction').textContent;
    const confidence = card.querySelector('.confidence-text').textContent;
    return `${title}: ${prediction} (${confidence})`;
}).join('\n')}

PATTERN ANALYSIS:
-----------------
Fake News Indicators:
${Array.from(document.querySelectorAll('#fakeIndicatorsList .indicator-item')).map(item => `• ${item.textContent}`).join('\n')}

Real News Indicators:
${Array.from(document.querySelectorAll('#realIndicatorsList .indicator-item')).map(item => `• ${item.textContent}`).join('\n')}

---
Generated by TruthLens AI - Advanced Fake News Detection System
    `.trim();

    // Create and download file
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `truthlens-analysis-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Show error message
function showError(message) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <div class="error-section">
            <div class="error-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h3>Analysis Failed</h3>
            <p>${message}</p>
            <button class="analyze-btn" onclick="analyzeNews()">
                <i class="fas fa-redo"></i> Try Again
            </button>
        </div>
    `;
    resultsDiv.style.display = 'block';
    
    // Add error styles
    const style = document.createElement('style');
    style.textContent = `
        .error-section {
            text-align: center;
            padding: 3rem;
            background: var(--surface);
            border-radius: 12px;
            border: 2px solid var(--danger);
        }
        .error-icon {
            font-size: 4rem;
            color: var(--danger);
            margin-bottom: 1rem;
        }
        .error-section h3 {
            color: var(--danger);
            margin-bottom: 1rem;
        }
    `;
    document.head.appendChild(style);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl+Enter to analyze
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        analyzeNews();
    }
    
    // Ctrl+Shift+C to clear
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        clearText();
    }
});

// Add some CSS for the new elements
const additionalStyles = `
    .verdict-text.real { color: #10b981; }
    .verdict-text.fake { color: #ef4444; }
    .confidence-badge.real { background: rgba(16, 185, 129, 0.2); color: #10b981; }
    .confidence-badge.fake { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
    
    @media (max-width: 480px) {
        .models-grid {
            grid-template-columns: 1fr;
        }
        .sample-cards {
            grid-template-columns: 1fr;
        }
        .features-grid {
            grid-template-columns: 1fr;
        }
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Initialize the application
console.log('TruthLens AI Frontend Loaded Successfully');
console.log('Available sample texts:', Object.keys(sampleTexts));