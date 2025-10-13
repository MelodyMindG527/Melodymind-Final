import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  useTheme,
  useMediaQuery,
  BottomNavigation,
  BottomNavigationAction,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Chip,
  Badge,
  Popover,
  ListItemButton,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Book as JournalIcon,
  Analytics as AnalyticsIcon,
  SportsEsports as GamesIcon,
  Settings as SettingsIcon,
  Psychology as SentimentIcon,
  Menu as MenuIcon,
  AccountCircle,
  Logout,
  Notifications,
  Search,
  QueueMusic,
  Clear,
  LightMode,
  DarkMode,
  MusicNote,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import MusicPlayer from './MusicPlayer';
import { useTheme as useAppTheme } from '../contexts/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'reminder' | 'recommendation' | 'system';
  songRecommendation?: {
    title: string;
    artist: string;
    mood: string;
  };
}

const navItems = [
  { 
    path: '/dashboard', 
    label: 'Dashboard', 
    icon: <DashboardIcon />,
    description: 'Overview & insights'
  },
  { 
    path: '/journal', 
    label: 'Journal', 
    icon: <JournalIcon />,
    description: 'Mood tracking & notes'
  },
  { 
    path: '/analytics', 
    label: 'Analytics', 
    icon: <AnalyticsIcon />,
    description: 'Data & trends'
  },
  { 
    path: '/sentiment', 
    label: 'Sentiment Analysis', 
    icon: <SentimentIcon />,
    description: 'Analyze lyrics emotions'
  },
  { 
    path: '/games', 
    label: 'Games', 
    icon: <GamesIcon />,
    description: 'Mindful activities'
  },
  { 
    path: '/settings', 
    label: 'Settings', 
    icon: <SettingsIcon />,
    description: 'Preferences & account'
  },
];

