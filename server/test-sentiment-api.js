// Test script for sentiment analysis API endpoint
import 'dotenv/config';
import fetch from 'node-fetch';

const testSentimentAPI = async () => {
  console.log('🎵 Testing Sentiment Analysis API Endpoint...');
  
  const testLyrics = {
    happy: "I'm feeling so good today\nThe sun is shining bright\nEverything's going my way\nI'm dancing in the light",
    sad: "I'm walking alone tonight\nThrough empty streets so cold\nNothing feels quite right\nMy heart feels old",
    angry: "You betrayed me once again\nI'm tired of all your lies\nThis pain cuts deep within\nI see through your disguise"
  };
  
  const baseUrl = 'http://localhost:8000';
  
  for (const [mood, lyrics] of Object.entries(testLyrics)) {
    console.log(`\n🧪 Testing ${mood} lyrics...`);
    
    try {
      const response = await fetch(`${baseUrl}/api/sentiment/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lyrics })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ API Response:`);
        console.log(`   Overall Mood: ${result.overallMood}`);
        console.log(`   Confidence: ${Math.round(result.confidence * 100)}%`);
        console.log(`   Intensity: ${result.intensity}/10`);
        console.log(`   Recommendations: ${result.recommendations?.length || 0} songs`);
        if (result.emotions && result.emotions.length > 0) {
          console.log(`   Top Emotions: ${result.emotions.slice(0, 3).map(e => `${e.emotion}(${Math.round(e.score * 100)}%)`).join(', ')}`);
        }
      } else {
        const error = await response.text();
        console.log(`❌ API Error (${response.status}): ${error}`);
      }
    } catch (error) {
      console.log(`❌ Network Error: ${error.message}`);
      console.log('💡 Make sure the server is running: npm run dev');
    }
  }
  
  console.log('\n🎵 Sentiment API test completed!');
};

testSentimentAPI().catch(console.error);
