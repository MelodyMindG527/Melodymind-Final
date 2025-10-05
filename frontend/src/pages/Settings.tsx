import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Chip,
  Avatar,
  useTheme,
  Collapse,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  PrivacyTip,
  Mic,
  CameraAlt,
  Notifications,
  Palette,
  Security,
  DataUsage,
  Help,
  Info,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTheme as useAppTheme } from '../contexts/ThemeContext';

const Settings: React.FC = () => {
  const theme = useTheme();
  const { darkMode, toggleTheme } = useAppTheme();
  const [settings, setSettings] = useState({
    // Privacy Settings
    enableWebcam: true,
    enableVoiceRecording: true,
    shareMoodData: false,
    allowAnalytics: true,
    
    // AI Voice Settings
    aiVoiceType: 'friendly',
    voiceSpeed: 1.0,
    voiceVolume: 0.8,
    
    // App Preferences
    autoPlayMusic: true,
    showMoodSuggestions: true,
    enableNotifications: true,
    
    // Music Settings
    defaultVolume: 0.7,
    crossfadeDuration: 3,
    audioQuality: 'high',
  });

  // Expanded sections state
  const [expandedSections, setExpandedSections] = useState({
    privacyPolicy: false,
    help: false,
    about: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev],
    }));
  };

  const handleSettingChange = (setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value,
    }));
  };

  const settingSections = [
    {
      title: 'Privacy & Security',
      icon: <PrivacyTip />,
      color: '#f44336',
      settings: [
        {
          key: 'enableWebcam',
          label: 'Enable Camera Access',
          description: 'Allow facial expression analysis for mood detection',
          type: 'switch',
        },
        {
          key: 'enableVoiceRecording',
          label: 'Enable Voice Recording',
          description: 'Allow voice commands and tone analysis',
          type: 'switch',
        },
        {
          key: 'shareMoodData',
          label: 'Share Mood Data',
          description: 'Help improve AI by sharing anonymous mood patterns',
          type: 'switch',
        },
        {
          key: 'allowAnalytics',
          label: 'Analytics & Insights',
          description: 'Allow app to collect usage data for personal insights',
          type: 'switch',
        },
      ],
    },
    {
      title: 'AI Voice Assistant',
      icon: <Mic />,
      color: '#2196f3',
      settings: [
        {
          key: 'aiVoiceType',
          label: 'Voice Personality',
          description: 'Choose your preferred AI voice style',
          type: 'select',
          options: [
            { value: 'friendly', label: 'Friendly & Warm' },
            { value: 'professional', label: 'Professional' },
            { value: 'energetic', label: 'Energetic & Upbeat' },
            { value: 'calm', label: 'Calm & Soothing' },
          ],
        },
        {
          key: 'voiceSpeed',
          label: 'Voice Speed',
          description: 'Adjust how fast the AI speaks',
          type: 'slider',
          min: 0.5,
          max: 2.0,
          step: 0.1,
        },
        {
          key: 'voiceVolume',
          label: 'Voice Volume',
          description: 'Set the volume for AI voice responses',
          type: 'slider',
          min: 0,
          max: 1,
          step: 0.1,
        },
      ],
    },
    {
      title: 'App Preferences',
      icon: <SettingsIcon />,
      color: '#4caf50',
      settings: [
        {
          key: 'autoPlayMusic',
          label: 'Auto-play Music',
          description: 'Automatically start playing music after mood detection',
          type: 'switch',
        },
        {
          key: 'showMoodSuggestions',
          label: 'Mood Suggestions',
          description: 'Show mood upliftment suggestions for negative moods',
          type: 'switch',
        },
        {
          key: 'enableNotifications',
          label: 'Push Notifications',
          description: 'Receive reminders and mood check-ins',
          type: 'switch',
        },
        {
          key: 'darkMode',
          label: 'Dark Mode',
          description: 'Use dark theme for better eye comfort',
          type: 'switch',
          customComponent: true,
        },
      ],
    },
    {
      title: 'Music Settings',
      icon: <Mic />,
      color: '#ff9800',
      settings: [
        {
          key: 'defaultVolume',
          label: 'Default Volume',
          description: 'Set the default volume for music playback',
          type: 'slider',
          min: 0,
          max: 1,
          step: 0.1,
        },
        {
          key: 'crossfadeDuration',
          label: 'Crossfade Duration',
          description: 'Smooth transition between songs (seconds)',
          type: 'slider',
          min: 0,
          max: 10,
          step: 1,
        },
        {
          key: 'audioQuality',
          label: 'Audio Quality',
          description: 'Choose your preferred audio quality',
          type: 'select',
          options: [
            { value: 'low', label: 'Low (Save Data)' },
            { value: 'medium', label: 'Medium (Balanced)' },
            { value: 'high', label: 'High (Best Quality)' },
          ],
        },
      ],
    },
  ];

  const faqItems = [
    {
      question: "How does mood detection work?",
      answer: "MelodyMind uses advanced AI algorithms to analyze your facial expressions and voice tone to detect your current mood. This helps us recommend the perfect music for how you're feeling."
    },
    {
      question: "Is my data secure?",
      answer: "Yes! We take privacy seriously. All your data is encrypted and we never share personal information with third parties without your explicit consent."
    },
    {
      question: "Can I use the app offline?",
      answer: "Basic mood detection and previously downloaded music are available offline, but you'll need an internet connection for AI voice features and new music recommendations."
    },
    {
      question: "How do I reset my preferences?",
      answer: "You can reset all your preferences from the Settings menu, or contact our support team for assistance with specific settings."
    },
    {
      question: "What music services are supported?",
      answer: "MelodyMind currently integrates with Spotify, Apple Music, and YouTube Music. More services will be added in future updates."
    }
  ];

  const getSettingComponent = (setting: any) => {
    if (setting.customComponent) {
      return (
        <Switch
          checked={darkMode}
          onChange={toggleTheme}
          color="primary"
        />
      );
    }

    const value = settings[setting.key as keyof typeof settings];

    switch (setting.type) {
      case 'switch':
        return (
          <Switch
            checked={value as boolean}
            onChange={(e) => handleSettingChange(setting.key, e.target.checked)}
            color="primary"
          />
        );
      case 'select':
        return (
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select
              value={value}
              onChange={(e) => handleSettingChange(setting.key, e.target.value)}
            >
              {setting.options?.map((option: any) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case 'slider':
        return (
          <Box sx={{ width: 200 }}>
            <Slider
              value={value as number}
              onChange={(_, newValue) => handleSettingChange(setting.key, newValue)}
              min={setting.min}
              max={setting.max}
              step={setting.step}
              valueLabelDisplay="auto"
              size="small"
            />
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
        Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Customize your MelodyMind experience and manage your preferences
      </Typography>

      <Grid container spacing={3}>
        {settingSections.map((section, sectionIndex) => (
          <Grid item xs={12} key={section.title}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: sectionIndex * 0.1 }}
            >
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ backgroundColor: section.color, mr: 2 }}>
                      {section.icon}
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">
                      {section.title}
                    </Typography>
                  </Box>

                  <List>
                    {section.settings.map((setting, index) => (
                      <React.Fragment key={setting.key}>
                        <ListItem>
                          <ListItemIcon>
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: section.color,
                              }}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={setting.label}
                            secondary={setting.description}
                          />
                          <ListItemSecondaryAction>
                            {getSettingComponent(setting)}
                          </ListItemSecondaryAction>
                        </ListItem>
                        {index < section.settings.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}

        {/* Expandable Sections */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Information & Support
              </Typography>
              
              {/* Privacy Policy */}
              <Paper sx={{ mb: 2, overflow: 'hidden' }}>
                <Box
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    backgroundColor: theme.palette.background.default,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                  onClick={() => toggleSection('privacyPolicy')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Security color="primary" sx={{ mr: 2 }} />
                    <Typography variant="h6">Privacy Policy</Typography>
                  </Box>
                  {expandedSections.privacyPolicy ? <ExpandLess /> : <ExpandMore />}
                </Box>
                <Collapse in={expandedSections.privacyPolicy}>
                  <Box sx={{ p: 3 }}>
                    <Typography variant="body1" paragraph>
                      <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
                    </Typography>
                    
                    <Typography variant="h6" gutterBottom>Data Collection</Typography>
                    <Typography variant="body2" paragraph>
                      MelodyMind collects minimal data necessary to provide personalized music experiences:
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>•</ListItemIcon>
                        <ListItemText primary="Mood data (facial expressions, voice tone analysis)" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>•</ListItemIcon>
                        <ListItemText primary="Music preferences and listening history" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>•</ListItemIcon>
                        <ListItemText primary="App usage statistics for improvement" />
                      </ListItem>
                    </List>

                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Data Usage</Typography>
                    <Typography variant="body2" paragraph>
                      Your data is used exclusively to:
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>•</ListItemIcon>
                        <ListItemText primary="Provide personalized music recommendations" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>•</ListItemIcon>
                        <ListItemText primary="Improve AI mood detection accuracy" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>•</ListItemIcon>
                        <ListItemText primary="Enhance your overall app experience" />
                      </ListItem>
                    </List>

                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Your Rights</Typography>
                    <Typography variant="body2">
                      You have the right to access, modify, or delete your personal data at any time through the app settings or by contacting our support team.
                    </Typography>
                  </Box>
                </Collapse>
              </Paper>

              {/* Help & FAQs */}
              <Paper sx={{ mb: 2, overflow: 'hidden' }}>
                <Box
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    backgroundColor: theme.palette.background.default,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                  onClick={() => toggleSection('help')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Help color="primary" sx={{ mr: 2 }} />
                    <Typography variant="h6">Help & FAQs</Typography>
                  </Box>
                  {expandedSections.help ? <ExpandLess /> : <ExpandMore />}
                </Box>
                <Collapse in={expandedSections.help}>
                  <Box sx={{ p: 3 }}>
                    {faqItems.map((faq, index) => (
                      <Accordion key={index} sx={{ mb: 1 }}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {faq.question}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography variant="body2" color="text.secondary">
                            {faq.answer}
                          </Typography>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                    
                    <Box sx={{ mt: 3, p: 2, backgroundColor: theme.palette.action.hover, borderRadius: 1 }}>
                      <Typography variant="body2" paragraph>
                        <strong>Need more help?</strong> Contact our support team at support@melodymind.app
                      </Typography>
                      <Button variant="contained" size="small">
                        Contact Support
                      </Button>
                    </Box>
                  </Box>
                </Collapse>
              </Paper>

              {/* About App */}
              <Paper sx={{ overflow: 'hidden' }}>
                <Box
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    backgroundColor: theme.palette.background.default,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                  onClick={() => toggleSection('about')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Info color="primary" sx={{ mr: 2 }} />
                    <Typography variant="h6">About MelodyMind</Typography>
                  </Box>
                  {expandedSections.about ? <ExpandLess /> : <ExpandMore />}
                </Box>
                <Collapse in={expandedSections.about}>
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h5" gutterBottom color="primary">
                      MelodyMind
                    </Typography>
                    <Typography variant="body1" paragraph>
                      Your intelligent music companion that understands how you feel and plays the perfect music for your mood.
                    </Typography>
                    
                    <Typography variant="h6" gutterBottom>Features</Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>🎵</ListItemIcon>
                        <ListItemText primary="AI-powered mood detection using facial expressions and voice analysis" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>🤖</ListItemIcon>
                        <ListItemText primary="Smart voice assistant for hands-free control" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>📱</ListItemIcon>
                        <ListItemText primary="Personalized music recommendations based on your emotional state" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>🔒</ListItemIcon>
                        <ListItemText primary="Privacy-first approach with local processing where possible" />
                      </ListItem>
                    </List>

                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Version</Typography>
                    <Typography variant="body2" paragraph>
                      MelodyMind v1.0.0
                    </Typography>

                    <Typography variant="h6" gutterBottom>Team</Typography>
                    <Typography variant="body2">
                      Built with ❤️ by the MelodyMind team to make your days better through music.
                    </Typography>
                  </Box>
                </Collapse>
              </Paper>
            </CardContent>
          </Card>
        </Grid>

        {/* Current Settings Summary */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Settings Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="primary" fontWeight="bold">
                      {Object.values(settings).filter(v => v === true).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Features Enabled
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="success.main" fontWeight="bold">
                      {settings.aiVoiceType}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      AI Voice Style
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="warning.main" fontWeight="bold">
                      {Math.round(settings.defaultVolume * 100)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Default Volume
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Chip
                      label={darkMode ? 'Dark Mode' : 'Light Mode'}
                      color={darkMode ? 'primary' : 'default'}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Theme
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;