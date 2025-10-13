import express from 'express';

const router = express.Router();

// Chat endpoint that proxies to OpenRouter API
router.post('/chat', async (req, res, next) => {
  try {
    const { message, model = 'openai/gpt-3.5-turbo' } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Use the OpenRouter API key from environment
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    // Check if API key is valid
    if (!apiKey || apiKey === 'your-openrouter-api-key-here' || apiKey.length < 20) {
      console.log('No valid OpenRouter API key found, using fallback response');
      const fallbackResponse = generateFallbackResponse(message);
      return res.json({
        success: true,
        message: fallbackResponse,
        source: 'fallback'
      });
    }
    
    const requestBody = {
      model: model,
      messages: [
        {
          role: "system",
          content: "You are MelodyMind AI, a friendly music assistant. You help users with music recommendations based on mood, explaining MelodyMind features, mood detection technology, playlist creation, voice controls, and music genres. Keep responses helpful, musical, and engaging."
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
      stream: false
    };

    console.log('Sending request to OpenRouter:', { model, message: message.substring(0, 100) + '...' });
    
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': req.get('origin') || 'http://localhost:3001',
          'X-Title': 'MelodyMind Chat'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        let errorMessage = `OpenRouter API error: ${response.status}`;
        try {
          const errorData = await response.json();
          console.error('OpenRouter API Error Response:', errorData);
          errorMessage = errorData.error?.message || errorData.message || errorMessage;
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const botMessage = data.choices[0].message.content;
      
      return res.json({
        success: true,
        message: botMessage,
        source: 'openrouter'
      });
      
    } catch (apiError) {
      console.error('OpenRouter API failed, using fallback response:', apiError.message);
      
      // Fallback response when OpenRouter API fails
      const fallbackResponse = generateFallbackResponse(message);
      
      return res.json({
        success: true,
        message: fallbackResponse,
        source: 'fallback'
      });
    }

  } catch (error) {
    console.error('Chat API error:', error);
    next(error);
  }
});

// Fallback response function
function generateFallbackResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  // Music and playback questions
  if (lowerMessage.includes('music') || lowerMessage.includes('play') || lowerMessage.includes('song')) {
    return "🎵 **How to Play Music in MelodyMind:**\n\n1. **Mood Detection**: Use camera, text, or voice to detect your mood\n2. **Browse by Mood**: Select from happy, sad, energetic, or calm categories\n3. **Smart Recommendations**: AI suggests songs based on your emotional state\n4. **Click to Play**: Simply click any song to start playing\n5. **YouTube Integration**: All songs play through YouTube Music\n\nTry using the mood detection features to get personalized recommendations!";
  }
  
  // Camera analysis questions
  if (lowerMessage.includes('camera') || lowerMessage.includes('analysis') || lowerMessage.includes('face')) {
    return "📸 **Camera Analysis in MelodyMind:**\n\n• **Facial Expression Detection**: Uses AI to analyze your facial expressions\n• **Emotion Recognition**: Detects emotions like happy, sad, angry, surprised\n• **Real-time Analysis**: Captures your current mood instantly\n• **Music Matching**: Recommends songs that match your detected emotion\n• **Privacy Focused**: Analysis happens locally, your images aren't stored\n\nClick 'Detect Your Mood' and allow camera access to try it!";
  }
  
  // Music recommendation questions
  if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || lowerMessage.includes('sad songs') || lowerMessage.includes('happy songs')) {
    return "🎶 **Music Recommendations:**\n\n**For Sad Mood:**\n• Someone Like You - Adele\n• The Sound of Silence - Simon & Garfunkel\n• Hurt - Johnny Cash\n\n**For Happy Mood:**\n• Happy - Pharrell Williams\n• Can't Stop the Feeling - Justin Timberlake\n• Walking on Sunshine - Katrina & The Waves\n\n**For Energetic Mood:**\n• Eye of the Tiger - Survivor\n• Lose Yourself - Eminem\n• Thunder - Imagine Dragons\n\nUse mood detection to get personalized recommendations!";
  }
  
  // Smart playlist questions
  if (lowerMessage.includes('smart playlist') || lowerMessage.includes('playlist')) {
    return "🎼 **Smart Playlists in MelodyMind:**\n\n• **AI-Generated**: Creates playlists based on your mood and preferences\n• **Mood-Based**: Different playlists for different emotional states\n• **Personalized**: Learns from your listening habits\n• **Dynamic**: Updates based on your current mood\n• **Easy Creation**: Just click 'Smart Playlist' and let AI do the work\n\nTry the Smart Playlist feature to discover new music!";
  }
  
  // Mood detection questions
  if (lowerMessage.includes('mood') || lowerMessage.includes('emotion') || lowerMessage.includes('detection')) {
    return "😊 **Mood Detection Technology:**\n\n**Three Methods:**\n1. **Camera Analysis**: Detects facial expressions and emotions\n2. **Text Input**: Analyzes how you describe your feelings\n3. **Voice Analysis**: Understands your emotional state from speech\n\n**How It Works:**\n• AI processes your input in real-time\n• Matches your mood with suitable music\n• Provides personalized recommendations\n• Updates as your mood changes\n\nTry all three methods to see which works best for you!";
  }
  
  // General MelodyMind questions
  if (lowerMessage.includes('melodymind') || lowerMessage.includes('what is') || lowerMessage.includes('app')) {
    return "🎶 **Welcome to MelodyMind!**\n\nMelodyMind is your AI-powered music companion that:\n\n• **Detects Your Mood**: Through camera, text, or voice\n• **Recommends Music**: Based on your emotional state\n• **Creates Playlists**: AI-generated smart playlists\n• **Voice Controls**: Hands-free music control\n• **Mood Analytics**: Tracks your listening patterns\n\n**Get Started:**\n1. Try mood detection (camera, text, or voice)\n2. Browse songs by mood category\n3. Create smart playlists\n4. Use voice controls for hands-free operation\n\nWhat would you like to explore first?";
  }
  
  // Help questions
  if (lowerMessage.includes('help') || lowerMessage.includes('how to use') || lowerMessage.includes('guide')) {
    return "🤖 **MelodyMind User Guide:**\n\n**Main Features:**\n• **Mood Detection**: Camera, text, or voice input\n• **Music Player**: YouTube-integrated playback\n• **Smart Playlists**: AI-generated recommendations\n• **Voice Controls**: Hands-free operation\n• **Analytics**: Track your listening habits\n\n**Quick Start:**\n1. Click 'Detect Your Mood' to get started\n2. Browse songs by mood category\n3. Click any song to play\n4. Use voice controls for hands-free operation\n5. Create smart playlists for different moods\n\nNeed help with a specific feature? Just ask!";
  }
  
  // Default response
  return "🎵 **Hello! I'm MelodyMind AI** 🎵\n\nI'm here to help you with:\n• Music recommendations based on your mood\n• Explaining MelodyMind features\n• Mood detection technology\n• Playlist creation\n• Voice controls\n• And much more!\n\n**Try asking me:**\n• 'How to play music?'\n• 'How does camera analysis work?'\n• 'Recommend happy songs'\n• 'What is smart playlist?'\n• 'How does mood detection work?'\n\nWhat would you like to know about MelodyMind?";
}

export default router;
