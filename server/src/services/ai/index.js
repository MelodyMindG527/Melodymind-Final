import { env } from '../../config/env.js';
import fetch from 'node-fetch';

// --- Label mappings ---
const faceLabelToMood = (label) => {
  const map = {
    happy: 'happy',
    happiness: 'happy',
    angry: 'angry',
    anger: 'angry',
    disgust: 'disgust',
    fear: 'fear',
    fearful: 'fear',
    surprise: 'surprise',
    surprised: 'surprise',
    sad: 'sad',
    sadness: 'sad',
    neutral: 'neutral',
    calm: 'calm',
    relaxed: 'relaxed',
  };
  return map[String(label).toLowerCase()] || 'neutral';
};

const goEmotionToMood = (label) => {
  const map = {
    // Happy emotions
    joy: 'happy',
    optimism: 'happy',
    admiration: 'happy',
    approval: 'happy',
    gratitude: 'happy',
    amusement: 'happy',
    pride: 'happy',
    love: 'happy',
    excitement: 'happy',
    enthusiasm: 'happy',
    
    // Sad emotions
    disappointment: 'sad',
    sadness: 'sad',
    grief: 'sad',
    remorse: 'sad',
    embarrassment: 'sad',
    melancholy: 'sad',
    sorrow: 'sad',
    
    // Angry emotions
    anger: 'angry',
    annoyance: 'angry',
    frustration: 'angry',
    irritation: 'angry',
    rage: 'angry',
    
    // Anxious emotions
    fear: 'anxious',
    anxiety: 'anxious',
    nervousness: 'anxious',
    worry: 'anxious',
    stress: 'anxious',
    tension: 'anxious',
    
    // Calm emotions
    relief: 'calm',
    peace: 'calm',
    serenity: 'calm',
    tranquility: 'calm',
    relaxation: 'calm',
    
    // Energetic emotions
    excitement: 'energetic',
    enthusiasm: 'energetic',
    energy: 'energetic',
    vigor: 'energetic',
    
    // Neutral emotions
    confusion: 'neutral',
    neutral: 'neutral',
    indifference: 'neutral',
    calm: 'neutral', // Map calm to neutral for consistency
    relaxed: 'neutral', // Map relaxed to neutral for consistency
    surprise: 'neutral', // Map surprise to neutral for consistency
    disgust: 'neutral', // Map disgust to neutral for consistency
    curiosity: 'neutral', // Map curiosity to neutral for consistency
    realization: 'neutral', // Map realization to neutral for consistency
  };
  return map[String(label).toLowerCase()] || 'neutral';
};

// Helpers
async function hfRequest(modelId, input, isBinary = false) {
  if (!env.HF_API_TOKEN || env.HF_API_TOKEN === '') {
    throw new Error('HF_API_TOKEN not set or empty');
  }
  const url = `https://api-inference.huggingface.co/models/${modelId}`;
  const headers = {
    Authorization: `Bearer ${env.HF_API_TOKEN}`,
  };
  if (!isBinary) headers['Content-Type'] = 'application/json';
  const body = isBinary ? input : JSON.stringify(input);
  const resp = await fetch(url, { method: 'POST', headers, body });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`HF error ${resp.status}: ${text}`);
  }
  const contentType = resp.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return resp.json();
  return resp.arrayBuffer();
}

