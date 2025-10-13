import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { ai } from '../services/ai/index.js';
import { Song } from '../models/Song.js';

const router = express.Router();

// Get song recommendations from database with fallback to curated YouTube songs
const getMoodRecommendations = async (mood) => {
  try {
    // Try to get songs from database first
    const dbSongs = await Song.find({
      $or: [
        { moodTags: mood },
        { genres: { $in: getGenresForMood(mood) } }
      ],
      youtubeId: { $exists: true, $ne: null } // Only songs with YouTube IDs
    })
    .limit(6)
    .sort({ createdAt: -1 });

    if (dbSongs && dbSongs.length > 0) {
      console.log(`🎵 Found ${dbSongs.length} songs from database for mood: ${mood}`);
      return dbSongs.map(song => ({
        title: song.title,
        artist: song.artist,
        mood: mood,
        reason: `Perfect ${mood} song from your music library`,
        youtubeId: song.youtubeId,
        url: song.url || `https://www.youtube.com/watch?v=${song.youtubeId}`,
        cover: song.coverUrl || `https://i.ytimg.com/vi/${song.youtubeId}/hqdefault.jpg`,
        album: song.album || song.title,
        duration: song.duration || 180,
        genre: song.genres?.[0] || 'pop'
      }));
    }
  } catch (error) {
    console.log('🎵 No songs found in database, using curated recommendations:', error.message);
  }

  // Fallback to curated YouTube recommendations
  const recommendations = {
    happy: [
      {
        title: "Happy",
        artist: "Pharrell Williams",
        mood: "happy",
        reason: "Perfect upbeat anthem to match your positive lyrics",
        youtubeId: "ZbZSe6N_BXs",
        url: "https://www.youtube.com/watch?v=ZbZSe6N_BXs",
        cover: "https://i.ytimg.com/vi/ZbZSe6N_BXs/hqdefault.jpg",
        album: "Girl",
        duration: 233,
        genre: "pop"
      },
      {
        title: "Can't Stop the Feeling",
        artist: "Justin Timberlake",
        mood: "happy",
        reason: "Energetic pop song that radiates joy and positivity",
        youtubeId: "ru0K8uYEZWw",
        url: "https://www.youtube.com/watch?v=ru0K8uYEZWw",
        cover: "https://i.ytimg.com/vi/ru0K8uYEZWw/hqdefault.jpg",
        album: "Trolls",
        duration: 237,
        genre: "pop"
      },
      {
        title: "Good Vibrations",
        artist: "The Beach Boys",
        mood: "happy",
        reason: "Classic feel-good song with uplifting harmonies",
        youtubeId: "Eab_beh07HU",
        url: "https://www.youtube.com/watch?v=Eab_beh07HU",
        cover: "https://i.ytimg.com/vi/Eab_beh07HU/hqdefault.jpg",
        album: "Smiley Smile",
        duration: 175,
        genre: "pop"
      }
    ],
    sad: [
      {
        title: "Someone Like You",
        artist: "Adele",
        mood: "sad",
        reason: "Emotional ballad that captures the depth of sadness",
        youtubeId: "hLQl3WQQoQ0",
        url: "https://www.youtube.com/watch?v=hLQl3WQQoQ0",
        cover: "https://i.ytimg.com/vi/hLQl3WQQoQ0/hqdefault.jpg",
        album: "21",
        duration: 285,
        genre: "soul"
      },
      {
        title: "Fix You",
        artist: "Coldplay",
        mood: "sad",
        reason: "Comforting song that provides solace in difficult times",
        youtubeId: "k4V3Mo61fJM",
        url: "https://www.youtube.com/watch?v=k4V3Mo61fJM",
        cover: "https://i.ytimg.com/vi/k4V3Mo61fJM/hqdefault.jpg",
        album: "X&Y",
        duration: 295,
        genre: "rock"
      },
      {
        title: "Mad World",
        artist: "Gary Jules",
        mood: "sad",
        reason: "Melancholic masterpiece that resonates with sorrow",
        youtubeId: "4N3N1MlvVc4",
        url: "https://www.youtube.com/watch?v=4N3N1MlvVc4",
        cover: "https://i.ytimg.com/vi/4N3N1MlvVc4/hqdefault.jpg",
        album: "Trading Snakeoil for Wolftickets",
        duration: 203,
        genre: "indie"
      }
    ],
    energetic: [
      {
        title: "Eye of the Tiger",
        artist: "Survivor",
        mood: "energetic",
        reason: "High-energy anthem that matches your powerful lyrics",
        youtubeId: "btPJPFnesV4",
        url: "https://www.youtube.com/watch?v=btPJPFnesV4",
        cover: "https://i.ytimg.com/vi/btPJPFnesV4/hqdefault.jpg",
        album: "Eye of the Tiger",
        duration: 245,
        genre: "rock"
      },
      {
        title: "Thunderstruck",
        artist: "AC/DC",
        mood: "energetic",
        reason: "Electrifying rock song with intense energy",
        youtubeId: "v2AC41dglnM",
        url: "https://www.youtube.com/watch?v=v2AC41dglnM",
        cover: "https://i.ytimg.com/vi/v2AC41dglnM/hqdefault.jpg",
        album: "The Razors Edge",
        duration: 292,
        genre: "rock"
      },
      {
        title: "Stronger",
        artist: "Kanye West",
        mood: "energetic",
        reason: "Empowering hip-hop track that builds momentum",
        youtubeId: "PsO6ZnUZI0g",
        url: "https://www.youtube.com/watch?v=PsO6ZnUZI0g",
        cover: "https://i.ytimg.com/vi/PsO6ZnUZI0g/hqdefault.jpg",
        album: "Graduation",
        duration: 312,
        genre: "hip-hop"
      }
    ],
    angry: [
      {
        title: "Killing in the Name",
        artist: "Rage Against the Machine",
        mood: "angry",
        reason: "Intense protest song that channels raw anger",
        youtubeId: "bWXazVhlyx4",
        url: "https://www.youtube.com/watch?v=bWXazVhlyx4",
        cover: "https://i.ytimg.com/vi/bWXazVhlyx4/hqdefault.jpg",
        album: "Rage Against the Machine",
        duration: 315,
        genre: "metal"
      },
      {
        title: "Break Stuff",
        artist: "Limp Bizkit",
        mood: "angry",
        reason: "Aggressive nu-metal track that expresses frustration",
        youtubeId: "bWXazVhlyx4",
        url: "https://www.youtube.com/watch?v=bWXazVhlyx4",
        cover: "https://i.ytimg.com/vi/bWXazVhlyx4/hqdefault.jpg",
        album: "Significant Other",
        duration: 167,
        genre: "metal"
      },
      {
        title: "Smells Like Teen Spirit",
        artist: "Nirvana",
        mood: "angry",
        reason: "Grunge anthem that captures rebellious energy",
        youtubeId: "hTWKbfoikeg",
        url: "https://www.youtube.com/watch?v=hTWKbfoikeg",
        cover: "https://i.ytimg.com/vi/hTWKbfoikeg/hqdefault.jpg",
        album: "Nevermind",
        duration: 301,
        genre: "grunge"
      }
    ],
    calm: [
      {
        title: "Weightless",
        artist: "Marconi Union",
        mood: "calm",
        reason: "Scientifically designed to reduce anxiety and stress",
        youtubeId: "UfcAVejslrU",
        url: "https://www.youtube.com/watch?v=UfcAVejslrU",
        cover: "https://i.ytimg.com/vi/UfcAVejslrU/hqdefault.jpg",
        album: "Weightless",
        duration: 485,
        genre: "ambient"
      },
      {
        title: "Clair de Lune",
        artist: "Claude Debussy",
        mood: "calm",
        reason: "Peaceful classical piece that soothes the soul",
        youtubeId: "CvFH_6DNRCY",
        url: "https://www.youtube.com/watch?v=CvFH_6DNRCY",
        cover: "https://i.ytimg.com/vi/CvFH_6DNRCY/hqdefault.jpg",
        album: "Suite Bergamasque",
        duration: 295,
        genre: "classical"
      },
      {
        title: "Pure Shores",
        artist: "All Saints",
        mood: "calm",
        reason: "Dreamy pop song with tranquil vibes",
        youtubeId: "kO8x8eoU3L4",
        url: "https://www.youtube.com/watch?v=kO8x8eoU3L4",
        cover: "https://i.ytimg.com/vi/kO8x8eoU3L4/hqdefault.jpg",
        album: "Saints & Sinners",
        duration: 268,
        genre: "pop"
      }
    ],
    anxious: [
      {
        title: "Breathe",
        artist: "Pink Floyd",
        mood: "calm",
        reason: "Meditative song that helps with anxiety and breathing",
        youtubeId: "sUgoBb8m3eE",
        url: "https://www.youtube.com/watch?v=sUgoBb8m3eE",
        cover: "https://i.ytimg.com/vi/sUgoBb8m3eE/hqdefault.jpg",
        album: "The Dark Side of the Moon",
        duration: 163,
        genre: "progressive rock"
      },
      {
        title: "Weightless",
        artist: "Marconi Union",
        mood: "calm",
        reason: "The most relaxing song ever recorded, perfect for anxiety",
        youtubeId: "UfcAVejslrU",
        url: "https://www.youtube.com/watch?v=UfcAVejslrU",
        cover: "https://i.ytimg.com/vi/UfcAVejslrU/hqdefault.jpg",
        album: "Weightless",
        duration: 485,
        genre: "ambient"
      },
      {
        title: "Mad World",
        artist: "Gary Jules",
        mood: "sad",
        reason: "Gentle melody that acknowledges anxious feelings",
        youtubeId: "4N3N1MlvVc4",
        url: "https://www.youtube.com/watch?v=4N3N1MlvVc4",
        cover: "https://i.ytimg.com/vi/4N3N1MlvVc4/hqdefault.jpg",
        album: "Trading Snakeoil for Wolftickets",
        duration: 203,
        genre: "indie"
      }
    ]
  };

  return recommendations[mood] || recommendations.happy;
};

