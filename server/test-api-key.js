// Test script to check API key format
import 'dotenv/config';

const testAPIKey = () => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  console.log('🔑 Testing OpenRouter API Key Format...');
  console.log('Raw API Key:', apiKey);
  console.log('API Key Length:', apiKey ? apiKey.length : 0);
  console.log('Starts with sk-or-v1:', apiKey ? apiKey.startsWith('sk-or-v1') : false);
  
  // Check for any non-printable characters
  if (apiKey) {
    const hasNonPrintable = /[\x00-\x1F\x7F-\x9F]/.test(apiKey);
    console.log('Has non-printable characters:', hasNonPrintable);
    
    if (hasNonPrintable) {
      console.log('❌ API key contains non-printable characters!');
      console.log('💡 Please clean up your .env file and remove any extra characters');
    } else {
      console.log('✅ API key format looks good');
    }
  }
};

testAPIKey();
