import 'dotenv/config';
import fetch from 'node-fetch';

const HF_API_TOKEN = process.env.HF_API_TOKEN;

async function testHuggingFaceAPI() {
  console.log('🔍 Testing Hugging Face API Configuration...\n');

  // Check if API token is set
  if (!HF_API_TOKEN || HF_API_TOKEN === '' || HF_API_TOKEN === 'your-huggingface-api-token-here') {
    console.error('❌ HF_API_TOKEN is not set or is invalid in your .env file.');
    console.log('\n📝 To enable Hugging Face models:');
    console.log('1. Go to https://huggingface.co/settings/tokens');
    console.log('2. Create a new token (read access is sufficient)');
    console.log('3. Add it to your .env file: HF_API_TOKEN=your_actual_token');
    console.log('4. Set adapters to huggingface:');
    console.log('   AI_FACE_ADAPTER=huggingface');
    console.log('   AI_TEXT_ADAPTER=huggingface');
    console.log('   AI_AUDIO_ADAPTER=huggingface');
    return;
  }

  console.log('✅ HF_API_TOKEN is set');
  console.log('🔑 Token (first 10 chars):', HF_API_TOKEN.substring(0, 10) + '...');

  // Test API connectivity
  console.log('\n🌐 Testing API connectivity...');
  try {
    const response = await fetch("https://api-inference.huggingface.co/models/joeddav/distilbert-base-uncased-go-emotions-student", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: "I'm feeling happy today!"
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Hugging Face API is working!');
      console.log('📊 Test result:', data);
    } else {
      const errorData = await response.json();
      console.error('❌ Hugging Face API error:', response.status, errorData);
      
      if (response.status === 401) {
        console.log('\n🔧 Fix: Your API token is invalid. Please check:');
        console.log('1. Token is correct and not expired');
        console.log('2. Token has read permissions');
        console.log('3. No extra spaces in the .env file');
      } else if (response.status === 429) {
        console.log('\n🔧 Fix: Rate limit exceeded. Wait a moment and try again.');
      }
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
    console.log('\n🔧 Fix: Check your internet connection and try again.');
  }

  // Show current configuration
  console.log('\n⚙️  Current Configuration:');
  console.log('AI_FACE_ADAPTER:', process.env.AI_FACE_ADAPTER || 'mock');
  console.log('AI_TEXT_ADAPTER:', process.env.AI_TEXT_ADAPTER || 'mock');
  console.log('AI_AUDIO_ADAPTER:', process.env.AI_AUDIO_ADAPTER || 'mock');
  console.log('HF_IMAGE_MODEL_ID:', process.env.HF_IMAGE_MODEL_ID || 'trpakov/vit-face-expression');
  console.log('HF_TEXT_MODEL_ID:', process.env.HF_TEXT_MODEL_ID || 'joeddav/distilbert-base-uncased-go-emotions-student');
  console.log('HF_AUDIO_MODEL_ID:', process.env.HF_AUDIO_MODEL_ID || 'ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition');

  console.log('\n🎯 To enable Hugging Face models, set these in your .env file:');
  console.log('AI_FACE_ADAPTER=huggingface');
  console.log('AI_TEXT_ADAPTER=huggingface');
  console.log('AI_AUDIO_ADAPTER=huggingface');
}

testHuggingFaceAPI();