// Helper function to get genres for mood
const getGenresForMood = (mood) => {
  const moodGenres = {
    happy: ['pop', 'dance', 'electronic', 'upbeat'],
    sad: ['indie', 'acoustic', 'soul', 'ballad'],
    energetic: ['rock', 'metal', 'hip-hop', 'electronic'],
    angry: ['metal', 'punk', 'grunge', 'hard rock'],
    calm: ['ambient', 'classical', 'chill', 'acoustic'],
    anxious: ['ambient', 'chill', 'meditation', 'soft rock']
  };
  return moodGenres[mood] || ['pop'];
};

// POST /api/sentiment/analyze (no auth required)
router.post('/analyze', async (req, res) => {
  try {
    const { lyrics } = req.body;

    if (!lyrics || typeof lyrics !== 'string' || lyrics.trim().length === 0) {
      return res.status(400).json({
        error: 'Lyrics are required and must be a non-empty string'
      });
    }

    if (lyrics.length > 10000) {
      return res.status(400).json({
        error: 'Lyrics are too long. Please limit to 10,000 characters.'
      });
    }

    console.log('🎵 Analyzing sentiment for lyrics:', lyrics.substring(0, 100) + '...');

    // Analyze sentiment using the AI service
    const sentimentResult = await ai.text.analyzeLyricsSentiment(lyrics);

    // Get mood-based recommendations
    const recommendations = await getMoodRecommendations(sentimentResult.overallMood);

    // Create the response object
    const response = {
      overallMood: sentimentResult.overallMood,
      confidence: sentimentResult.confidence,
      intensity: sentimentResult.intensity,
      emotions: sentimentResult.emotions,
      lyrics: lyrics.trim(),
      recommendations: recommendations
    };

    console.log('🎵 Sentiment analysis completed:', {
      mood: sentimentResult.overallMood,
      confidence: Math.round(sentimentResult.confidence * 100) + '%',
      intensity: sentimentResult.intensity + '/10',
      emotionCount: sentimentResult.emotions.length
    });

    res.json(response);

  } catch (error) {
    console.error('🎵 Sentiment analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze sentiment',
      message: error.message
    });
  }
});

