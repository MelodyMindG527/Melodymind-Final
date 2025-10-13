import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { ai } from '../services/ai/index.js';

const router = express.Router();

function parseCommand(text) {
  const t = String(text || '').trim().toLowerCase();
  if (!t) return { action: null };

  // Basic verb commands
  if (/(^|\s)(pause|hold|wait|stop playing)(\s|$)/.test(t)) return { action: 'pause' };
  if (/(^|\s)(resume|continue|play)(\s|$)/.test(t)) return { action: 'resume' };
  if (/(^|\s)(next|skip)(\s|$)/.test(t)) return { action: 'next' };
  if (/(^|\s)(previous|back|prev)(\s|$)/.test(t)) return { action: 'previous' };
  if (/(^|\s)(stop)(\s|$)/.test(t)) return { action: 'stop' };
  if (/volume up|turn it up|louder/.test(t)) return { action: 'volume_up' };
  if (/volume down|turn it down|softer|quieter/.test(t)) return { action: 'volume_down' };

  // Play specific
  const playMatch = t.match(/play\s+(.*)/);
  if (playMatch) {
    const query = playMatch[1].trim();
    return { action: 'play', parameters: { query } };
  }

  return { action: null };
}

// Normalize a mood from free text using AI text analyzer
async function detectMoodFromText(text) {
  const res = await ai.text.analyzeText(text);
  return {
    mood_label: res.moodLabel,
    intensity: res.intensity,
    confidence: res.confidence,
    raw_score: res.rawScore,
  };
}

// POST /voice/command -> parse a command string and optionally a mood
router.post('/command', requireAuth, async (req, res, next) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ success: false, message: 'text required' });
    const command = parseCommand(text);
    const mood = await detectMoodFromText(text);
    res.json({ success: true, command, mood });
  } catch (e) { next(e); }
});

// POST /voice/analyze -> analyze transcript for mood and commands (alias)
router.post('/analyze', requireAuth, async (req, res, next) => {
  try {
    const { transcript } = req.body || {};
    if (!transcript) return res.status(400).json({ success: false, message: 'transcript required' });
    const command = parseCommand(transcript);
    const mood = await detectMoodFromText(transcript);
    res.json({ success: true, command, mood });
  } catch (e) { next(e); }
});

// POST /analyze-speech-emotion -> analyze audio and transcript for emotion
router.post('/analyze-speech-emotion', async (req, res, next) => {
  try {
    const { audio, transcript, sample_rate } = req.body || {};
    
    if (!audio && !transcript) {
      return res.status(400).json({ 
        success: false, 
        message: 'Either audio or transcript is required' 
      });
    }

    let result;
    
    // If we have audio, analyze it
    if (audio) {
      try {
        // Convert base64 audio to buffer
        const audioBuffer = Buffer.from(audio, 'base64');
        result = await ai.audio.analyzeAudio(audioBuffer, transcript);
      } catch (audioErr) {
        console.warn('Audio analysis failed, falling back to text:', audioErr);
        // Fall back to text analysis if audio fails
        if (transcript) {
          result = await ai.text.analyzeText(transcript);
        } else {
          throw new Error('Both audio and text analysis failed');
        }
      }
    } else if (transcript) {
      // Use text analysis
      result = await ai.text.analyzeText(transcript);
    }

    // Format response to match frontend expectations
    const response = {
      emotion: result.moodLabel,
      confidence: result.confidence,
      intensity: result.intensity,
      predictions: [
        {
          emotion: result.moodLabel,
          score: result.confidence,
          percentage: result.confidence * 100
        }
      ],
      analysis_method: audio ? 'speech_emotion_recognition' : 'text_analysis',
      model_used: 'melodymind-ai-adapter',
      timestamp: new Date().toISOString(),
      transcript: transcript || '',
      raw_score: result.rawScore || result.confidence
    };

    res.json(response);
  } catch (e) { 
    console.error('Speech emotion analysis error:', e);
    next(e); 
  }
});

export default router;