// Pluggable adapters (mock or huggingface)
class FaceAdapter {
  async analyzeImage(buffer) {
    if (env.AI_FACE_ADAPTER === 'mock' || !env.HF_API_TOKEN || env.HF_API_TOKEN === '') {
      // Return mock facial analysis result
      const mockEmotions = ['happy', 'sad', 'angry', 'surprised', 'fear', 'disgust', 'neutral'];
      const randomEmotion = mockEmotions[Math.floor(Math.random() * mockEmotions.length)];
      const confidence = 0.6 + Math.random() * 0.3; // 0.6 to 0.9
      const intensity = Math.floor(confidence * 10);
      
      return { 
        moodLabel: randomEmotion, 
        confidence: confidence, 
        intensity: intensity, 
        details: { 
          mock: true,
          imageSize: buffer.length 
        } 
      };
    }
    
    try {
      // Use facial expression classifier
      const out = await hfRequest(env.HF_IMAGE_MODEL_ID, buffer, true);
      // Expect array of {label, score}
      let top = null;
      if (Array.isArray(out)) {
        top = out.reduce((a, b) => (b.score > (a?.score || 0) ? b : a), null);
      }
      const label = top?.label || 'neutral';
      const score = Number(top?.score || 0.5);
      const moodLabel = faceLabelToMood(label);
      const intensity = Math.min(10, Math.max(0, score * 10));
      return { moodLabel, confidence: score, intensity, details: { raw: out } };
    } catch (error) {
      console.warn('HF face analysis failed, using mock:', error.message);
      // Fallback to mock analysis
      const mockEmotions = ['happy', 'sad', 'angry', 'surprised', 'fear', 'disgust', 'neutral'];
      const randomEmotion = mockEmotions[Math.floor(Math.random() * mockEmotions.length)];
      const confidence = 0.6 + Math.random() * 0.3;
      const intensity = Math.floor(confidence * 10);
      
      return { 
        moodLabel: randomEmotion, 
        confidence: confidence, 
        intensity: intensity, 
        details: { 
          mock: true,
          fallback: true,
          imageSize: buffer.length 
        } 
      };
    }
  }
}

class TextAdapter {
  async analyzeText(text, intensity) {
    // Always use mock mode for now to ensure consistent results
    console.log('🎯 Using enhanced keyword-based text analysis for:', text);
    
    // Enhanced mock text analysis based on keywords
    const textLower = text?.toLowerCase() || '';
    let moodLabel = 'neutral';
    let confidence = 0.6;
    
    // Enhanced keyword-based emotion detection with priority order
    const happyKeywords = ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'fantastic', 'awesome', 'brilliant', 'delighted', 'cheerful', 'optimistic', 'grateful', 'proud', 'love', 'adore', 'enjoy', 'fun', 'laugh', 'smile', 'celebration', 'success', 'victory', 'win'];
    const energeticKeywords = ['energetic', 'pumped', 'hyped', 'motivated', 'active', 'dynamic', 'vigorous', 'lively', 'bouncy', 'peppy', 'enthusiastic', 'passionate', 'intense', 'powerful', 'strong', 'ready', 'fired up', 'raring to go'];
    const sadKeywords = ['sad', 'down', 'depressed', 'upset', 'miserable', 'heartbroken', 'grief', 'sorrow', 'melancholy', 'blue', 'unhappy', 'disappointed', 'hurt', 'pain', 'loss', 'cry', 'tears', 'lonely', 'empty', 'hopeless'];
    const angryKeywords = ['angry', 'mad', 'furious', 'annoyed', 'frustrated', 'irritated', 'rage', 'hate', 'disgusted', 'outraged', 'livid', 'enraged', 'pissed', 'aggravated', 'bothered', 'upset', 'fuming'];
    const anxiousKeywords = ['anxious', 'worried', 'nervous', 'scared', 'afraid', 'fearful', 'stressed', 'tense', 'panic', 'overwhelmed', 'uneasy', 'restless', 'apprehensive', 'concerned', 'troubled', 'distressed'];
    const calmKeywords = ['calm', 'peaceful', 'relaxed', 'chill', 'serene', 'tranquil', 'quiet', 'still', 'gentle', 'soft', 'mellow', 'soothing', 'comfortable', 'content', 'satisfied', 'at ease'];
    
    // Check for emotion keywords in priority order (energetic before happy to catch "pumped")
    if (energeticKeywords.some(keyword => textLower.includes(keyword))) {
      moodLabel = 'energetic';
      confidence = 0.85;
      console.log('🎯 Detected ENERGETIC mood from keywords');
    } else if (happyKeywords.some(keyword => textLower.includes(keyword))) {
      moodLabel = 'happy';
      confidence = 0.8;
      console.log('🎯 Detected HAPPY mood from keywords');
    } else if (sadKeywords.some(keyword => textLower.includes(keyword))) {
      moodLabel = 'sad';
      confidence = 0.8;
      console.log('🎯 Detected SAD mood from keywords');
    } else if (angryKeywords.some(keyword => textLower.includes(keyword))) {
      moodLabel = 'angry';
      confidence = 0.8;
      console.log('🎯 Detected ANGRY mood from keywords');
    } else if (anxiousKeywords.some(keyword => textLower.includes(keyword))) {
      moodLabel = 'anxious';
      confidence = 0.8;
      console.log('🎯 Detected ANXIOUS mood from keywords');
    } else if (calmKeywords.some(keyword => textLower.includes(keyword))) {
      moodLabel = 'neutral'; // Map calm to neutral for consistency
      confidence = 0.8;
      console.log('🎯 Detected NEUTRAL mood from keywords');
    }
    
