// Detailed test script for OpenRouter API
import 'dotenv/config';

const testOpenRouterDetailed = async () => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  console.log('🔑 Detailed OpenRouter API Test...');
  console.log('API Key:', apiKey ? `${apiKey.substring(0, 20)}...` : 'Not found');
  
  if (!apiKey) {
    console.log('❌ No API key found');
    return;
  }
  
  // Test 1: Check account info
  console.log('\n🧪 Test 1: Account Information');
  try {
    const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:8000',
        'X-Title': 'MelodyMind Test'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Account info retrieved:');
      console.log('   Credits:', data.credits || 'N/A');
      console.log('   Usage:', data.usage || 'N/A');
    } else {
      const error = await response.json();
      console.log('❌ Account info failed:', response.status, error);
    }
  } catch (error) {
    console.log('❌ Account info error:', error.message);
  }
  
  // Test 2: Try different models
  console.log('\n🧪 Test 2: Testing different models');
  const modelsToTest = [
    'openai/gpt-3.5-turbo',
    'meta-llama/llama-3-8b-instruct',
    'google/gemini-pro',
    'microsoft/phi-3-mini-128k-instruct'
  ];
  
  for (const model of modelsToTest) {
    console.log(`\n   Testing model: ${model}`);
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
          model: model,
          messages: [
            {
              role: "user",
              content: "Hello! Just say 'Hi' back."
            }
          ],
          max_tokens: 10,
          temperature: 0.1
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ ${model}: ${data.choices[0].message.content}`);
        break; // If one works, we're good
      } else {
        const error = await response.json();
        console.log(`   ❌ ${model}: ${response.status} - ${error.error?.message || error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`   ❌ ${model}: Network error - ${error.message}`);
    }
  }
  
  // Test 3: Check if backend server is running
  console.log('\n🧪 Test 3: Backend server status');
  try {
    const response = await fetch('http://localhost:8000/api/v1/chat/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: "Test message",
        model: 'openai/gpt-3.5-turbo'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend server is running');
      console.log('   Response source:', data.source);
      if (data.source === 'fallback') {
        console.log('   ⚠️  Backend is using fallback responses (OpenRouter not working)');
      } else {
        console.log('   ✅ Backend is using OpenRouter API');
      }
    } else {
      console.log('❌ Backend server not responding:', response.status);
    }
  } catch (error) {
    console.log('❌ Backend server error:', error.message);
    console.log('💡 Make sure to start your backend server: npm run dev');
  }
};

testOpenRouterDetailed();