// GET /api/sentiment/moods - Get available moods
router.get('/moods', requireAuth, (req, res) => {
  const moods = [
    { name: 'happy', color: '#4caf50', description: 'Joyful and upbeat emotions' },
    { name: 'sad', color: '#f44336', description: 'Melancholic and sorrowful feelings' },
    { name: 'angry', color: '#ff5722', description: 'Intense and aggressive emotions' },
    { name: 'energetic', color: '#ff9800', description: 'High-energy and dynamic feelings' },
    { name: 'calm', color: '#2196f3', description: 'Peaceful and tranquil emotions' },
    { name: 'anxious', color: '#e91e63', description: 'Worried and nervous feelings' },
    { name: 'neutral', color: '#9e9e9e', description: 'Balanced and neutral emotions' }
  ];

  res.json({ moods });
});

// GET /api/sentiment/recommendations/:mood - Get recommendations for specific mood
router.get('/recommendations/:mood', requireAuth, (req, res) => {
  try {
    const { mood } = req.params;
    const recommendations = getMoodRecommendations(mood);

    if (!recommendations) {
      return res.status(404).json({
        error: 'Invalid mood. Available moods: happy, sad, angry, energetic, calm, anxious'
      });
    }

    res.json({ mood, recommendations });
  } catch (error) {
    console.error('🎵 Recommendations error:', error);
    res.status(500).json({
      error: 'Failed to get recommendations',
      message: error.message
    });
  }
});

export default router;
