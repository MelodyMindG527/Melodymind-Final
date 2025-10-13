import React, { useState, useRef, useCallback } from 'react';
import{
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  IconButton,
  Grid,
  Avatar,
} from '@mui/material';
import { 
  Mic, 
  MicOff, 
  Close, 
  CheckCircle,
  RecordVoiceOver,
  PlayArrow,
  VolumeUp,
  Psychology,
  MusicNote
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// Backend server URL for speech emotion analysis
const API_URL = 'http://127.0.0.1:8000/api/v1';

interface VoiceControlProps {
  open: boolean;
  onClose: () => void;
  onMoodDetected: (mood: any) => void;
}

interface EmotionResult {
  emotion: string;
  confidence: number;
  predictions: Array<{ emotion: string; score: number; percentage: number }>;
  analysis_method: string;
  model_used: string;
  timestamp: string;
}

// Song suggestions for different moods
const moodSongs = {
  happy: [
    { id: "1", title: "Yemito", artist: "Hari Charan", youtubeId: "ZPZmMrUn63w", url: "https://www.youtube.com/watch?v=ZPZmMrUn63w", cover: "https://i.ytimg.com/vi/ZPZmMrUn63w/hqdefault.jpg" },
    { id: "2", title: "Can't Stop the Feeling", artist: "Justin Timberlake", youtubeId: "ru0K8uYEZWw", url: "https://www.youtube.com/watch?v=ru0K8uYEZWw", cover: "https://i.ytimg.com/vi/ru0K8uYEZWw/hqdefault.jpg" }
  ],
  sad: [
    { id: "3", title: "Someone Like You", artist: "Adele", youtubeId: "hLQl3WQQoQ0", url: "https://www.youtube.com/watch?v=hLQl3WQQoQ0", cover: "https://i.ytimg.com/vi/hLQl3WQQoQ0/hqdefault.jpg" },
    { id: "4", title: "The Sound of Silence", artist: "Simon & Garfunkel", youtubeId: "4zLfCnGVeL4", url: "https://www.youtube.com/watch?v=4zLfCnGVeL4", cover: "https://i.ytimg.com/vi/4zLfCnGVeL4/hqdefault.jpg" }
  ],
  angry: [
    { id: "5", title: "Eye of the Tiger", artist: "Survivor", youtubeId: "btPJPFnesV4", url: "https://www.youtube.com/watch?v=btPJPFnesV4", cover: "https://i.ytimg.com/vi/btPJPFnesV4/hqdefault.jpg" },
    { id: "6", title: "Lose Yourself", artist: "Eminem", youtubeId: "_Yhyp-_hX2s", url: "https://www.youtube.com/watch?v=_Yhyp-_hX2s", cover: "https://i.ytimg.com/vi/_Yhyp-_hX2s/hqdefault.jpg" }
  ],
  anxious: [
    { id: "7", title: "Weightless", artist: "Marconi Union", youtubeId: "UfcAVejslrU", url: "https://www.youtube.com/watch?v=UfcAVejslrU", cover: "https://i.ytimg.com/vi/UfcAVejslrU/hqdefault.jpg" },
    { id: "8", title: "Clair de Lune", artist: "Claude Debussy", youtubeId: "CvFH_6DNRCY", url: "https://www.youtube.com/watch?v=CvFH_6DNRCY", cover: "https://i.ytimg.com/vi/CvFH_6DNRCY/hqdefault.jpg" }
  ],
  neutral: [
    { id: "9", title: "River Flows in You", artist: "Yiruma", youtubeId: "7maJOI3QMu0", url: "https://www.youtube.com/watch?v=7maJOI3QMu0", cover: "https://i.ytimg.com/vi/7maJOI3QMu0/hqdefault.jpg" },
    { id: "10", title: "Gymnopédie No. 1", artist: "Erik Satie", youtubeId: "S-Xm7s9eGxU", url: "https://www.youtube.com/watch?v=S-Xm7s9eGxU", cover: "https://i.ytimg.com/vi/S-Xm7s9eGxU/hqdefault.jpg" }
  ],
  energetic: [
    { id: "11", title: "Eye of the Tiger", artist: "Survivor", youtubeId: "btPJPFnesV4", url: "https://www.youtube.com/watch?v=btPJPFnesV4", cover: "https://i.ytimg.com/vi/btPJPFnesV4/hqdefault.jpg" },
    { id: "12", title: "Lose Yourself", artist: "Eminem", youtubeId: "_Yhyp-_hX2s", url: "https://www.youtube.com/watch?v=_Yhyp-_hX2s", cover: "https://i.ytimg.com/vi/_Yhyp-_hX2s/hqdefault.jpg" }
  ]
};

// Test speech samples for different emotions
const testSpeechSamples = [
  {
    emotion: 'happy',
    text: "I'm feeling absolutely fantastic and excited about everything!",
    description: "Positive and cheerful mood"
  },
  {
    emotion: 'sad',
    text: "I'm feeling really down and miserable today, everything seems hopeless.",
    description: "Feeling low and melancholic"
  },
  {
    emotion: 'angry',
    text: "I'm so furious and frustrated with this situation!",
    description: "Frustrated and upset"
  },
  {
    emotion: 'anxious',
    text: "I'm feeling really anxious and worried about what's coming next.",
    description: "Worried and tense"
  },
  {
    emotion: 'neutral',
    text: "I'm feeling very calm and peaceful right now, just relaxed.",
    description: "Relaxed and peaceful"
  },
  {
    emotion: 'energetic',
    text: "I'm feeling so pumped and motivated to get things done!",
    description: "High energy and enthusiasm"
  }
];

const VoiceControl: React.FC<VoiceControlProps> = ({ open, onClose, onMoodDetected }) => {
  const [isListening, setIsListening] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [detectedMood, setDetectedMood] = useState<any>(null);
  const [error, setError] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isTesting, setIsTesting] = useState(false);
  const [playingSample, setPlayingSample] = useState<string | null>(null);
  const [progressMsg, setProgressMsg] = useState('Ready to analyze speech emotion');
  
  const webcamRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const recognitionRef = useRef<any>(null);

  const initializeSpeechRecognition = () => {
    // Check if browser supports Web Speech API
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setError(`Speech recognition error: ${event.error}`);
      stopListening();
    };

    recognitionRef.current.onend = () => {
      if (isListening) {
        recognitionRef.current.start();
      }
    };
  };

  const startAudioAnalysis = async (stream: MediaStream) => {
    try {
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const analyzeAudio = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        setAudioLevel(Math.min(average * 2, 100));
        
        if (isListening) {
          requestAnimationFrame(analyzeAudio);
        }
      };
      
      analyzeAudio();
    } catch (err) {
      console.warn('Audio analysis not available:', err);
    }
  };

  const startListening = async () => {
    try {
      setError('');
      setTranscript('');
      setDetectedMood(null);
      setIsListening(true);
      setRecordingTime(0);
      setProgressMsg('Listening... Speak now!');

      // Check if media devices are available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Media devices not supported in this browser');
      }

      // Initialize speech recognition
      initializeSpeechRecognition();

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Get microphone access with fallback options
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
      } catch (mediaError: any) {
        // Try with basic audio constraints if advanced ones fail
        console.warn('Advanced audio constraints failed, trying basic:', mediaError);
        stream = await navigator.mediaDevices.getUserMedia({ 
          audio: true 
        });
      }

      // Start audio analysis for visualization
      startAudioAnalysis(stream);

      // Start media recorder for emotion analysis
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.start(1000);

      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }

    } catch (err: any) {
      console.error('Microphone access error:', err);
      let errorMessage = 'Failed to access microphone. ';
      
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Please allow microphone access and try again.';
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No microphone found. Please connect a microphone.';
      } else if (err.name === 'NotSupportedError') {
        errorMessage += 'Microphone not supported in this browser.';
      } else {
        errorMessage += 'Please check your microphone permissions.';
      }
      
      setError(errorMessage);
      
      // Offer fallback to text input
      setProgressMsg('Microphone not available - you can still use text input');
      
      stopListening();
    }
  };

  const stopListening = async () => {
    setIsListening(false);
    setProgressMsg('Processing your speech...');
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await analyzeWithBackend(audioBlob, transcript);
      };
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // Clean up media stream
    if (mediaRecorderRef.current?.stream) {
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }

    // Safely close AudioContext if it exists and is not already closed
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (err) {
        console.warn('AudioContext close error in stopListening:', err);
      }
    }
    audioContextRef.current = null;

    setAudioLevel(0);
  };

  // Analyze with local backend (similar to webcam example)
  const analyzeWithBackend = async (audioBlob: Blob, speechText: string) => {
    setIsAnalyzing(true);
    setError('');
    
    try {
      setProgressMsg('Converting audio for analysis...');
      
      // Convert blob to base64 for sending to backend
      const audioBase64 = await blobToBase64(audioBlob);
      
      setProgressMsg('Sending to emotion analysis model...');
      
      const response = await fetch(`${API_URL}/analyze-speech-emotion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          audio: audioBase64,
          transcript: speechText,
          sample_rate: 16000 
        })
      });

      if (!response.ok) {
        throw new Error(`Backend error ${response.status}`);
      }

      const result: EmotionResult = await response.json();
      console.log('Speech emotion analysis result:', result);
      
      setProgressMsg('Analysis complete!');
      
      // Get song suggestions for the detected mood
      const songs = moodSongs[result.emotion as keyof typeof moodSongs] || moodSongs['neutral'];
      
      const mood = {
        type: result.emotion,
        intensity: Math.round(result.confidence * 10),
        confidence: result.confidence,
        source: 'speech_emotion_recognition',
        notes: `Speech analysis: "${speechText}"`,
        emotion: result.emotion,
        timestamp: new Date().toISOString(),
        predictions: result.predictions,
        model_used: result.model_used,
        analysis_method: result.analysis_method,
        songs: songs // Add song suggestions
      };

      setDetectedMood(mood);
      
    } catch (err: any) {
      console.error('Backend analysis error:', err);
      setError('Analysis failed. Using text-based fallback...');
      setProgressMsg('Using fallback analysis...');
      
      // Fallback to text-based emotion analysis
      await analyzeWithTextFallback(speechText);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Text-based fallback emotion analysis
  const analyzeWithTextFallback = async (text: string) => {
    console.log('🎯 Frontend fallback analysis for:', text);
    
    // Enhanced keyword-based emotion detection with priority order (same as backend)
    const happyKeywords = ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'fantastic', 'awesome', 'brilliant', 'delighted', 'cheerful', 'optimistic', 'grateful', 'proud', 'love', 'adore', 'enjoy', 'fun', 'laugh', 'smile', 'celebration', 'success', 'victory', 'win'];
    const energeticKeywords = ['energetic', 'pumped', 'hyped', 'motivated', 'active', 'dynamic', 'vigorous', 'lively', 'bouncy', 'peppy', 'enthusiastic', 'passionate', 'intense', 'powerful', 'strong', 'ready', 'fired up', 'raring to go'];
    const sadKeywords = ['sad', 'down', 'depressed', 'upset', 'miserable', 'heartbroken', 'grief', 'sorrow', 'melancholy', 'blue', 'unhappy', 'disappointed', 'hurt', 'pain', 'loss', 'cry', 'tears', 'lonely', 'empty', 'hopeless'];
    const angryKeywords = ['angry', 'mad', 'furious', 'annoyed', 'frustrated', 'irritated', 'rage', 'hate', 'disgusted', 'outraged', 'livid', 'enraged', 'pissed', 'aggravated', 'bothered', 'upset', 'fuming'];
    const anxiousKeywords = ['anxious', 'worried', 'nervous', 'scared', 'afraid', 'fearful', 'stressed', 'tense', 'panic', 'overwhelmed', 'uneasy', 'restless', 'apprehensive', 'concerned', 'troubled', 'distressed'];
    const calmKeywords = ['calm', 'peaceful', 'relaxed', 'chill', 'serene', 'tranquil', 'quiet', 'still', 'gentle', 'soft', 'mellow', 'soothing', 'comfortable', 'content', 'satisfied', 'at ease'];

    const textLower = text.toLowerCase();
    let detectedEmotion = 'neutral';
    let confidence = 0.6;

    // Check for emotion keywords in priority order (energetic before happy to catch "pumped")
    if (energeticKeywords.some(keyword => textLower.includes(keyword))) {
      detectedEmotion = 'energetic';
      confidence = 0.85;
      console.log('🎯 Frontend detected ENERGETIC mood from keywords');
    } else if (happyKeywords.some(keyword => textLower.includes(keyword))) {
      detectedEmotion = 'happy';
      confidence = 0.8;
      console.log('🎯 Frontend detected HAPPY mood from keywords');
    } else if (sadKeywords.some(keyword => textLower.includes(keyword))) {
      detectedEmotion = 'sad';
      confidence = 0.8;
      console.log('🎯 Frontend detected SAD mood from keywords');
    } else if (angryKeywords.some(keyword => textLower.includes(keyword))) {
      detectedEmotion = 'angry';
      confidence = 0.8;
      console.log('🎯 Frontend detected ANGRY mood from keywords');
    } else if (anxiousKeywords.some(keyword => textLower.includes(keyword))) {
      detectedEmotion = 'anxious';
      confidence = 0.8;
      console.log('🎯 Frontend detected ANXIOUS mood from keywords');
    } else if (calmKeywords.some(keyword => textLower.includes(keyword))) {
      detectedEmotion = 'neutral'; // Map calm to neutral for consistency
      confidence = 0.8;
      console.log('🎯 Frontend detected NEUTRAL mood from keywords');
    }

    // Get song suggestions for the detected mood
    const songs = moodSongs[detectedEmotion as keyof typeof moodSongs] || moodSongs['neutral'];
    
    const mood = {
      type: detectedEmotion,
      intensity: Math.round(confidence * 10),
      confidence: confidence,
      source: 'text_fallback_analysis',
      notes: `Text analysis: "${text}"`,
      emotion: detectedEmotion,
      timestamp: new Date().toISOString(),
      predictions: [{ emotion: detectedEmotion, score: confidence, percentage: Math.round(confidence * 100) }],
      model_used: 'keyword_based_fallback',
      analysis_method: 'text_keyword_matching',
      songs: songs // Add song suggestions
    };

    setDetectedMood(mood);
  };

  // Test with sample speech
  const testWithSampleSpeech = async (sample: any) => {
    setIsTesting(true);
    setPlayingSample(sample.emotion);
    setError('');
    setTranscript(sample.text);
    setDetectedMood(null);
    setProgressMsg(`Testing with ${sample.emotion} speech sample...`);

    try {
      // Convert text to speech using browser TTS
      const utterance = new SpeechSynthesisUtterance(sample.text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      
      // Speak the text
      window.speechSynthesis.speak(utterance);
      
      // Wait for speech to complete
      await new Promise(resolve => {
        utterance.onend = resolve;
        setTimeout(resolve, 3000); // Fallback timeout
      });

      // Create a mock audio blob for testing
      // In a real implementation, you'd capture the actual TTS audio
      const mockAudioBlob = await generateMockAudio(sample.emotion);
      
      // Analyze with backend
      await analyzeWithBackend(mockAudioBlob, sample.text);
      
    } catch (err) {
      setError('Failed to process test speech. Using text analysis...');
      await analyzeWithTextFallback(sample.text);
    } finally {
      setIsTesting(false);
      setPlayingSample(null);
    }
  };

  // Generate mock audio for testing
  const generateMockAudio = async (emotion: string): Promise<Blob> => {
    return new Promise((resolve) => {
      const audioContext = new AudioContext();
      const duration = 2; // seconds
      const sampleRate = 16000;
      const numberOfSamples = duration * sampleRate;
      
      const audioBuffer = audioContext.createBuffer(1, numberOfSamples, sampleRate);
      const channelData = audioBuffer.getChannelData(0);
      
      // Generate different tone patterns based on emotion
      let frequency = 200;
      let amplitude = 0.1;
      
      switch (emotion) {
        case 'happy':
          frequency = 300;
          amplitude = 0.3;
          break;
        case 'sad':
          frequency = 150;
          amplitude = 0.1;
          break;
        case 'angry':
          frequency = 250;
          amplitude = 0.4;
          break;
        case 'anxious':
          frequency = 280;
          amplitude = 0.2;
          break;
        default:
          frequency = 220;
          amplitude = 0.15;
      }
      
      // Fill buffer with sine wave
      for (let i = 0; i < numberOfSamples; i++) {
        const time = i / sampleRate;
        channelData[i] = amplitude * Math.sin(2 * Math.PI * frequency * time);
      }
      
      // Convert to WAV blob
      const wavBlob = audioBufferToWav(audioBuffer);
      resolve(wavBlob);
    });
  };

  // Convert audio buffer to WAV blob
  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const length = buffer.length;
    const sampleRate = buffer.sampleRate;
    const channels = buffer.numberOfChannels;
    
    const interleaved = new Float32Array(length * channels);
    for (let channel = 0; channel < channels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        interleaved[i * channels + channel] = channelData[i];
      }
    }
    
    const wavBuffer = new ArrayBuffer(44 + interleaved.length * 2);
    const view = new DataView(wavBuffer);
    
    // Write WAV header (simplified)
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + interleaved.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * channels * 2, true);
    view.setUint16(32, channels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, interleaved.length * 2, true);
    
    // Convert to 16-bit PCM
    let offset = 44;
    for (let i = 0; i < interleaved.length; i++) {
      const sample = Math.max(-1, Math.min(1, interleaved[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
    
    return new Blob([wavBuffer], { type: 'audio/wav' });
  };

  // Convert blob to base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]); // Remove data URL prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleConfirm = () => {
    if (detectedMood) {
      onMoodDetected(detectedMood);
      handleClose();
    }
  };

  const handleClose = () => {
    stopListening();
    cleanup();
    onClose();
  };

  const cleanup = () => {
    setIsListening(false);
    setIsAnalyzing(false);
    setIsTesting(false);
    setPlayingSample(null);
    setTranscript('');
    setDetectedMood(null);
    setError('');
    setAudioLevel(0);
    setRecordingTime(0);
    setProgressMsg('Ready to analyze speech emotion');
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Safely close AudioContext if it exists and is not already closed
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (err) {
        console.warn('AudioContext close error:', err);
      }
    }
    audioContextRef.current = null;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
  };

  const getMoodColor = (moodType: string) => {
    const colors: { [key: string]: string } = {
      happy: '#4caf50',
      sad: '#f44336',
      angry: '#ff5722',
      anxious: '#ff9800',
      calm: '#2196f3',
      surprised: '#9c27b0',
      neutral: '#9e9e9e',
    };
    return colors[moodType] || '#9e9e9e';
  };

  const getEmotionDisplayName = (emotion: string) => {
    const names: { [key: string]: string } = {
      happy: 'Happy 😊',
      sad: 'Sad 😢',
      angry: 'Angry 😠',
      anxious: 'Anxious 😨',
      calm: 'Calm 😌',
      surprised: 'Surprised 😲',
      neutral: 'Neutral 😐',
    };
    return names[emotion] || emotion;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" fontWeight="bold" color="white">
              🎤 Speech Emotion Detection
            </Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.8)">
              {progressMsg}
            </Typography>
          </Box>
          <IconButton onClick={handleClose} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Card sx={{ mb: 3, backgroundColor: 'rgba(255,255,255,0.95)' }}>
          <CardContent>
            {error && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Voice Recording Section */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <motion.div
                animate={{
                  scale: isListening ? [1, 1.1, 1] : 1,
                }}
                transition={{
                  duration: 1.5,
                  repeat: isListening ? Infinity : 0,
                }}
              >
                <Button
                  variant="contained"
                  size="large"
                  startIcon={isListening ? <MicOff /> : <Mic />}
                  onClick={isListening ? stopListening : startListening}
                  disabled={isAnalyzing || isTesting}
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    backgroundColor: isListening ? '#f44336' : '#4caf50',
                    '&:hover': {
                      backgroundColor: isListening ? '#d32f2f' : '#388e3c',
                    },
                    fontSize: '1rem',
                    fontWeight: 'bold',
                  }}
                />
              </motion.div>

              {/* Audio Level Visualization */}
              {isListening && (
                <Box sx={{ mt: 2, mb: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={audioLevel}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#4caf50',
                        transition: 'all 0.1s ease',
                      },
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Recording... {recordingTime}s
                  </Typography>
                </Box>
              )}

              <Typography variant="h6" sx={{ mt: 1 }}>
                {isListening ? '🎤 Listening... Speak now!' : 'Tap microphone to start speaking'}
              </Typography>
            </Box>

            {/* Test Voice Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <RecordVoiceOver /> Test Voice Samples
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Try these sample speeches to test emotion detection
              </Typography>
              
              <Grid container spacing={1}>
                {testSpeechSamples.map((sample) => (
                  <Grid item xs={12} sm={6} key={sample.emotion}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<PlayArrow />}
                      onClick={() => testWithSampleSpeech(sample)}
                      disabled={isAnalyzing || isTesting}
                      fullWidth
                      sx={{
                        justifyContent: 'flex-start',
                        textAlign: 'left',
                        height: 'auto',
                        py: 1,
                        px: 2,
                        borderColor: playingSample === sample.emotion ? getMoodColor(sample.emotion) : undefined,
                      }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {getEmotionDisplayName(sample.emotion)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {sample.description}
                        </Typography>
                      </Box>
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Transcript Display */}
            {transcript && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card sx={{ mb: 2, backgroundColor: 'primary.50' }}>
                  <CardContent sx={{ py: 2 }}>
                    <Typography variant="subtitle2" gutterBottom color="primary.main">
                      {isTesting ? '🧪 Test Speech:' : '🗣️ You said:'}
                    </Typography>
                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                      "{transcript}"
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Analysis Results */}
            {(isAnalyzing || isTesting) && (
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <CircularProgress size={30} />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {isTesting ? 'Testing with AI model...' : 'Analyzing with AI model...'}
                </Typography>
              </Box>
            )}

            {detectedMood && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card sx={{ 
                  mb: 2, 
                  border: `2px solid ${getMoodColor(detectedMood.emotion)}`,
                  backgroundColor: `${getMoodColor(detectedMood.emotion)}08`
                }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom color={getMoodColor(detectedMood.emotion)}>
                      {getEmotionDisplayName(detectedMood.emotion)}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Detected from speech analysis
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap', mb: 2 }}>
                      <Chip
                        label={`${Math.round(detectedMood.confidence * 100)}% Confident`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={`Model: ${detectedMood.model_used}`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>

                    {/* Emotion Predictions */}
                    {detectedMood.predictions && detectedMood.predictions.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Emotion breakdown:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center', mt: 1 }}>
                          {detectedMood.predictions.slice(0, 3).map((pred: any, index: number) => (
                            <Chip
                              key={index}
                              label={`${pred.emotion} ${pred.percentage || Math.round(pred.score * 100)}%`}
                              size="small"
                              variant="outlined"
                              sx={{ 
                                fontSize: '0.7rem',
                                borderColor: getMoodColor(pred.emotion),
                                color: getMoodColor(pred.emotion)
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>

                {/* Song Suggestions */}
                {detectedMood.songs && detectedMood.songs.length > 0 && (
                  <Card sx={{ mb: 2, backgroundColor: 'rgba(255,255,255,0.95)' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MusicNote /> Suggested Songs for {getEmotionDisplayName(detectedMood.emotion)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Based on your detected mood, here are some songs you might enjoy:
                      </Typography>
                      
                      <Grid container spacing={2}>
                        {detectedMood.songs.map((song: any) => (
                          <Grid item xs={12} key={song.id}>
                            <Card 
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                p: 1.5,
                                cursor: 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': { 
                                  transform: 'scale(1.02)',
                                  boxShadow: 3
                                }
                              }}
                              onClick={() => {
                                console.log('Playing song:', song);
                                // Optional: You can add direct play functionality here
                              }}
                            >
                              <Avatar 
                                src={song.cover} 
                                sx={{ width: 56, height: 56, mr: 2 }}
                                variant="rounded"
                              />
                              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                <Typography variant="subtitle2" fontWeight="bold" noWrap>
                                  {song.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" noWrap>
                                  {song.artist}
                                </Typography>
                              </Box>
                              <IconButton size="small" color="primary">
                                <PlayArrow />
                              </IconButton>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </DialogContent>

      <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
        <Button 
          onClick={handleClose} 
          variant="outlined" 
          startIcon={<Close />}
          sx={{ 
            color: 'white', 
            borderColor: 'white',
            '&:hover': {
              borderColor: 'white',
              backgroundColor: 'rgba(255,255,255,0.1)'
            }
          }}
        >
          Cancel
        </Button>
        
        <Button
          onClick={handleConfirm}
          variant="contained"
          startIcon={<CheckCircle />}
          disabled={!detectedMood || isAnalyzing || isTesting}
          sx={{
            backgroundColor: detectedMood ? getMoodColor(detectedMood.emotion) : 'rgba(255,255,255,0.3)',
            color: 'white',
            '&:hover': {
              backgroundColor: detectedMood ? getMoodColor(detectedMood.emotion) : 'rgba(255,255,255,0.3)',
              opacity: 0.9,
            },
          }}
        >
          Apply to Music Filter
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VoiceControl;