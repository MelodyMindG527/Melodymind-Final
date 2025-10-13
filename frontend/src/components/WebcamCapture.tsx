import React, { useState, useRef, useCallback } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, CircularProgress, Alert, Card, CardContent, Chip, Grid, Avatar, IconButton } from '@mui/material';
import { CameraAlt, Close, CheckCircle, PlayArrow, Psychology } from '@mui/icons-material';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';

const API_URL = 'http://127.0.0.1:8501';

interface WebcamCaptureProps {
  open: boolean;
  onClose: () => void;
  onMoodDetected: (mood: any) => void;
}

interface StreamlitResponse {
  emotion: string;
  confidence: number;
  predictions: Array<{ emotion: string; score: number; percentage: number }>;
  analysis_method: string;
  model_used: string;
  timestamp: string;
}

const emotionSongs: any = {
  happy: [{ id: 1, title: "Happy", artist: "Pharrell Williams", youtubeId: "ZbZSe6N_BXs", url: "https://www.youtube.com/watch?v=ZbZSe6N_BXs", cover: "https://i.ytimg.com/vi/ZbZSe6N_BXs/hqdefault.jpg" }],
  sad: [{ id: 2, title: "Someone Like You", artist: "Adele", youtubeId: "hLQl3WQQoQ0", url: "https://www.youtube.com/watch?v=hLQl3WQQoQ0", cover: "https://i.ytimg.com/vi/hLQl3WQQoQ0/hqdefault.jpg" }],
  angry: [{ id: 3, title: "Eye of the Tiger", artist: "Survivor", youtubeId: "btPJPFnesV4", url: "https://www.youtube.com/watch?v=btPJPFnesV4", cover: "https://i.ytimg.com/vi/btPJPFnesV4/hqdefault.jpg" }],
  surprise: [{ id: 4, title: "Thunderstruck", artist: "AC/DC", youtubeId: "v2AC41dglnM", url: "https://www.youtube.com/watch?v=v2AC41dglnM", cover: "https://i.ytimg.com/vi/v2AC41dglnM/hqdefault.jpg" }],
  fear: [{ id: 5, title: "Weightless", artist: "Marconi Union", youtubeId: "UfcAVejslrU", url: "https://www.youtube.com/watch?v=UfcAVejslrU", cover: "https://i.ytimg.com/vi/UfcAVejslrU/hqdefault.jpg" }],
  disgust: [{ id: 6, title: "Breathe Me", artist: "Sia", youtubeId: "2To6qk1API4", url: "https://www.youtube.com/watch?v=2To6qk1API4", cover: "https://i.ytimg.com/vi/2To6qk1API4/hqdefault.jpg" }],
  neutral: [
    { id: 7, title: "Clair de Lune", artist: "Claude Debussy", youtubeId: "CvFH_6DNRCY", url: "https://www.youtube.com/watch?v=CvFH_6DNRCY", cover: "https://i.ytimg.com/vi/CvFH_6DNRCY/hqdefault.jpg" },
    { id: 8, title: "Weightless", artist: "Marconi Union", youtubeId: "UfcAVejslrU", url: "https://www.youtube.com/watch?v=UfcAVejslrU", cover: "https://i.ytimg.com/vi/UfcAVejslrU/hqdefault.jpg" },
    { id: 9, title: "River Flows in You", artist: "Yiruma", youtubeId: "7maJOI3QMu0", url: "https://www.youtube.com/watch?v=7maJOI3QMu0", cover: "https://i.ytimg.com/vi/7maJOI3QMu0/hqdefault.jpg" },
    { id: 10, title: "Gymnopédie No. 1", artist: "Erik Satie", youtubeId: "S-Xm7s9eGxU", url: "https://www.youtube.com/watch?v=S-Xm7s9eGxU", cover: "https://i.ytimg.com/vi/S-Xm7s9eGxU/hqdefault.jpg" },
    { id: 11, title: "Canon in D", artist: "Johann Pachelbel", youtubeId: "NlprozG9BwY", url: "https://www.youtube.com/watch?v=NlprozG9BwY", cover: "https://i.ytimg.com/vi/NlprozG9BwY/hqdefault.jpg" },
    { id: 12, title: "Moonlight Sonata", artist: "Ludwig van Beethoven", youtubeId: "4Tr0otuiQuU", url: "https://www.youtube.com/watch?v=4Tr0otuiQuU", cover: "https://i.ytimg.com/vi/4Tr0otuiQuU/hqdefault.jpg" }
  ]
};

