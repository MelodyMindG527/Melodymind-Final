import 'dotenv/config';
import fetch from 'node-fetch';

const HF_API_TOKEN = process.env.HF_API_TOKEN;

// List of potential speech emotion recognition models to test
const audioModels = [
  'superb/hubert-base-superb-er',
  'superb/wav2vec2-base-superb-er', 
  'facebook/wav2vec2-base-960h',
  'microsoft/wav2vec2-base-960h',
  'facebook/hubert-base-ls960',
  'jonatasgrosman/wav2vec2-large-xlsr-53-english',
  'facebook/wav2vec2-large-960h-lv60-self',
  'ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition'
];

async function testAudioModel(modelId) {
  console.log(`\n🎤 Testing model: ${modelId}`);
  
  try {
    const response = await fetch(`https://api-inference.huggingface.co/models/${modelId}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: "test audio input"
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ ${modelId} - Working!`);
      console.log(`📊 Response:`, JSON.stringify(data, null, 2));
      return modelId;
    } else {
      const errorData = await response.json();
      console.log(`❌ ${modelId} - Error ${response.status}:`, errorData.error || errorData.message || 'Unknown error');
      return null;
    }
  } catch (error) {
    console.log(`❌ ${modelId} - Network error:`, error.message);
    return null;
  }
}

async function testAllAudioModels() {
  console.log('🔍 Testing Speech Emotion Recognition Models...\n');
  
  if (!HF_API_TOKEN) {
    console.error('❌ HF_API_TOKEN not set');
    return;
  }

  const workingModels = [];
  
  for (const model of audioModels) {
    const result = await testAudioModel(model);
    if (result) {
      workingModels.push(result);
    }
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n📋 Summary:');
  if (workingModels.length > 0) {
    console.log('✅ Working models:');
    workingModels.forEach(model => console.log(`   - ${model}`));
    
    console.log('\n🔧 To fix your audio model, update your .env file:');
    console.log(`HF_AUDIO_MODEL_ID=${workingModels[0]}`);
  } else {
    console.log('❌ No working audio models found');
    console.log('\n💡 Alternative solutions:');
    console.log('1. Use text-only analysis (disable audio adapter)');
    console.log('2. Use mock mode for audio analysis');
    console.log('3. Check Hugging Face status page for service issues');
  }
}

testAllAudioModels();