// Mock song recommendations for notifications
const songRecommendations = [
  { title: "Yemito", artist: "Hari Charan", mood: "happy" },
  { title: "Can't Stop the Feeling", artist: "Justin Timberlake", mood: "happy" },
  { title: "Someone Like You", artist: "Adele", mood: "sad" },
  { title: "Eye of the Tiger", artist: "Survivor", mood: "energetic" },
  { title: "Weightless", artist: "Marconi Union", mood: "calm" },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const { darkMode, toggleTheme } = useAppTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState<null | HTMLElement>(null);
  const [searchAnchorEl, setSearchAnchorEl] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);

  // Initialize notifications
  useEffect(() => {
    const initialNotifications: Notification[] = [
      {
        id: '1',
        title: 'Time for Music! 🎵',
        message: 'Take a break and listen to some music to refresh your mood.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: false,
        type: 'reminder',
      },
      {
        id: '2',
        title: 'Song Recommendation',
        message: 'Based on your recent activity, you might enjoy this song:',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        read: false,
        type: 'recommendation',
        songRecommendation: songRecommendations[0],
      },
    ];
    setNotifications(initialNotifications);
  }, []);

  // Schedule notifications every 3 hours
  useEffect(() => {
    const notificationInterval = setInterval(() => {
      const randomSong = songRecommendations[Math.floor(Math.random() * songRecommendations.length)];
      
      const newNotification: Notification = {
        id: Date.now().toString(),
        title: 'Music Break Time! 🎶',
        message: 'Take a moment to relax with some music. How about trying:',
        timestamp: new Date(),
        read: false,
        type: 'recommendation',
        songRecommendation: randomSong,
      };

      setNotifications(prev => [newNotification, ...prev]);
    }, 3 * 60 * 60 * 1000); // 3 hours

    return () => clearInterval(notificationInterval);
  }, []);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };

  const handleSearchOpen = (event: React.MouseEvent<HTMLElement>) => {
    if (isMobile) {
      setSearchDialogOpen(true);
    } else {
      setSearchAnchorEl(event.currentTarget);
    }
  };

  const handleSearchClose = () => {
    setSearchAnchorEl(null);
    setSearchDialogOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  const handleNotificationRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const handleClearAllNotifications = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
  };

  const handleRemoveNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Store search query in session storage to be used by other components
    sessionStorage.setItem('globalSearchQuery', query);
    
    // Navigate to dashboard if not already there
    if (location.pathname !== '/dashboard') {
      navigate('/dashboard');
    }
    
    handleSearchClose();
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const drawer = (
    <Box sx={{ 
      width: { xs: 320, sm: 360, md: 380 },
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: darkMode 
        ? 'linear-gradient(180deg, #1e1e1e 0%, #2d2d2d 100%)'
        : 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
      color: darkMode ? 'white' : 'inherit',
    }}>
      {/* User Profile Section */}
      <Box sx={{ 
        p: { xs: 3, sm: 4 }, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 3,
        borderBottom: '2px solid',
        borderColor: 'divider',
        background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3,
        },
      }}>
        <Avatar 
          src={user?.avatar} 
          alt={user?.name}
          sx={{ 
            width: { xs: 64, sm: 72 }, 
            height: { xs: 64, sm: 72 },
            fontSize: { xs: '1.75rem', sm: '2rem' },
            fontWeight: 700,
            border: '3px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {user?.name?.charAt(0)}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 1 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 800,
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              lineHeight: 1.2,
              mb: 1,
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
            noWrap
          >
            {user?.name}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              fontSize: { xs: '0.875rem', sm: '1rem' },
              lineHeight: 1.4,
              opacity: 0.9,
              fontWeight: 500,
            }}
            noWrap
          >
            {user?.email}
          </Typography>
          <Chip 
            label="User" 
            size="small" 
            sx={{ 
              mt: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.75rem',
              height: 24,
            }}
          />
        </Box>
      </Box>

      {/* Theme Toggle in Drawer */}
      {/* <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <FormControlLabel
          control={
            <Switch
              checked={darkMode}
              onChange={toggleTheme}
              icon={<LightMode sx={{ color: 'orange' }} />}
              checkedIcon={<DarkMode sx={{ color: 'yellow' }} />}
              sx={{
                '& .MuiSwitch-track': {
                  backgroundColor: darkMode ? 'grey.800' : 'grey.300',
                },
              }}
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {darkMode ? <DarkMode /> : <LightMode />}
              <Typography variant="body2" fontWeight={600}>
                {darkMode ? 'Dark Mode' : 'Light Mode'}
              </Typography>
            </Box>
          }
        />
      </Box> */}

      {/* Navigation List */}
      <List sx={{ 
        flex: 1, 
        px: { xs: 2, sm: 3 },
        py: 2,
        '& .MuiListItem-root': {
          mb: 1,
        },
      }}>
        {navItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem
              key={item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setDrawerOpen(false);
              }}
              sx={{
                cursor: 'pointer',
                borderRadius: 3,
                mx: { xs: 0.5, sm: 1 },
                py: { xs: 1.5, sm: 2 },
                px: { xs: 2, sm: 3 },
                backgroundColor: isSelected 
                  ? 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)' 
                  : 'transparent',
                border: isSelected ? 'none' : '2px solid transparent',
                borderColor: 'divider',
                position: 'relative',
                overflow: 'hidden',
                '&::before': isSelected ? {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
                  opacity: 0.1,
                  zIndex: 0,
                } : {},
                '&:hover': {
                  backgroundColor: isSelected 
                    ? 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)' 
                    : 'action.hover',
                  transform: 'translateX(8px) scale(1.02)',
                  boxShadow: isSelected 
                    ? '0 8px 25px rgba(99, 102, 241, 0.3)' 
                    : '0 4px 12px rgba(0, 0, 0, 0.1)',
                },
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <ListItemIcon 
                sx={{ 
                  color: isSelected ? 'white' : (darkMode ? 'white' : 'text.secondary'),
                  minWidth: { xs: 48, sm: 56 },
                  position: 'relative',
                  zIndex: 1,
                  '& .MuiSvgIcon-root': {
                    fontSize: { xs: '1.5rem', sm: '1.75rem' },
                    filter: isSelected ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))' : 'none',
                  },
                }}
              >
                {item.icon}
              </ListItemIcon>
              <Box sx={{ flex: 1, position: 'relative', zIndex: 1 }}>
                <ListItemText 
                  primary={item.label}
                  secondary={item.description}
                  primaryTypographyProps={{
                    fontWeight: isSelected ? 800 : 600,
                    fontSize: { xs: '1rem', sm: '1.125rem' },
                    lineHeight: 1.3,
                    color: isSelected ? 'white' : (darkMode ? 'white' : 'text.primary'),
                  }}
                  secondaryTypographyProps={{
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    color: isSelected ? 'rgba(255, 255, 255, 0.8)' : (darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'),
                    fontWeight: 500,
                  }}
                />
              </Box>
            </ListItem>
          );
        })}
      </List>

      {/* Footer Section */}
      <Box sx={{ 
        p: { xs: 2, sm: 3 },
        borderTop: '1px solid',
        borderColor: 'divider',
        background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
      }}>
        <Typography 
          variant="caption" 
          sx={{ 
            color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
            fontSize: '0.75rem',
            fontWeight: 500,
            textAlign: 'center',
            display: 'block',
          }}
        >
          MelodyMind v1.0.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar 
        position="static" 
        elevation={0} 
        sx={{ 
          background: darkMode 
            ? 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          color: darkMode ? '#ffffff' : 'text.primary',
          borderBottom: '2px solid',
          borderColor: 'divider',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Toolbar sx={{ 
          minHeight: { xs: 72, sm: 80, md: 88 },
          px: { xs: 2, sm: 3, md: 4 },
        }}>
          {!isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                mr: { xs: 2, sm: 3 },
                p: 1.5,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'action.hover',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease-in-out',
                '& .MuiSvgIcon-root': {
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography 
            variant="h4" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 900,
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' },
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.03em',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          >
            MelodyMind
          </Typography>

          {/* Theme Toggle */}
          <IconButton
            onClick={toggleTheme}
            sx={{ 
              mr: { xs: 1, sm: 2 },
              p: 1.5,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'action.hover',
                transform: 'scale(1.05) rotate(180deg)',
              },
              transition: 'all 0.3s ease-in-out',
            }}
          >
            {darkMode ? <LightMode sx={{ color: 'orange' }} /> : <DarkMode sx={{ color: 'grey.600' }} />}
          </IconButton>

          {/* Search Icon */}
          <IconButton
            onClick={handleSearchOpen}
            sx={{ 
              mr: { xs: 1, sm: 2 },
              p: 1.5,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'action.hover',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <Search />
          </IconButton>

          {/* Notifications Icon */}
          <IconButton
            onClick={handleNotificationsOpen}
            sx={{ 
              mr: { xs: 1, sm: 2 },
              p: 1.5,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'action.hover',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <Badge badgeContent={unreadNotificationsCount} color="error">
              <Notifications />
            </Badge>
          </IconButton>
          
          <IconButton
            onClick={handleMenuOpen}
            sx={{ 
              p: 1.5,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'action.hover',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <Avatar 
              src={user?.avatar} 
              alt={user?.name} 
              sx={{ 
                width: { xs: 40, sm: 44, md: 48 }, 
                height: { xs: 40, sm: 44, md: 48 },
                fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.375rem' },
                fontWeight: 700,
                border: '2px solid',
                borderColor: 'primary.main',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
              }}
            >
              {user?.name?.charAt(0)}
            </Avatar>
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              sx: {
                borderRadius: 3,
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                mt: 1,
                minWidth: 200,
                overflow: 'visible',
                backgroundColor: darkMode ? '#1e1e1e' : 'background.paper',
                color: darkMode ? 'white' : 'inherit',
                '&::before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: darkMode ? '#1e1e1e' : 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
          >
            <MenuItem 
              onClick={() => { navigate('/settings'); handleMenuClose(); }}
              sx={{
                py: 2,
                px: 3,
                borderRadius: 1,
                mx: 1,
                mt: 1,
                '&:hover': {
                  backgroundColor: darkMode ? 'rgba(99, 102, 241, 0.2)' : 'primary.light',
                  transform: 'translateX(4px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <ListItemIcon>
                <SettingsIcon fontSize="small" sx={{ color: darkMode ? 'white' : 'inherit' }} />
              </ListItemIcon>
              <Typography variant="body2" fontWeight={600}>
                Settings
              </Typography>
            </MenuItem>
            <Divider sx={{ my: 1, backgroundColor: darkMode ? '#333' : 'divider' }} />
            <MenuItem 
              onClick={handleLogout}
              sx={{
                py: 2,
                px: 3,
                borderRadius: 1,
                mx: 1,
                mb: 1,
                '&:hover': {
                  backgroundColor: darkMode ? 'rgba(244, 67, 54, 0.2)' : 'error.light',
                  transform: 'translateX(4px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <ListItemIcon>
                <Logout fontSize="small" sx={{ color: darkMode ? 'white' : 'inherit' }} />
              </ListItemIcon>
              <Typography variant="body2" fontWeight={600}>
                Logout
              </Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Search Popover */}
      <Popover
        open={Boolean(searchAnchorEl)}
        anchorEl={searchAnchorEl}
        onClose={handleSearchClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          mt: 1,
        }}
        PaperProps={{
          sx: {
            backgroundColor: darkMode ? '#1e1e1e' : 'background.paper',
            color: darkMode ? 'white' : 'inherit',
          },
        }}
      >
        <Box sx={{ p: 2, width: 320 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Search MelodyMind
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search for songs, moods, artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                handleSearch(searchQuery);
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery('')}>
                    <Clear />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: darkMode ? '#2d2d2d' : 'background.paper',
              },
            }}
          />
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => handleSearch(searchQuery)}
            disabled={!searchQuery.trim()}
          >
            Search
          </Button>
        </Box>
      </Popover>

      {/* Search Dialog for Mobile */}
      <Dialog 
        open={searchDialogOpen} 
        onClose={handleSearchClose} 
        fullWidth 
        maxWidth="sm"
        PaperProps={{
          sx: {
            backgroundColor: darkMode ? '#1e1e1e' : 'background.paper',
            color: darkMode ? 'white' : 'inherit',
          },
        }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={600}>
            Search MelodyMind
          </Typography>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search for songs, moods, artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                handleSearch(searchQuery);
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery('')}>
                    <Clear />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ 
              mt: 2,
              '& .MuiOutlinedInput-root': {
                backgroundColor: darkMode ? '#2d2d2d' : 'background.paper',
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSearchClose}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => handleSearch(searchQuery)}
            disabled={!searchQuery.trim()}
          >
            Search
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications Popover */}
      <Popover
        open={Boolean(notificationsAnchorEl)}
        anchorEl={notificationsAnchorEl}
        onClose={handleNotificationsClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          mt: 1,
        }}
        PaperProps={{
          sx: {
            backgroundColor: darkMode ? '#1e1e1e' : 'background.paper',
            color: darkMode ? 'white' : 'inherit',
          },
        }}
      >
        <Box sx={{ width: 360, maxHeight: 480, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: darkMode ? '#333' : 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={600}>
              Notifications
              {unreadNotificationsCount > 0 && (
                <Chip 
                  label={unreadNotificationsCount} 
                  size="small" 
                  color="error" 
                  sx={{ ml: 1, fontSize: '0.75rem', height: 20 }} 
                />
              )}
            </Typography>
            {notifications.length > 0 && (
              <Button 
                size="small" 
                onClick={handleClearAllNotifications}
                disabled={unreadNotificationsCount === 0}
              >
                Mark all read
              </Button>
            )}
          </Box>
          
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {notifications.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Notifications sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  No notifications yet
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {notifications.map((notification) => (
                  <ListItemButton
                    key={notification.id}
                    sx={{
                      borderBottom: 1,
                      borderColor: darkMode ? '#333' : 'divider',
                      backgroundColor: notification.read ? 'transparent' : (darkMode ? 'rgba(255, 255, 255, 0.05)' : 'action.hover'),
                      '&:hover': {
                        backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'action.selected',
                      },
                    }}
                    onClick={() => handleNotificationRead(notification.id)}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600} noWrap>
                          {notification.title}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveNotification(notification.id);
                          }}
                          sx={{ ml: 1 }}
                        >
                          <Clear fontSize="small" />
                        </IconButton>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {notification.message}
                      </Typography>
                      {notification.songRecommendation && (
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1, 
                          p: 1, 
                          backgroundColor: darkMode ? 'rgba(99, 102, 241, 0.2)' : 'primary.50', 
                          borderRadius: 1 
                        }}>
                          <MusicNote fontSize="small" color="primary" />
                          <Typography variant="caption" fontWeight={600}>
                            {notification.songRecommendation.title} - {notification.songRecommendation.artist}
                          </Typography>
                          <Chip 
                            label={notification.songRecommendation.mood} 
                            size="small" 
                            sx={{ 
                              backgroundColor: 'primary.main', 
                              color: 'white',
                              fontSize: '0.6rem',
                              height: 18,
                            }} 
                          />
                        </Box>
                      )}
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Box>
                  </ListItemButton>
                ))}
              </List>
            )}
          </Box>
        </Box>
      </Popover>

      {/* Main Content */}
      <Box sx={{ display: 'flex', flex: 1 }}>
        {/* Side Drawer for Desktop */}
        {!isMobile && (
          <Drawer
            variant="permanent"
            sx={{
              width: { xs: 320, sm: 360, md: 380 },
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: { xs: 320, sm: 360, md: 380 },
                boxSizing: 'border-box',
                borderRight: '2px solid',
                borderColor: 'divider',
                background: darkMode 
                  ? 'linear-gradient(180deg, #1e1e1e 0%, #2d2d2d 100%)'
                  : 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
                boxShadow: '4px 0 20px rgba(0, 0, 0, 0.08)',
              },
            }}
          >
            {drawer}
          </Drawer>
        )}

        {/* Main Content Area */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3, md: 4, lg: 5 },
            pb: isMobile ? 16 : { xs: 2, sm: 3, md: 4, lg: 5 },
            backgroundColor: 'background.default',
            minHeight: 'calc(100vh - 88px)',
            overflow: 'auto',
            background: darkMode 
              ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)'
              : 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
          }}
        >
          {children}
        </Box>
      </Box>

      {/* Music Player */}
      <MusicPlayer />

      {/* Bottom Navigation for Mobile */}
      {isMobile && (
        <BottomNavigation
          value={location.pathname}
          onChange={(event, newValue) => {
            navigate(newValue);
          }}
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            borderTop: '2px solid',
            borderColor: 'divider',
            background: darkMode 
              ? 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.1)',
            '& .MuiBottomNavigationAction-root': {
              minWidth: 'auto',
              padding: '8px 12px 12px',
              color: darkMode ? 'white' : 'inherit',
              '&.Mui-selected': {
                color: 'primary.main',
                '& .MuiSvgIcon-root': {
                  transform: 'scale(1.2)',
                },
              },
              '& .MuiSvgIcon-root': {
                fontSize: '1.5rem',
                transition: 'transform 0.2s ease-in-out',
              },
            },
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.75rem',
              fontWeight: 600,
              marginTop: '4px',
            },
          }}
        >
          {navItems.map((item) => (
            <BottomNavigationAction
              key={item.path}
              label={item.label}
              value={item.path}
              icon={item.icon}
            />
          ))}
        </BottomNavigation>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: { xs: 320, sm: 360 },
              background: darkMode 
                ? 'linear-gradient(180deg, #1e1e1e 0%, #2d2d2d 100%)'
                : 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
              boxShadow: '4px 0 20px rgba(0, 0, 0, 0.08)',
            },
          }}
        >
          {drawer}
        </Drawer>
      )}
    </Box>
  );
};

export default Layout;