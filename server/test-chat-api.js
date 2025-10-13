// Test script for Chat API with OpenRouter
import 'dotenv/config';

const testChatAPI = async () => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  console.log('🔑 Testing Chat API with OpenRouter...');
  console.log('API Key:', apiKey ? `${apiKey.substring(0, 20)}...` : 'Not found');
  
  if (!apiKey || apiKey === 'your-openrouter-api-key-here') {
    console.log('❌ No valid API key found in environment variables');
    console.log('📝 Please add your OpenRouter API key to the .env file:');
    console.log('   OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here');
    return;
  }
  
  // Test 1: Direct OpenRouter API call
  console.log('\n🧪 Test 1: Direct OpenRouter API call');
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:8000',
        'X-Title': 'MelodyMind Test'
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: "system",
            content: "You are MelodyMind AI, a friendly music assistant."
          },
          {
            role: "user",
            content: "Hello! Can you recommend some happy songs?"
          }
        ],
        max_tokens: 100,
        temperature: 0.7
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Direct API call successful!');
      console.log('🤖 Bot response:', data.choices[0].message.content.substring(0, 100) + '...');
    } else {
      const error = await response.json();
      console.log('❌ Direct API call failed:', response.status, error);
    }
  } catch (error) {
    console.log('❌ Direct API call error:', error.message);
  }
  
  // Test 2: Backend Chat API call
  console.log('\n🧪 Test 2: Backend Chat API call');
  try {
    const response = await fetch('http://localhost:8000/api/v1/chat/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: "Hello! Can you recommend some happy songs?",
        model: 'openai/gpt-3.5-turbo'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend API call successful!');
      console.log('🤖 Bot response:', data.message.substring(0, 100) + '...');
      console.log('📡 Source:', data.source);
    } else {
      const error = await response.json();
      console.log('❌ Backend API call failed:', response.status, error);
    }
  } catch (error) {
    console.log('❌ Backend API call error:', error.message);
    console.log('💡 Make sure your backend server is running on port 8000');
  }
  
  // Test 3: Available models
  console.log('\n🧪 Test 3: Available models');
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
      const models = data.data || [];
      const chatModels = models.filter(m => m.id.includes('gpt') || m.id.includes('claude') || m.id.includes('llama'));
      console.log('✅ Available chat models:');
      chatModels.slice(0, 10).forEach(model => {
        console.log(`   • ${model.id} (${model.context_length || 'N/A'} tokens)`);
      });
    } else {
      console.log('❌ Failed to fetch models');
    }
  } catch (error) {
    console.log('❌ Models fetch error:', error.message);
  }
};

testChatAPI();
