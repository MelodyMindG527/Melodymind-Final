import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// src/store/musicStore.ts

export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  cover?: string;
  mood?: string;
  genre?: string;
  youtubeId?: string;
  url?: string;
}

export interface Mood {
  id: string;
  type: 'happy' | 'sad' | 'energetic' | 'calm' | 'anxious' | 'excited' | 'melancholic' | 'focused';
  intensity: number; 
  confidence: number;
  timestamp: Date;
  source: 'camera' | 'text' | 'voice' | 'journal';
  notes?: string;
  songs?: Song[];
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  songs: Song[];
  mood: string;
  created: Date;
}

export interface ListeningHistory {
  id: string;
  songId: string;
  song: Song;
  mood?: string;
  duration: number;
  timestamp: Date;
  completed: boolean;
}

interface MusicState {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  queue: Song[];
  currentMood: Mood | null;
  moodHistory: Mood[];
  playlists: Playlist[];
  listeningHistory: ListeningHistory[];
  isLoading: boolean;
  currentTime: number;
  duration: number;
  audioElement: HTMLAudioElement | null;

  setCurrentSong: (song: Song | null) => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (songId: string) => void;
  setCurrentMood: (mood: Mood) => void;
  addMoodToHistory: (mood: Mood) => void;
  createPlaylist: (playlist: Omit<Playlist, 'id' | 'created'>) => void;
  setLoading: (loading: boolean) => void;

  playNext: () => void;
  playPrevious: () => void;
  seekTo: (time: number) => void;
  playSong: (song: Song) => void;
  stopPlayback: () => void;

  addToHistory: (entry: Omit<ListeningHistory, 'id' | 'timestamp' | 'song'>) => void;
  clearHistory: () => void;
  getMoodStats: () => { [mood: string]: number };

  getSongsByMood: (mood: string) => Song[];
  getAllSongs: () => Song[];
}

const dummySongs: Song[] = [
  {
    id: '1',
    title: 'Happy',
    artist: 'Pharrell Williams',
    album: 'Girl',
    duration: 233,
    url: 'https://www.youtube.com/watch?v=ZbZSe6N_BXs',
    youtubeId: 'ZbZSe6N_BXs',
    cover: 'https://i.ytimg.com/vi/ZbZSe6N_BXs/hqdefault.jpg',
    genre: 'pop',
    mood: 'happy',
  },
  {
    id: '2',
    title: 'Weightless',
    artist: 'Marconi Union',
    album: 'Weightless',
    duration: 485,
    url: 'https://www.youtube.com/watch?v=UfcAVejslrU',
    youtubeId: 'UfcAVejslrU',
    cover: 'https://i.ytimg.com/vi/UfcAVejslrU/hqdefault.jpg',
    genre: 'ambient',
    mood: 'calm',
  },
  {
    id: '3',
    title: 'Eye of the Tiger',
    artist: 'Survivor',
    album: 'Eye of the Tiger',
    duration: 245,
    url: 'https://www.youtube.com/watch?v=btPJPFnesV4',
    youtubeId: 'btPJPFnesV4',
    cover: 'https://i.ytimg.com/vi/btPJPFnesV4/hqdefault.jpg',
    genre: 'rock',
    mood: 'energetic',
  },
  {
    id: '4',
    title: 'Someone Like You',
    artist: 'Adele',
    album: '21',
    duration: 285,
    url: 'https://www.youtube.com/watch?v=hLQl3WQQoQ0',
    youtubeId: 'hLQl3WQQoQ0',
    cover: 'https://i.ytimg.com/vi/hLQl3WQQoQ0/hqdefault.jpg',
    genre: 'pop',
    mood: 'sad',
  },
  {
    id: '5',
    title: 'Clair de Lune',
    artist: 'Claude Debussy',
    album: 'Suite Bergamasque',
    duration: 300,
    url: 'https://www.youtube.com/watch?v=CvFH_6DNRCY',
    youtubeId: 'CvFH_6DNRCY',
    cover: 'https://i.ytimg.com/vi/CvFH_6DNRCY/hqdefault.jpg',
    genre: 'classical',
    mood: 'calm',
  },
  {
    id: '6',
    title: 'Breathe Me',
    artist: 'Sia',
    album: '1000 Forms of Fear',
    duration: 276,
    url: 'https://www.youtube.com/watch?v=2To6qk1API4',
    youtubeId: '2To6qk1API4',
    cover: 'https://i.ytimg.com/vi/2To6qk1API4/hqdefault.jpg',
    genre: 'pop',
    mood: 'anxious',
  },
  {
    id: '7',
    title: 'River Flows in You',
    artist: 'Yiruma',
    album: 'First Love',
    duration: 240,
    url: 'https://www.youtube.com/watch?v=7maJOI3QMu0',
    youtubeId: '7maJOI3QMu0',
    cover: 'https://i.ytimg.com/vi/7maJOI3QMu0/hqdefault.jpg',
    genre: 'classical',
    mood: 'calm',
  },
  {
    id: '8',
    title: 'Gymnopédie No. 1',
    artist: 'Erik Satie',
    album: 'Trois Gymnopédies',
    duration: 210,
    url: 'https://www.youtube.com/watch?v=S-Xm7s9eGxU',
    youtubeId: 'S-Xm7s9eGxU',
    cover: 'https://i.ytimg.com/vi/S-Xm7s9eGxU/hqdefault.jpg',
    genre: 'classical',
    mood: 'calm',
  },
  {
    id: '9',
    title: 'Canon in D',
    artist: 'Johann Pachelbel',
    album: 'Canon and Gigue',
    duration: 330,
    url: 'https://www.youtube.com/watch?v=NlprozG9BwY',
    youtubeId: 'NlprozG9BwY',
    cover: 'https://i.ytimg.com/vi/NlprozG9BwY/hqdefault.jpg',
    genre: 'classical',
    mood: 'calm',
  },
  {
    id: '10',
    title: 'Moonlight Sonata',
    artist: 'Ludwig van Beethoven',
    album: 'Piano Sonata No. 14',
    duration: 900,
    url: 'https://www.youtube.com/watch?v=4Tr0otuiQuU',
    youtubeId: '4Tr0otuiQuU',
    cover: 'https://i.ytimg.com/vi/4Tr0otuiQuU/hqdefault.jpg',
    genre: 'classical',
    mood: 'calm',
  },
];

