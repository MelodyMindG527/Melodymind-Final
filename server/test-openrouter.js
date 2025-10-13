// Test script for OpenRouter API key
import 'dotenv/config';

const testOpenRouterAPI = async () => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  console.log('🔑 Testing OpenRouter API Key...');
  console.log('API Key:', apiKey ? `${apiKey.substring(0, 20)}...` : 'Not found');
  
  if (!apiKey || apiKey === 'your-openrouter-api-key-here') {
    console.log('❌ No valid API key found in environment variables');
    console.log('📝 Please add your OpenRouter API key to the .env file:');
    console.log('   OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here');
    return;
  }
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:8000',
        'X-Title': 'MelodyMind Test'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Key is valid!');
      console.log('📊 Available models:', data.data?.length || 0);
      console.log('🎯 First few models:', data.data?.slice(0, 3).map(m => m.id) || []);
    } else {
      const error = await response.json();
      console.log('❌ API Key test failed:', response.status, error);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
};

testOpenRouterAPI();
