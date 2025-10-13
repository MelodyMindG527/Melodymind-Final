import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Snackbar,
} from '@mui/material';
import {
  Psychology,
  MusicNote,
  TrendingUp,
  SentimentSatisfied,
  SentimentDissatisfied,
  SentimentNeutral,
  Send,
  Clear,
  Favorite,
  PlayArrow,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useMusicStore } from '../store/musicStore';

interface SentimentResult {
  overallMood: string;
  confidence: number;
  intensity: number;
  emotions: Array<{
    emotion: string;
    score: number;
    color: string;
  }>;
  lyrics: string;
  recommendations: Array<{
    title: string;
    artist: string;
    mood: string;
    reason: string;
    youtubeId?: string;
    url?: string;
    cover?: string;
    album?: string;
    duration?: number;
    genre?: string;
  }>;
}

interface SentimentAnalysisProps {
  onAnalyzeComplete?: (result: SentimentResult) => void;
}

const SentimentAnalysis: React.FC<SentimentAnalysisProps> = ({ onAnalyzeComplete }) => {
  const [lyrics, setLyrics] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const { setCurrentSong, createPlaylist, setCurrentMood } = useMusicStore();
  
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

  const analyzeSentiment = async () => {
    if (!lyrics.trim()) {
      setError('Please enter some lyrics to analyze');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      const response = await fetch(`${API_BASE_URL}/sentiment/analyze`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ lyrics: lyrics.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to analyze sentiment');
      }

      const data = await response.json();
      setResult(data);
      onAnalyzeComplete?.(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAnalysis = () => {
    setLyrics('');
    setResult(null);
    setError(null);
  };

  const handlePlaySong = (song: any) => {
    const songData = {
      id: song.youtubeId || Math.random().toString(),
      title: song.title,
      artist: song.artist,
      album: song.album || song.title,
      duration: song.duration || 180,
      url: song.url || (song.youtubeId ? `https://www.youtube.com/watch?v=${song.youtubeId}` : ''),
      youtubeId: song.youtubeId,
      cover: song.cover || (song.youtubeId ? `https://i.ytimg.com/vi/${song.youtubeId}/hqdefault.jpg` : ''),
      genre: song.genre || 'pop',
      mood: song.mood
    };
    
    setCurrentSong(songData);
    setSnackbar({ open: true, message: `Now playing: ${song.title} by ${song.artist}` });
  };

  const handleSaveToPlaylist = (song: any) => {
    const songData = {
      id: song.youtubeId || Math.random().toString(),
      title: song.title,
      artist: song.artist,
      album: song.album || song.title,
      duration: song.duration || 180,
      url: song.url || (song.youtubeId ? `https://www.youtube.com/watch?v=${song.youtubeId}` : ''),
      youtubeId: song.youtubeId,
      cover: song.cover || (song.youtubeId ? `https://i.ytimg.com/vi/${song.youtubeId}/hqdefault.jpg` : ''),
      genre: song.genre || 'pop',
      mood: song.mood
    };
    
    createPlaylist({
      name: `Sentiment Analysis - ${result?.overallMood} Mood`,
      description: `Playlist based on sentiment analysis results`,
      songs: [songData],
      mood: result?.overallMood || 'neutral'
    });
    
    setSnackbar({ open: true, message: `Added "${song.title}" to playlist` });
  };

  const handleCreateMoodPlaylist = () => {
    if (!result || !result.recommendations.length) return;

    const songs = result.recommendations.map(song => ({
      id: song.youtubeId || Math.random().toString(),
      title: song.title,
      artist: song.artist,
      album: song.album || song.title,
      duration: song.duration || 180,
      url: song.url || (song.youtubeId ? `https://www.youtube.com/watch?v=${song.youtubeId}` : ''),
      youtubeId: song.youtubeId,
      cover: song.cover || (song.youtubeId ? `https://i.ytimg.com/vi/${song.youtubeId}/hqdefault.jpg` : ''),
      genre: song.genre || 'pop',
      mood: song.mood
    }));

    createPlaylist({
      name: `Sentiment Analysis - ${result.overallMood} Mood Playlist`,
      description: `Curated playlist based on "${result.overallMood}" sentiment analysis`,
      songs: songs,
      mood: result.overallMood
    });

    setSnackbar({ open: true, message: `Created "${result.overallMood}" mood playlist with ${songs.length} songs` });
  };

  const handleSetCurrentMood = () => {
    if (!result) return;
    
    // Map sentiment analysis mood to valid mood types
    const moodTypeMap: Record<string, 'happy' | 'sad' | 'energetic' | 'calm' | 'anxious' | 'excited' | 'melancholic' | 'focused'> = {
      'happy': 'happy',
      'sad': 'sad',
      'angry': 'anxious', // Map angry to anxious as closest match
      'energetic': 'energetic',
      'calm': 'calm',
      'anxious': 'anxious'
    };
    
    const validMoodType = moodTypeMap[result.overallMood] || 'calm';
    
    setCurrentMood({
      id: Math.random().toString(),
      type: validMoodType,
      confidence: result.confidence,
      intensity: result.intensity,
      timestamp: new Date(),
      source: 'text', // Use 'text' as closest match to sentiment analysis
      notes: `Detected from sentiment analysis of lyrics`
    });
    
    setSnackbar({ open: true, message: `Set current mood to: ${validMoodType}` });
  };

  const getMoodIcon = (mood: string) => {
    switch (mood.toLowerCase()) {
      case 'happy':
        return <SentimentSatisfied sx={{ color: '#4caf50' }} />;
      case 'sad':
        return <SentimentDissatisfied sx={{ color: '#f44336' }} />;
      case 'angry':
        return <SentimentDissatisfied sx={{ color: '#ff5722' }} />;
      case 'energetic':
        return <TrendingUp sx={{ color: '#ff9800' }} />;
      case 'calm':
        return <SentimentNeutral sx={{ color: '#2196f3' }} />;
      default:
        return <SentimentNeutral sx={{ color: '#9e9e9e' }} />;
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood.toLowerCase()) {
      case 'happy':
        return '#4caf50';
      case 'sad':
        return '#f44336';
      case 'angry':
        return '#ff5722';
      case 'energetic':
        return '#ff9800';
      case 'calm':
        return '#2196f3';
      case 'anxious':
        return '#e91e63';
      default:
        return '#9e9e9e';
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Psychology sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
              <Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  Sentiment Analysis
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Analyze the emotional tone of song lyrics to discover mood-based recommendations
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  multiline
                  rows={8}
                  variant="outlined"
                  label="Enter Song Lyrics"
                  placeholder="Paste the lyrics you want to analyze here..."
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  sx={{ mb: 2 }}
                />
                
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    startIcon={<Send />}
                    onClick={analyzeSentiment}
                    disabled={isAnalyzing || !lyrics.trim()}
                    size="large"
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Sentiment'}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<Clear />}
                    onClick={clearAnalysis}
                    disabled={isAnalyzing}
                  >
                    Clear
                  </Button>
                </Box>

                {isAnalyzing && (
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Processing lyrics and detecting emotional patterns...
                    </Typography>
                  </Box>
                )}

                {error && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                  </Alert>
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: '100%', minHeight: 300 }}>
                  <Typography variant="h6" gutterBottom>
                    How it works
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <MusicNote color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Paste Lyrics"
                        secondary="Enter the complete lyrics of any song"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Psychology color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="AI Analysis"
                        secondary="Advanced NLP analyzes emotional patterns"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TrendingUp color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Get Recommendations"
                        secondary="Receive mood-matched song suggestions"
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: getMoodColor(result.overallMood), mr: 2 }}>
                    {getMoodIcon(result.overallMood)}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight="bold">
                      Analysis Results
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Overall mood detected with {Math.round(result.confidence * 100)}% confidence
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant="h6" gutterBottom>
                        Primary Mood
                      </Typography>
                      <Chip
                        label={result.overallMood}
                        sx={{
                          bgcolor: getMoodColor(result.overallMood),
                          color: 'white',
                          fontSize: '1.1rem',
                          p: 2,
                          mb: 2,
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Intensity: {result.intensity}/10
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={8}>
                    <Typography variant="h6" gutterBottom>
                      Emotional Breakdown
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {result.emotions.map((emotion, index) => (
                        <Chip
                          key={index}
                          label={`${emotion.emotion} (${Math.round(emotion.score * 100)}%)`}
                          sx={{
                            bgcolor: emotion.color,
                            color: 'white',
                            mb: 1,
                          }}
                        />
                      ))}
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Recommended Songs
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={handleSetCurrentMood}
                      startIcon={<Psychology />}
                    >
                      Set as Current Mood
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleCreateMoodPlaylist}
                      startIcon={<MusicNote />}
                    >
                      Create Playlist
                    </Button>
                  </Box>
                </Box>
                <Grid container spacing={2}>
                  {result.recommendations.map((rec, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                            <Box
                              sx={{
                                width: 60,
                                height: 60,
                                borderRadius: 1,
                                backgroundImage: rec.cover ? `url(${rec.cover})` : `linear-gradient(45deg, ${getMoodColor(rec.mood)}, ${getMoodColor(rec.mood)}dd)`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                mr: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}
                            >
                              {!rec.cover && <MusicNote sx={{ color: 'white' }} />}
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="subtitle1" fontWeight="bold" noWrap>
                                {rec.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" noWrap>
                                {rec.artist}
                              </Typography>
                              {rec.album && (
                                <Typography variant="caption" color="text.secondary" noWrap>
                                  {rec.album}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                          
                          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                            <Chip
                              label={rec.mood}
                              size="small"
                              sx={{
                                bgcolor: getMoodColor(rec.mood),
                                color: 'white',
                              }}
                            />
                            {rec.genre && (
                              <Chip
                                label={rec.genre}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
                            {rec.reason}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              startIcon={<PlayArrow />}
                              variant="contained"
                              fullWidth
                              onClick={() => handlePlaySong(rec)}
                              sx={{ 
                                background: `linear-gradient(45deg, ${getMoodColor(rec.mood)}, ${getMoodColor(rec.mood)}dd)`,
                                '&:hover': {
                                  background: `linear-gradient(45deg, ${getMoodColor(rec.mood)}dd, ${getMoodColor(rec.mood)})`,
                                }
                              }}
                            >
                              Play
                            </Button>
                            <Button
                              size="small"
                              startIcon={<Favorite />}
                              variant="outlined"
                              fullWidth
                              onClick={() => handleSaveToPlaylist(rec)}
                            >
                              Save
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={snackbar.message}
      />
    </Box>
  );
};

export default SentimentAnalysis;
