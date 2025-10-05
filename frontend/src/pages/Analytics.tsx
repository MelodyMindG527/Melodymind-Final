import React, { useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  useTheme,
  Button,
  Stack,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import {
  SentimentSatisfied,
  SentimentDissatisfied,
  SentimentVerySatisfied,
  SentimentVeryDissatisfied,
  SentimentNeutral,
  TrendingUp,
  MusicNote,
  Download,
  CalendarToday,
  EmojiEmotions,
  Psychology,
} from '@mui/icons-material';
import { useMusicStore, Song } from '../store/musicStore';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Analytics: React.FC = () => {
  const theme = useTheme();
  const { moodHistory, playlists } = useMusicStore();
  const analyticsRef = useRef<HTMLDivElement>(null);

  // Export to PDF function
  const exportToPDF = async () => {
    if (!analyticsRef.current) return;

    try {
      const canvas = await html2canvas(analyticsRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('portrait', 'mm', 'a4');
      const imgWidth = 190; // A4 width in mm with margins
      const pageHeight = 280; // A4 height in mm with margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 10;

      pdf.setFontSize(16);
      pdf.text('Mood Analytics Report', 105, 15, { align: 'center' });
      pdf.setFontSize(10);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 22, { align: 'center' });

      pdf.addImage(imgData, 'PNG', 10, 25, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 25;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`mood-analytics-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  // Calculate mood statistics
  const getMoodStats = () => {
    const moodCounts: { [key: string]: number } = {};
    const moodIntensities: { [key: string]: number[] } = {};
    const moodByHour: { [key: string]: number[] } = {};
    
    moodHistory.forEach(mood => {
      moodCounts[mood.type] = (moodCounts[mood.type] || 0) + 1;
      if (!moodIntensities[mood.type]) {
        moodIntensities[mood.type] = [];
      }
      moodIntensities[mood.type].push(mood.intensity);

      // Track mood by hour
      const hour = new Date(mood.timestamp).getHours();
      if (!moodByHour[mood.type]) {
        moodByHour[mood.type] = new Array(24).fill(0);
      }
      moodByHour[mood.type][hour]++;
    });

    const averageIntensities: { [key: string]: number } = {};
    Object.keys(moodIntensities).forEach(mood => {
      const avg = moodIntensities[mood].reduce((a, b) => a + b, 0) / moodIntensities[mood].length;
      averageIntensities[mood] = Math.round(avg * 10) / 10;
    });

    return { moodCounts, averageIntensities, moodByHour };
  };

  const { moodCounts, averageIntensities, moodByHour } = getMoodStats();

  // Additional Statistics
  const totalEntries = moodHistory.length;
  const uniqueMoods = Object.keys(moodCounts).length;
  const averageIntensity = totalEntries > 0 
    ? Math.round(moodHistory.reduce((sum, mood) => sum + mood.intensity, 0) / totalEntries * 10) / 10
    : 0;

  // Most frequent mood
  const mostFrequentMood = Object.keys(moodCounts).reduce((a, b) => 
    moodCounts[a] > moodCounts[b] ? a : b, ''
  );

  // Mood consistency (percentage of days with at least one entry)
  const getMoodConsistency = () => {
    const uniqueDays = new Set(moodHistory.map(mood => 
      new Date(mood.timestamp).toDateString()
    )).size;
    const totalDays = Math.ceil((new Date().getTime() - new Date(moodHistory[0]?.timestamp || new Date()).getTime()) / (1000 * 60 * 60 * 24)) || 1;
    return Math.round((uniqueDays / Math.min(totalDays, 30)) * 100);
  };

  // Prepare data for charts
  const moodFrequencyData = Object.keys(moodCounts).map(mood => ({
    mood: mood.charAt(0).toUpperCase() + mood.slice(1),
    count: moodCounts[mood],
    color: getMoodColor(mood),
  }));

  const moodIntensityData = Object.keys(averageIntensities).map(mood => ({
    mood: mood.charAt(0).toUpperCase() + mood.slice(1),
    intensity: averageIntensities[mood],
    color: getMoodColor(mood),
  }));

  // Weekly mood trend (last 7 days)
  const getWeeklyTrend = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayMoods = moodHistory.filter(mood => 
        new Date(mood.timestamp).toDateString() === date.toDateString()
      );
      
      const avgIntensity = dayMoods.length > 0 
        ? dayMoods.reduce((sum, mood) => sum + mood.intensity, 0) / dayMoods.length
        : 0;

      last7Days.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        intensity: Math.round(avgIntensity * 10) / 10,
        count: dayMoods.length,
      });
    }
    return last7Days;
  };

  const weeklyTrendData = getWeeklyTrend();

  // Hourly mood distribution
  const getHourlyMoodData = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return hours.map(hour => {
      const data: any = { hour: `${hour}:00` };
      Object.keys(moodByHour).forEach(mood => {
        data[mood] = moodByHour[mood][hour] || 0;
      });
      return data;
    });
  };

  const hourlyMoodData = getHourlyMoodData();

  // Music genre preferences by mood
  const getGenrePreferences = () => {
    const genreByMood: { [key: string]: { [key: string]: number } } = {};
    
    playlists.forEach(playlist => {
      playlist.songs.forEach((song: Song) => {
        if (playlist.mood && song.genre) {
          genreByMood[playlist.mood] = genreByMood[playlist.mood] || {};
          genreByMood[playlist.mood][song.genre] =
            (genreByMood[playlist.mood][song.genre] || 0) + 1;
        }
      });
    });

    return genreByMood;
  };

  const genrePreferences = getGenrePreferences();

  function getMoodColor(moodType: string) {
    switch (moodType) {
      case 'happy':
      case 'excited':
        return '#4caf50';
      case 'sad':
      case 'melancholic':
        return '#f44336';
      case 'energetic':
        return '#ff9800';
      case 'calm':
      case 'focused':
        return '#2196f3';
      case 'anxious':
        return '#ff5722';
      default:
        return '#9e9e9e';
    }
  }

  const getMoodIcon = (moodType: string) => {
    switch (moodType) {
      case 'happy':
      case 'excited':
        return <SentimentVerySatisfied />;
      case 'sad':
      case 'melancholic':
        return <SentimentVeryDissatisfied />;
      case 'energetic':
        return <SentimentSatisfied />;
      case 'anxious':
        return <SentimentDissatisfied />;
      default:
        return <SentimentNeutral />;
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <Box>
      {/* Header with Export Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Mood Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your emotional patterns and discover insights about your mood-music relationship
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={exportToPDF}
          sx={{ minWidth: 140 }}
        >
          Export PDF
        </Button>
      </Box>

      <div ref={analyticsRef}>
        {/* Enhanced Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ backgroundColor: 'primary.main' }}>
                    <TrendingUp />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {totalEntries}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Entries
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ backgroundColor: 'success.main' }}>
                    <EmojiEmotions />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {uniqueMoods}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Mood Types
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ backgroundColor: 'info.main' }}>
                    <MusicNote />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {playlists.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Playlists Created
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ backgroundColor: 'warning.main' }}>
                    <Psychology />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {averageIntensity}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Intensity
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Additional Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ backgroundColor: 'secondary.main' }}>
                    <CalendarToday />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight="bold">
                      {getMoodConsistency()}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tracking Consistency
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ backgroundColor: getMoodColor(mostFrequentMood) }}>
                    {getMoodIcon(mostFrequentMood)}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" sx={{ textTransform: 'capitalize' }}>
                      {mostFrequentMood}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Most Frequent Mood
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ backgroundColor: 'error.main' }}>
                    <SentimentSatisfied />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight="bold">
                      {moodCounts[mostFrequentMood] || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Times Recorded
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts Grid */}
        <Grid container spacing={3}>
          {/* Mood Frequency Chart */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Mood Frequency
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={moodFrequencyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mood" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Mood Intensity Chart */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Average Mood Intensity
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={moodIntensityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mood" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Bar dataKey="intensity" fill="#ec4899" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Weekly Trend */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Weekly Mood Trend
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={weeklyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip 
                      formatter={(value: any) => [value, 'Intensity']}
                      labelFormatter={(label, payload) => {
                        if (payload && payload[0]) {
                          return `Date: ${payload[0].payload.date}`;
                        }
                        return `Day: ${label}`;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="intensity" 
                      stroke="#6366f1" 
                      fill="#6366f1" 
                      fillOpacity={0.3} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Mood Distribution Pie Chart */}
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Mood Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={moodFrequencyData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ mood, percent }) => `${mood} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {moodFrequencyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Hourly Mood Distribution */}
          {hourlyMoodData.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Mood Distribution by Hour
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={hourlyMoodData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {Object.keys(moodByHour).map((mood, index) => (
                        <Bar 
                          key={mood} 
                          dataKey={mood} 
                          stackId="a" 
                          fill={getMoodColor(mood)}
                          name={mood.charAt(0).toUpperCase() + mood.slice(1)}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Most Common Moods */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Most Common Moods
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {moodFrequencyData
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5)
                    .map((mood, index) => (
                      <Box key={mood.mood} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ backgroundColor: mood.color }}>
                          {getMoodIcon(mood.mood.toLowerCase())}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body1" fontWeight="bold">
                            {mood.mood}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {mood.count} entries
                          </Typography>
                        </Box>
                        <Chip 
                          label={`${Math.round((mood.count / totalEntries) * 100)}%`}
                          size="small"
                          sx={{ backgroundColor: mood.color, color: 'white' }}
                        />
                      </Box>
                    ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Music Genre Preferences */}
          {Object.keys(genrePreferences).length > 0 && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Music Genre Preferences by Mood
                  </Typography>
                  <Grid container spacing={2}>
                    {Object.keys(genrePreferences).map(mood => (
                      <Grid item xs={12} sm={6} key={mood}>
                        <Card variant="outlined">
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Avatar sx={{ 
                                backgroundColor: getMoodColor(mood), 
                                width: 24, 
                                height: 24 
                              }}>
                                {getMoodIcon(mood)}
                              </Avatar>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {mood.charAt(0).toUpperCase() + mood.slice(1)}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {Object.entries(genrePreferences[mood])
                                .sort(([,a], [,b]) => b - a)
                                .slice(0, 3)
                                .map(([genre, count]) => (
                                  <Chip
                                    key={genre}
                                    label={`${genre} (${count})`}
                                    size="small"
                                    variant="outlined"
                                  />
                                ))}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </div>
    </Box>
  );
};

export default Analytics;