import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticateToken } from '../middleware/auth.js';
import { Song } from '../models/Song.js';
import fs from 'fs';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const songsDir = path.join(__dirname, '../../uploads/songs');
const coversDir = path.join(__dirname, '../../uploads/covers');

if (!fs.existsSync(songsDir)) {
  fs.mkdirSync(songsDir, { recursive: true });
}
if (!fs.existsSync(coversDir)) {
  fs.mkdirSync(coversDir, { recursive: true });
}

// Helper function to generate filename from song metadata
const generateFileName = (title, artist, mood, album = '') => {
  const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const cleanArtist = artist.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const cleanAlbum = album.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const moodPrefix = mood ? `${mood}_` : '';
  const albumSuffix = cleanAlbum ? `_${cleanAlbum}` : '';
  return `${moodPrefix}${cleanTitle}_${cleanArtist}${albumSuffix}`;
};

// Configure multer for song uploads
const songStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, songsDir);
  },
  filename: (req, file, cb) => {
    const { title, artist, mood, album } = req.body;
    const baseName = generateFileName(title, artist, mood, album);
    const extension = path.extname(file.originalname);
    cb(null, `${baseName}${extension}`);
  }
});

// Configure multer for cover uploads
const coverStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, coversDir);
  },
  filename: (req, file, cb) => {
    const { title, artist } = req.body;
    const baseName = generateFileName(title, artist, '', '');
    const extension = path.extname(file.originalname);
    cb(null, `${baseName}_cover${extension}`);
  }
});

const songUpload = multer({
  storage: songStorage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit for songs
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp3|wav|ogg|m4a|flac/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only audio files (mp3, wav, ogg, m4a, flac) are allowed'));
    }
  }
});

const coverUpload = multer({
  storage: coverStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for covers
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed'));
    }
  }
});

// Change requireAuth to authenticateToken
router.post('/upload', authenticateToken, songUpload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Here you would typically save the file info to your database
    const song = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadDate: new Date(),
      uploadedBy: req.user.userId // Assuming your authenticateToken middleware adds user info to req.user
    };

    res.json({
      success: true,
      message: 'File uploaded successfully',
      song
    });
  } catch (error) {
    next(error);
  }
});

// Other routes should also use authenticateToken instead of requireAuth
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    // Your song retrieval logic here
    res.json({ success: true, songs: [] });
  } catch (error) {
    next(error);
  }
});

// Add more routes as needed...

export default router;