export const useMusicStore = create<MusicState>()(
  persist(
    (set, get) => ({
      currentSong: null,
      isPlaying: false,
      volume: 0.7,
      queue: [],
      currentMood: null,
      moodHistory: [],
      playlists: [],
      listeningHistory: [],
      isLoading: false,
      currentTime: 0,
      duration: 0,
      audioElement: null,

      setCurrentSong: (song) => {
        const { audioElement } = get();
        if (audioElement) {
          audioElement.pause();
          audioElement.src = '';
        }

        if (song) {
          // For YouTube songs, we don't create an HTML5 Audio element
          // The YouTube player will handle playback
          if (song.youtubeId) {
            set({
              currentSong: song,
              audioElement: null, // No HTML5 Audio for YouTube
              isPlaying: false,
              currentTime: 0,
              duration: song.duration || 0,
            });
          } else if (song.url && song.url.startsWith('http')) {
            // Only create HTML5 Audio for direct audio URLs
            const newAudio = new Audio(song.url);
            newAudio.volume = get().volume;

            newAudio.addEventListener('loadedmetadata', () => {
              set({ duration: newAudio.duration });
            });

            newAudio.addEventListener('timeupdate', () => {
              set({ currentTime: newAudio.currentTime });
            });

            newAudio.addEventListener('ended', () => {
              const { currentSong } = get();
              if (currentSong) {
                get().addToHistory({
                  songId: currentSong.id,
                  mood: currentSong.mood,
                  duration: currentSong.duration,
                  completed: true,
                });
              }
              get().playNext();
            });

            newAudio.addEventListener('error', (e) => {
              console.error('Audio loading error:', e);
              // Don't set the song if audio fails to load
              set({
                currentSong: null,
                audioElement: null,
                isPlaying: false,
                currentTime: 0,
                duration: 0,
              });
            });

            set({
              currentSong: song,
              audioElement: newAudio,
              isPlaying: false,
              currentTime: 0,
              duration: 0,
            });
          } else {
            // No valid audio source
            console.warn('No valid audio source for song:', song.title);
            set({
              currentSong: null,
              audioElement: null,
              isPlaying: false,
              currentTime: 0,
              duration: 0,
            });
          }
        } else {
          set({
            currentSong: null,
            audioElement: null,
            isPlaying: false,
            currentTime: 0,
            duration: 0,
          });
        }
      },

      togglePlay: () => {
        const { audioElement, isPlaying, currentSong } = get();
        
        // For YouTube songs, the YouTube player handles play/pause
        if (currentSong?.youtubeId) {
          // YouTube player controls are handled in the components
          set({ isPlaying: !isPlaying });
          return;
        }

        // For HTML5 Audio songs
        if (!audioElement) return;

        if (isPlaying) {
          audioElement.pause();
          set({ isPlaying: false });
        } else {
          audioElement.play();
          set({ isPlaying: true });

          if (currentSong) {
            get().addToHistory({
              songId: currentSong.id,
              mood: currentSong.mood,
              duration: currentSong.duration,
              completed: false,
            });
          }
        }
      },

      setVolume: (volume) => {
        const { audioElement, currentSong } = get();
        // For HTML5 Audio songs
        if (audioElement) audioElement.volume = volume;
        // For YouTube songs, volume is handled by the YouTube player in components
        set({ volume });
      },

      addToQueue: (song) => set((state) => ({ queue: [...state.queue, song] })),

      removeFromQueue: (songId) =>
        set((state) => ({ queue: state.queue.filter((s) => s.id !== songId) })),

      setCurrentMood: (mood) => set({ currentMood: mood }),

      addMoodToHistory: (mood) =>
        set((state) => ({
          moodHistory: [mood, ...state.moodHistory.slice(0, 99)],
        })),

      createPlaylist: (playlist) =>
        set((state) => ({
          playlists: [
            { ...playlist, id: Date.now().toString(), created: new Date() },
            ...state.playlists,
          ],
        })),

      setLoading: (loading) => set({ isLoading: loading }),

      playSong: (song) => {
        get().setCurrentSong(song);
        // For YouTube songs, the YouTube player will handle playback
        // For HTML5 Audio songs, toggle play after a short delay
        if (!song.youtubeId) {
          setTimeout(() => get().togglePlay(), 100);
        }
      },

      stopPlayback: () => {
        const { audioElement, currentSong } = get();
        // For HTML5 Audio songs
        if (audioElement) {
          audioElement.pause();
          audioElement.currentTime = 0;
        }
        // For YouTube songs, stopping is handled by the YouTube player in components
        set({ isPlaying: false, currentTime: 0 });
      },

      playNext: () => {
        const { queue, currentSong } = get();
        const currentIndex = queue.findIndex((s) => s.id === currentSong?.id);
        const nextSong = queue[currentIndex + 1] || queue[0];
        if (nextSong) get().playSong(nextSong);
      },

      playPrevious: () => {
        const { queue, currentSong } = get();
        const currentIndex = queue.findIndex((s) => s.id === currentSong?.id);
        const prevSong = queue[currentIndex - 1] || queue[queue.length - 1];
        if (prevSong) get().playSong(prevSong);
      },

      seekTo: (time) => {
        const { audioElement, currentSong } = get();
        // For HTML5 Audio songs
        if (audioElement) {
          audioElement.currentTime = time;
          set({ currentTime: time });
        }
        // For YouTube songs, seeking is handled by the YouTube player in components
      },

      addToHistory: (entry) => {
        const song =
          dummySongs.find((s) => s.id === entry.songId) || get().currentSong;
        if (song) {
          set((state) => ({
            listeningHistory: [
              { ...entry, id: Date.now().toString(), timestamp: new Date(), song },
              ...state.listeningHistory.slice(0, 499),
            ],
          }));
        }
      },

      clearHistory: () => set({ listeningHistory: [] }),

      getMoodStats: () => {
        const { listeningHistory } = get();
        const stats: { [mood: string]: number } = {};
        listeningHistory.forEach((e) => {
          if (!e.mood) return;
          stats[e.mood] = (stats[e.mood] || 0) + e.duration;
        });
        return stats;
      },

      getSongsByMood: (mood: string) =>
        dummySongs.filter((song) => song.mood === mood),

      getAllSongs: () => dummySongs,
    }),
    {
      name: 'music-storage',
      partialize: (state) => ({
        volume: state.volume,
        moodHistory: state.moodHistory,
        playlists: state.playlists,
        listeningHistory: state.listeningHistory,
      }),
    }
  )
);

export const moodSongs = {
  happy: dummySongs.filter((s) => s.mood === 'happy'),
  sad: dummySongs.filter((s) => s.mood === 'sad'),
  energetic: dummySongs.filter((s) => s.mood === 'energetic'),
  calm: dummySongs.filter((s) => s.mood === 'calm'),
  anxious: dummySongs.filter((s) => s.mood === 'anxious'),
  focused: dummySongs.filter((s) => s.mood === 'focused'),
  excited: dummySongs.filter((s) => s.mood === 'excited'),
  melancholic: dummySongs.filter((s) => s.mood === 'melancholic'),
  neutral: dummySongs.filter((s) => s.mood === 'calm'), // Map neutral to calm songs
};
