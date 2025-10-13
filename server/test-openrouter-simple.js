// Simple test to verify OpenRouter API key
import 'dotenv/config';

const testSimple = async () => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  console.log('🔑 Simple OpenRouter API Key Test');
  console.log('API Key (first 20 chars):', apiKey ? `${apiKey.substring(0, 20)}...` : 'Not found');
  console.log('API Key length:', apiKey ? apiKey.length : 0);
  
  if (!apiKey) {
    console.log('❌ No API key found in environment');
    return;
  }
  
  // Test with a very simple request
  try {
    console.log('\n🧪 Testing with minimal request...');
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
            role: "user",
            content: "Hi"
          }
        ],
        max_tokens: 5
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response body:', responseText);
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('✅ SUCCESS! API is working');
      console.log('Response:', data.choices[0].message.content);
    } else {
      console.log('❌ FAILED! API returned error');
      try {
        const errorData = JSON.parse(responseText);
        console.log('Error details:', errorData);
      } catch (e) {
        console.log('Raw error response:', responseText);
      }
    }
    
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
};

testSimple();