const WebcamCapture: React.FC<WebcamCaptureProps> = ({ open, onClose, onMoodDetected }) => {
  const webcamRef = useRef<Webcam>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('Waiting...');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [detectedMood, setDetectedMood] = useState<any>(null);
  const [error, setError] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [cameraAvailable, setCameraAvailable] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const capture = useCallback(() => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      analyzeWithBackend(imageSrc);
    } else {
      setError('Failed to capture image. Please check camera permissions.');
    }
  }, []);

  const handleCameraError = useCallback((error: any) => {
    console.error('Camera error:', error);
    setCameraError('Camera not available. Please check if a camera is connected and permissions are granted.');
    setCameraAvailable(false);
    setProgressMsg('Camera not available - using text input instead');
  }, []);

  const handleCameraLoad = useCallback(() => {
    setCameraError('');
    setCameraAvailable(true);
    setProgressMsg('Camera ready - click to capture');
    setIsInitialized(true);
  }, []);

  const analyzeWithBackend = async (imageSrc: string) => {
    setIsAnalyzing(true);
    setError('');
    setProgressMsg('Sending image to backend...');
    try {
      const base64Data = imageSrc.replace(/^data:image\/jpeg;base64,/, '');
      setProgressMsg('Processing image...');
      const response = await fetch(`${API_URL}/analyze-emotion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Data })
      });
      if (!response.ok) throw new Error(`Backend error ${response.status}`);
      const result: StreamlitResponse = await response.json();
      console.log('Backend result:', result);
      setProgressMsg('Analysis complete!');
      
      // Ensure neutral mood maps to calm songs
      const emotionKey = result.emotion === 'neutral' ? 'neutral' : result.emotion;
      const songs = emotionSongs[emotionKey] || emotionSongs['neutral'] || [];
      
      setDetectedMood({ 
        ...result, 
        emotion: emotionKey, // Ensure we use the mapped emotion
        songs 
      });
    } catch (err: any) {
      console.error(err);
      setError('Analysis failed. Fallback applied.');
      setProgressMsg('Using fallback analysis...');
      
      // Use neutral as default fallback to play calm songs
      const fallbackEmotion = 'neutral';
      setDetectedMood({ 
        emotion: fallbackEmotion, 
        confidence: 0.7, 
        predictions: [], 
        songs: emotionSongs[fallbackEmotion],
        analysis_method: 'fallback',
        model_used: 'mock',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setDetectedMood(null);
    setError('');
    setProgressMsg('Waiting...');
  };

  const handleConfirm = () => {
    if (detectedMood) onMoodDetected(detectedMood);
    handleRetake();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>🧠 AI Emotion Recognition</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error">{error}</Alert>}
        <Typography variant="body2" sx={{ mb: 1 }}>{progressMsg}</Typography>
        {!capturedImage && cameraAvailable && (
          <Webcam 
            ref={webcamRef} 
            audio={false} 
            screenshotFormat="image/jpeg"
            onUserMedia={handleCameraLoad}
            onUserMediaError={handleCameraError}
            videoConstraints={{
              width: 640,
              height: 480,
              facingMode: "user"
            }}
            style={{ display: isInitialized ? 'block' : 'none' }}
          />
        )}
        {cameraError && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {cameraError}
            <br />
            <Button 
              variant="outlined" 
              size="small" 
              sx={{ mt: 1 }}
              onClick={() => {
                // Fallback to text-based mood detection
                const mockMood = {
                  emotion: 'neutral',
                  confidence: 0.7,
                  predictions: [{ emotion: 'neutral', score: 0.7, percentage: 70 }],
                  analysis_method: 'text_fallback',
                  model_used: 'mock',
                  timestamp: new Date().toISOString(),
                  songs: emotionSongs.neutral
                };
                setDetectedMood(mockMood);
                setProgressMsg('Using text-based mood detection');
              }}
            >
              Use Text Input Instead
            </Button>
          </Alert>
        )}
        {capturedImage && <img src={capturedImage} style={{ width: '100%', maxHeight: 300 }} />}
        {isAnalyzing && <CircularProgress />}
        {detectedMood && !isAnalyzing && (
          <Card sx={{ mt: 2, p: 2 }}>
            <CardContent>
              <Typography variant="h5">{detectedMood.emotion}</Typography>
              <Typography variant="body2">Confidence: {Math.round(detectedMood.confidence*100)}%</Typography>
              {detectedMood.songs?.map((song: any) => <Typography key={song.id}>🎵 {song.title} - {song.artist}</Typography>)}
            </CardContent>
          </Card>
        )}
      </DialogContent>
      <DialogActions>
        {!capturedImage ? (
          <Button onClick={capture} variant="contained" startIcon={<CameraAlt />}>Analyze Emotion</Button>
        ) : (
          <>
            <Button onClick={handleRetake}>Retake</Button>
            <Button onClick={handleConfirm} variant="contained" startIcon={<CheckCircle />}>Confirm Mood</Button>
          </>
        )}
        <Button onClick={onClose} variant="outlined">Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default WebcamCapture;
