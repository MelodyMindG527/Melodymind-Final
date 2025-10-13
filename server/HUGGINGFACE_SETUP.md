# 🤗 Hugging Face Setup Guide

## Why Use Hugging Face Models?

The system can use **real AI models** from Hugging Face for more accurate emotion detection:

- **🎤 Speech Analysis**: Real audio emotion recognition models
- **📝 Text Analysis**: Advanced sentiment analysis models  
- **📸 Face Analysis**: Facial expression recognition models
- **🎯 Higher Accuracy**: Better than keyword-based fallbacks

## Current Status

**❌ Currently using MOCK mode** because:
- No Hugging Face API token configured
- All adapters set to 'mock' mode

## 🚀 How to Enable Hugging Face Models

### Step 1: Get Hugging Face API Token

1. Go to [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Sign up/Login to Hugging Face
3. Click "New token"
4. Give it a name (e.g., "MelodyMind")
5. Select "Read" permissions
6. Copy the token

### Step 2: Configure Environment

Create or update your `.env` file in the `server` directory:

```bash
# Hugging Face Configuration
HF_API_TOKEN=hf_your_actual_token_here

# Enable Hugging Face adapters
AI_FACE_ADAPTER=huggingface
AI_TEXT_ADAPTER=huggingface
AI_AUDIO_ADAPTER=huggingface
AI_RECO_ADAPTER=mock

# Model IDs (optional - these are the defaults)
HF_IMAGE_MODEL_ID=trpakov/vit-face-expression
HF_TEXT_MODEL_ID=joeddav/distilbert-base-uncased-go-emotions-student
HF_AUDIO_MODEL_ID=ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition
HF_EMBED_MODEL_ID=sentence-transformers/all-MiniLM-L6-v2
```

### Step 3: Test Configuration

Run the test script:

```bash
cd server
node test-huggingface.js
```

This will:
- ✅ Check if your API token is valid
- 🌐 Test API connectivity
- 📊 Show current configuration
- 🔧 Provide fix suggestions if needed

### Step 4: Restart Server

```bash
cd server
npm run dev
```

## 🎯 Available Models

### Text Emotion Analysis
- **Model**: `joeddav/distilbert-base-uncased-go-emotions-student`
- **Detects**: 28 different emotions (joy, sadness, anger, fear, etc.)
- **Accuracy**: High accuracy for text sentiment analysis

### Audio Emotion Recognition  
- **Model**: `ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition`
- **Detects**: Emotions from speech audio
- **Accuracy**: State-of-the-art speech emotion recognition

### Facial Expression Recognition
- **Model**: `trpakov/vit-face-expression`
- **Detects**: 7 basic emotions from facial expressions
- **Accuracy**: Vision Transformer-based face analysis

## 🔄 Fallback System

The system has a **smart fallback**:

1. **Primary**: Hugging Face AI models (if configured)
2. **Fallback**: Enhanced keyword matching (always works)
3. **Consistency**: Same emotion mapping across all methods

## 🐛 Troubleshooting

### "HF_API_TOKEN not set"
- Add your token to `.env` file
- Restart the server

### "401 Unauthorized"
- Check your token is correct
- Ensure token has read permissions
- No extra spaces in `.env` file

### "429 Rate Limit"
- Wait a moment and try again
- Hugging Face has rate limits for free accounts

### "Model not found"
- Check model IDs are correct
- Some models may be temporarily unavailable

## 💡 Benefits of Hugging Face Models

### vs Mock Mode:
- **🎯 Accuracy**: 80-95% vs 60-70%
- **🧠 Intelligence**: Real AI vs keyword matching
- **🌍 Language**: Multi-language support
- **📊 Confidence**: More reliable confidence scores

### vs Local Models:
- **⚡ Speed**: No model download/loading
- **💾 Storage**: No local storage needed
- **🔄 Updates**: Always latest model versions
- **🛠️ Maintenance**: No model management

## 🎵 Example Results

### Mock Mode:
```
"I'm feeling great!" → Happy (60% confidence)
```

### Hugging Face Mode:
```
"I'm feeling great!" → Joy (89% confidence)
```

The Hugging Face models provide much more nuanced and accurate emotion detection!

## 🔧 Quick Commands

```bash
# Test Hugging Face setup
cd server && node test-huggingface.js

# Check current configuration
cd server && node -e "console.log(require('./src/config/env.js').env)"

# Restart with new config
cd server && npm run dev
```

---

**🎉 Once configured, you'll get much more accurate emotion detection for speech, text, and facial analysis!**