    const base = text?.length ? Math.min(0.9, 0.3 + text.length / 200) : 0.5;
    const finalConfidence = Math.max(confidence, base);
    
    console.log(`🎯 Final result: ${moodLabel} (${Math.round(finalConfidence * 100)}% confidence)`);
    return { moodLabel, confidence: finalConfidence, intensity: intensity ?? 5, rawScore: finalConfidence };
  }

  async analyzeLyricsSentiment(lyrics) {
    console.log('🎵 Analyzing lyrics sentiment for:', lyrics.substring(0, 100) + '...');
    
    // Try OpenRouter API first if available
    if (env.OPENROUTER_API_KEY && env.OPENROUTER_API_KEY !== '') {
      try {
        console.log('🎵 Using OpenRouter API for sentiment analysis...');
        const openRouterResult = await this.analyzeWithOpenRouter(lyrics);
        if (openRouterResult && openRouterResult.overallMood !== 'neutral') {
          return openRouterResult;
        }
      } catch (error) {
        console.log('🎵 OpenRouter analysis failed, falling back to advanced keyword analysis:', error.message);
      }
    }
    
    // Try Hugging Face sentiment analysis if OpenRouter is not available
    if (env.HF_API_TOKEN && env.HF_API_TOKEN !== '') {
      try {
        console.log('🎵 Using Hugging Face sentiment analysis model...');
        const hfResult = await this.analyzeWithHuggingFace(lyrics);
        if (hfResult && hfResult.overallMood !== 'neutral') {
          return hfResult;
        }
      } catch (error) {
        console.log('🎵 Hugging Face analysis failed, falling back to advanced keyword analysis:', error.message);
      }
    }
    
    // Advanced sentiment analysis with context awareness
    const lyricsLower = lyrics?.toLowerCase() || '';
    const words = lyricsLower.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(word => word.length > 2);
    const lines = lyricsLower.split('\n').filter(line => line.trim());
    
    // Comprehensive emotion lexicon with contextual weights
    const emotionLexicon = {
      happy: {
        // Direct positive emotions
        direct: ['happy', 'joy', 'joyful', 'glad', 'cheerful', 'blissful', 'ecstatic', 'elated', 'euphoric'],
        // Positive actions
        actions: ['smile', 'laugh', 'dance', 'sing', 'celebrate', 'party', 'cheer', 'rejoice'],
        // Positive concepts
        concepts: ['love', 'heart', 'beautiful', 'wonderful', 'amazing', 'fantastic', 'great', 'magical', 'dreams', 'hope', 'freedom', 'victory', 'success', 'bright', 'sunshine', 'light', 'golden', 'rainbow', 'stars'],
        // Positive intensifiers
        intensifiers: ['yes', 'yeah', 'alright', 'awesome', 'brilliant', 'perfect', 'incredible'],
        weight: 1.0
      },
      sad: {
        // Direct negative emotions
        direct: ['sad', 'sorrowful', 'melancholy', 'depressed', 'blue', 'down', 'low', 'miserable', 'heartbroken', 'devastated'],
        // Sad actions
        actions: ['cry', 'weep', 'mourn', 'grieve', 'sob', 'sigh'],
        // Sad concepts
        concepts: ['pain', 'hurt', 'broken', 'lonely', 'empty', 'dark', 'night', 'rain', 'storm', 'clouds', 'grey', 'cold', 'alone', 'miss', 'gone', 'lost', 'death', 'die', 'goodbye', 'farewell', 'grief', 'burden', 'heavy'],
        // Sad intensifiers
        intensifiers: ['so', 'very', 'too', 'deeply', 'terribly', 'horribly'],
        weight: 1.2
      },
      angry: {
        // Direct anger emotions
        direct: ['angry', 'mad', 'furious', 'rage', 'livid', 'enraged', 'irate', 'incensed'],
        // Angry actions
        actions: ['fight', 'scream', 'shout', 'yell', 'explode', 'rage', 'attack'],
        // Angry concepts
        concepts: ['hate', 'kill', 'destroy', 'break', 'crash', 'shatter', 'violence', 'blood', 'hell', 'devil', 'evil', 'wrong', 'bad', 'sick', 'disgusted', 'outraged'],
        // Angry intensifiers
        intensifiers: ['fucking', 'damn', 'hell', 'pissed', 'fuming'],
        weight: 1.3
      },
      energetic: {
        // Energy indicators
        direct: ['energetic', 'powerful', 'dynamic', 'vibrant', 'lively', 'bouncy', 'peppy', 'intense'],
        // Energetic actions
        actions: ['run', 'jump', 'dance', 'move', 'rock', 'pump', 'explode', 'burst'],
        // Energetic concepts
        concepts: ['energy', 'power', 'strong', 'fast', 'quick', 'speed', 'beat', 'rhythm', 'fire', 'wild', 'crazy', 'loud', 'boom', 'bang', 'explosive'],
        // Energetic intensifiers
        intensifiers: ['so', 'really', 'super', 'mega', 'ultra'],
        weight: 1.1
      },
      calm: {
        // Calm emotions
        direct: ['calm', 'peaceful', 'serene', 'tranquil', 'relaxed', 'content', 'zen'],
        // Calm actions
        actions: ['breathe', 'rest', 'sleep', 'meditate', 'float', 'drift'],
        // Calm concepts
        concepts: ['peace', 'quiet', 'soft', 'gentle', 'slow', 'easy', 'chill', 'still', 'silence', 'whisper', 'breeze', 'flow', 'smooth', 'mellow', 'soothing', 'comfort', 'warm', 'cozy', 'safe', 'secure'],
        // Calm intensifiers
        intensifiers: ['so', 'very', 'deeply', 'completely'],
        weight: 0.9
      },
      anxious: {
        // Anxiety emotions
        direct: ['anxious', 'worried', 'nervous', 'scared', 'afraid', 'fearful', 'panic', 'stressed', 'troubled'],
        // Anxiety actions
        actions: ['worry', 'fret', 'panic', 'tremble', 'shake', 'hide'],
        // Anxiety concepts
        concepts: ['fear', 'tension', 'pressure', 'overwhelmed', 'uneasy', 'restless', 'apprehensive', 'concerned', 'distressed', 'uncertain', 'confused', 'lost', 'trapped', 'stuck', 'doubt'],
        // Anxiety intensifiers
        intensifiers: ['so', 'very', 'terribly', 'extremely', 'completely'],
        weight: 1.1
      }
    };

    // Advanced scoring algorithm
    const emotionScores = {};
    const totalWords = words.length;
    
    for (const [emotion, data] of Object.entries(emotionLexicon)) {
      let score = 0;
      let wordCount = 0;
      
      // Score different types of emotional indicators
      for (const category of ['direct', 'actions', 'concepts', 'intensifiers']) {
        const categoryWords = data[category] || [];
        for (const word of categoryWords) {
          const matches = words.filter(w => w.includes(word)).length;
          if (matches > 0) {
            const categoryWeight = category === 'direct' ? 2.0 : 
                                 category === 'actions' ? 1.8 : 
                                 category === 'concepts' ? 1.5 : 1.2;
            score += matches * data.weight * categoryWeight;
            wordCount += matches;
          }
        }
      }
      
      // Context analysis - check for negations and intensifiers
      for (let i = 0; i < words.length - 1; i++) {
        const currentWord = words[i];
        const nextWord = words[i + 1];
        
        // Check for negations
        if (['not', 'no', 'never', 'dont', 'wont', 'cant'].includes(currentWord)) {
          // Reduce score for negated emotions
          const negatedEmotion = Object.keys(emotionLexicon).find(e => 
            emotionLexicon[e].direct.includes(nextWord) || 
            emotionLexicon[e].concepts.includes(nextWord)
          );
          if (negatedEmotion) {
            emotionScores[negatedEmotion] = (emotionScores[negatedEmotion] || 0) - 0.5;
          }
        }
      }
      
      // Normalize score based on text length and word frequency
      if (wordCount > 0) {
        const frequency = wordCount / totalWords;
        const intensity = Math.min(1, frequency * 5); // More sensitive scaling
        score = Math.min(1, score / Math.max(1, totalWords * 0.02)) * intensity; // More sensitive normalization
        
        // Boost score for emotional content
        if (score > 0.1) {
          score = Math.min(1, score * 1.5); // Boost meaningful scores
        }
      }
      
      emotionScores[emotion] = Math.max(0, score);
    }

    // Find dominant emotion with proper confidence calculation
    const sortedEmotions = Object.entries(emotionScores)
      .sort(([,a], [,b]) => b - a);

    const topEmotion = sortedEmotions[0];
    const secondEmotion = sortedEmotions[1];
    
    // Calculate confidence based on dominance
    const overallMood = topEmotion && topEmotion[1] > 0.05 ? topEmotion[0] : 'neutral'; // Lower threshold
    const topScore = topEmotion ? topEmotion[1] : 0;
    const secondScore = secondEmotion ? secondEmotion[1] : 0;
    
    // Confidence is higher when there's a clear winner
    const dominance = topScore - secondScore;
    const confidence = topScore > 0 ? Math.min(0.95, Math.max(0.6, topScore + dominance * 0.3)) : 0.5;
    
    // Calculate intensity based on emotional word density
    const emotionalWordDensity = Object.values(emotionScores).reduce((sum, score) => sum + score, 0);
    const intensity = Math.min(10, Math.max(1, Math.round(emotionalWordDensity * 8 + 2)));

    // Create emotion breakdown with proper normalization
    const totalEmotionScore = Object.values(emotionScores).reduce((sum, score) => sum + score, 0);
    const emotions = Object.entries(emotionScores)
      .filter(([, score]) => score > 0.05) // Only show emotions with meaningful scores
      .map(([emotion, score]) => ({
        emotion,
        score: totalEmotionScore > 0 ? Math.round((score / totalEmotionScore) * 100) / 100 : 0,
        color: this.getEmotionColor(emotion)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4); // Limit to top 4 emotions

    console.log(`🎵 Advanced analysis result: ${overallMood} (${Math.round(confidence * 100)}% confidence, intensity: ${intensity})`);
    console.log(`🎵 Emotion breakdown:`, emotions.map(e => `${e.emotion}: ${Math.round(e.score * 100)}%`).join(', '));
    
    return {
      overallMood,
      confidence: Math.min(1, confidence),
      intensity,
      emotions,
      rawScores: emotionScores
    };
  }

  async analyzeWithOpenRouter(lyrics) {
    try {
      console.log('🎵 Using OpenRouter API for lyrics sentiment analysis...');
      
      const prompt = `Analyze the emotional sentiment of these song lyrics and provide a detailed analysis. 

Lyrics:
"${lyrics}"

Please respond with a JSON object containing:
{
  "overallMood": "one of: happy, sad, angry, energetic, calm, anxious, neutral",
  "confidence": "number between 0 and 1",
  "intensity": "number between 1 and 10",
  "emotions": [
    {"emotion": "emotion_name", "score": 0.0-1.0, "color": "#hexcolor"},
    {"emotion": "emotion_name", "score": 0.0-1.0, "color": "#hexcolor"}
  ],
  "reasoning": "brief explanation of your analysis"
}

Focus on the emotional content, themes, and mood conveyed by the lyrics. Consider:
- Direct emotional words and phrases
- Metaphorical language and imagery
- Overall tone and atmosphere
- Context and implied emotions

Respond only with the JSON object, no additional text.`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:8000',
          'X-Title': 'MelodyMind Sentiment Analysis'
        },
        body: JSON.stringify({
          model: env.OPENROUTER_MODEL,
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.3,
          top_p: 0.9
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No response content from OpenRouter');
      }

      // Parse the JSON response
      let analysis;
      try {
        // Extract JSON from response (in case there's extra text)
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        } else {
          analysis = JSON.parse(content);
        }
      } catch (parseError) {
        console.log('🎵 Failed to parse OpenRouter JSON response:', parseError.message);
        console.log('🎵 Raw response:', content);
        throw new Error('Invalid JSON response from OpenRouter');
      }

      // Validate and normalize the response
      const overallMood = analysis.overallMood || 'neutral';
      const confidence = Math.min(1, Math.max(0, analysis.confidence || 0.7));
      const intensity = Math.min(10, Math.max(1, analysis.intensity || 5));
      
      // Ensure emotions array is properly formatted
      const emotions = Array.isArray(analysis.emotions) ? analysis.emotions.map(emotion => ({
        emotion: emotion.emotion || 'neutral',
        score: Math.min(1, Math.max(0, emotion.score || 0.5)),
        color: emotion.color || this.getEmotionColor(emotion.emotion || 'neutral')
      })) : [
        { emotion: overallMood, score: confidence, color: this.getEmotionColor(overallMood) }
      ];

      console.log(`🎵 OpenRouter Analysis result: ${overallMood} (${Math.round(confidence * 100)}% confidence, intensity: ${intensity})`);
      console.log(`🎵 Reasoning: ${analysis.reasoning || 'No reasoning provided'}`);
      
      return {
        overallMood,
        confidence: Math.min(1, confidence),
        intensity,
        emotions,
        source: 'openrouter',
        reasoning: analysis.reasoning || 'AI-powered analysis'
      };
    } catch (error) {
      console.log('🎵 OpenRouter analysis error:', error.message);
      return null;
    }
  }

  async analyzeWithHuggingFace(lyrics) {
    try {
      // Use Hugging Face sentiment analysis model
      const modelId = 'cardiffnlp/twitter-roberta-base-sentiment-latest';
      const response = await fetch(`https://api-inference.huggingface.co/models/${modelId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.HF_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: lyrics.substring(0, 500) }) // Limit input length
      });

      if (!response.ok) {
        throw new Error(`HF API error: ${response.status}`);
      }

      const results = await response.json();
      
      if (Array.isArray(results) && results[0] && Array.isArray(results[0])) {
        const sentimentScores = results[0];
        
        // Map HF sentiment labels to our mood system
        const sentimentMapping = {
          'LABEL_0': 'sad',      // Negative
          'LABEL_1': 'neutral',  // Neutral  
          'LABEL_2': 'happy'     // Positive
        };
        
        // Find the highest scoring sentiment
        const topSentiment = sentimentScores.reduce((max, current) => 
          current.score > max.score ? current : max
        );
        
        const overallMood = sentimentMapping[topSentiment.label] || 'neutral';
        const confidence = topSentiment.score;
        
        // Calculate intensity based on confidence
        const intensity = Math.min(10, Math.max(1, Math.round(confidence * 10)));
        
        // Create emotion breakdown
        const emotions = sentimentScores.map(sentiment => ({
          emotion: sentimentMapping[sentiment.label] || 'neutral',
          score: sentiment.score,
          color: this.getEmotionColor(sentimentMapping[sentiment.label] || 'neutral')
        })).sort((a, b) => b.score - a.score);

        console.log(`🎵 HF Analysis result: ${overallMood} (${Math.round(confidence * 100)}% confidence, intensity: ${intensity})`);
        
        return {
          overallMood,
          confidence: Math.min(1, confidence),
          intensity,
          emotions,
          source: 'huggingface'
        };
      }
    } catch (error) {
      console.log('🎵 Hugging Face analysis error:', error.message);
      return null;
    }
  }

  getEmotionColor(emotion) {
    const colors = {
      happy: '#4caf50',
      sad: '#f44336',
      angry: '#ff5722',
      energetic: '#ff9800',
      calm: '#2196f3',
      anxious: '#e91e63',
      neutral: '#9e9e9e'
    };
    return colors[emotion] || colors.neutral;
  }
}

class AudioAdapter {
  async analyzeAudio(buffer, transcript = '') {
    if (env.AI_AUDIO_ADAPTER === 'mock' || !env.HF_API_TOKEN || env.HF_API_TOKEN === '') {
      // Return mock audio analysis result
      const mockEmotions = ['happy', 'sad', 'angry', 'anxious', 'calm', 'excited', 'neutral'];
      const randomEmotion = mockEmotions[Math.floor(Math.random() * mockEmotions.length)];
      const confidence = 0.6 + Math.random() * 0.3; // 0.6 to 0.9
      const intensity = Math.floor(confidence * 10);
      
      return { 
        moodLabel: randomEmotion, 
        confidence: confidence, 
        intensity: intensity, 
        features: { 
          audioLength: buffer.length,
          sampleRate: 16000,
          channels: 1
        },
        rawScore: confidence
      };
    }
    
    // Use text analysis for audio when AI_AUDIO_ADAPTER is set to 'text'
    if (env.AI_AUDIO_ADAPTER === 'text' && transcript) {
      console.log('🎤 Using text analysis for audio emotion detection');
      return await ai.text.analyzeText(transcript);
    }
    
    try {
      // HF superb emotion recognition: input is binary audio
      const out = await hfRequest(env.HF_AUDIO_MODEL_ID, buffer, true);
      // Output format varies; try to map common patterns
      let label = 'neutral';
      let score = 0.6;
      if (Array.isArray(out) && out[0]?.label) {
        label = String(out[0].label).toLowerCase();
        score = Number(out[0].score) || 0.6;
      }
      const moodMap = { happy: 'happy', anger: 'angry', angry: 'angry', sad: 'sad', sadness: 'sad', fear: 'anxious', fearful: 'anxious', disgust: 'disgust', surprise: 'surprise', surprised: 'surprise', neutral: 'neutral', calm: 'calm' };
      const moodLabel = moodMap[label] || 'neutral';
      const intensity = Math.min(10, Math.max(0, score * 10));
      return { moodLabel, confidence: score, intensity, features: {} , rawScore: score };
    } catch (error) {
      console.warn('HF audio analysis failed, using mock:', error.message);
      // Fallback to mock analysis
      const mockEmotions = ['happy', 'sad', 'angry', 'anxious', 'calm', 'excited', 'neutral'];
      const randomEmotion = mockEmotions[Math.floor(Math.random() * mockEmotions.length)];
      const confidence = 0.6 + Math.random() * 0.3;
      const intensity = Math.floor(confidence * 10);
      
      return { 
        moodLabel: randomEmotion, 
        confidence: confidence, 
        intensity: intensity, 
        features: { 
          audioLength: buffer.length,
          sampleRate: 16000,
          channels: 1
        },
        rawScore: confidence
      };
    }
  }
}

class RecommendationAdapter {
  async recommend({ moodLabel, history = [], limit = 20 }) {
    const genres = moodLabel === 'happy' ? ['pop'] : moodLabel === 'energetic' ? ['rock'] : moodLabel === 'sad' ? ['acoustic', 'indie'] : ['ambient'];
    return { genres, limit, seedHistory: history.slice(-20) };
  }

  async embed(text) {
    if (!env.HF_API_TOKEN) throw new Error('HF_API_TOKEN not set');
    const out = await hfRequest(env.HF_EMBED_MODEL_ID, { inputs: text });
    // Expect nested arrays; flatten first row
    const v = Array.isArray(out) ? (Array.isArray(out[0]) ? out[0] : out) : out;
    return Float32Array.from(v);
  }

  cosine(a, b) {
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length && i < b.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
    return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8);
  }

  async rankSongs({ moodLabel, history, songs }) {
    if (env.AI_RECO_ADAPTER !== 'hf' || !env.HF_API_TOKEN) return songs; // no-op
    const userText = [
      `Current mood: ${moodLabel}.`,
      ...(history || []).slice(0, 10).map((h) => `Journal mood: ${h.moodLabel}, notes: ${h.notes || ''}`),
    ].join('\n');
    const userVec = await this.embed(userText);
    const scored = [];
    for (const s of songs) {
      const meta = `${s.title || ''} ${s.artist || ''} ${Array.isArray(s.genres) ? s.genres.join(' ') : ''} ${Array.isArray(s.moodTags) ? s.moodTags.join(' ') : ''}`;
      const v = await this.embed(meta);
      const score = this.cosine(userVec, v);
      scored.push({ s, score });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.map((x) => x.s);
  }
}

export const ai = {
  face: new FaceAdapter(),
  text: new TextAdapter(),
  audio: new AudioAdapter(),
  reco: new RecommendationAdapter(),
};


