// Test script for OpenRouter sentiment analysis
import 'dotenv/config';
import { ai } from './src/services/ai/index.js';

const testOpenRouterSentiment = async () => {
  console.log('🎵 Testing OpenRouter Sentiment Analysis...');
  
  const apiKey = process.env.OPENROUTER_API_KEY;
  console.log('API Key:', apiKey ? `${apiKey.substring(0, 20)}...` : 'Not found');
  
  if (!apiKey || apiKey === 'your-openrouter-api-key-here') {
    console.log('❌ No valid OpenRouter API key found');
    console.log('📝 Please add your OpenRouter API key to the .env file:');
    console.log('   OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here');
    return;
  }
  
  // Test lyrics with different emotional content
  const testLyrics = [
    {
      title: "Happy Song",
      lyrics: `I'm feeling so good today
The sun is shining bright
Everything's going my way
I'm dancing in the light
This happiness inside me
Just keeps on growing strong
I feel so free and easy
Like nothing can go wrong`
    },
    {
      title: "Sad Song", 
      lyrics: `I'm walking alone tonight
Through empty streets so cold
Nothing feels quite right
My heart feels old
The rain keeps falling down
Matches the tears in my eyes
I'm lost in this town
With all my broken ties`
    },
    {
      title: "Angry Song",
      lyrics: `You betrayed me once again
I'm tired of all your lies
This pain cuts deep within
I see through your disguise
I'm breaking down the walls
That you built around my heart
I'm answering the calls
To tear it all apart`
    },
    {
      title: "Energetic Song",
      lyrics: `Get up and move your body
Feel the beat inside your soul
We're gonna party hardy
Until we lose control
The music's pumping loud
Electric in the air
We're gonna make the crowd
Jump without a care`
    },
    {
      title: "Calm Song",
      lyrics: `Gentle breeze through the trees
Softly whispering peace
Lying here in the grass
All my worries will pass
The world slows down to rest
In this moment so blessed
Quiet thoughts in my mind
Perfect peace I can find`
    }
  ];
  
  console.log('\n🧪 Testing sentiment analysis on different lyrics...\n');
  
  for (const test of testLyrics) {
    console.log(`🎵 Testing: ${test.title}`);
    console.log(`Lyrics preview: "${test.lyrics.substring(0, 60)}..."`);
    
    try {
      const result = await ai.text.analyzeLyricsSentiment(test.lyrics);
      
      if (result) {
        console.log(`✅ Result: ${result.overallMood}`);
        console.log(`   Confidence: ${Math.round(result.confidence * 100)}%`);
        console.log(`   Intensity: ${result.intensity}/10`);
        console.log(`   Source: ${result.source || 'unknown'}`);
        if (result.reasoning) {
          console.log(`   Reasoning: ${result.reasoning}`);
        }
        console.log(`   Emotions: ${result.emotions.map(e => `${e.emotion}(${Math.round(e.score * 100)}%)`).join(', ')}`);
      } else {
        console.log('❌ No result returned');
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }
  
  // Test with invalid lyrics
  console.log('🧪 Testing edge cases...');
  
  try {
    console.log('Testing empty lyrics:');
    const emptyResult = await ai.text.analyzeLyricsSentiment('');
    console.log('Empty lyrics result:', emptyResult ? 'Got result' : 'No result');
  } catch (error) {
    console.log('Empty lyrics error:', error.message);
  }
  
  try {
    console.log('Testing very long lyrics:');
    const longLyrics = 'Happy happy joy joy '.repeat(100); // ~2000 characters
    const longResult = await ai.text.analyzeLyricsSentiment(longLyrics);
    console.log('Long lyrics result:', longResult ? `${longResult.overallMood} (${Math.round(longResult.confidence * 100)}%)` : 'No result');
  } catch (error) {
    console.log('Long lyrics error:', error.message);
  }
  
  console.log('\n🎵 OpenRouter sentiment analysis test completed!');
};

testOpenRouterSentiment().catch(console.error);
