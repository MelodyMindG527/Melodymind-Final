import mongoose from 'mongoose';
import { toJSON } from '../db/mongoose.js';

const songSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    artist: { type: String, required: true },
    album: { type: String },
    duration: { type: Number },
    genres: [String],
    moodTags: [String],
    // Local file support
    fileName: { type: String }, // e.g., "happy_sunshine_band_summer_vibes.mp3"
    filePath: { type: String }, // e.g., "/uploads/songs/happy_sunshine_band_summer_vibes.mp3"
    fileSize: { type: Number },
    mimeType: { type: String },
    // Cover image support
    coverFileName: { type: String },
    coverPath: { type: String },
    // Legacy support
    fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'uploads.files', index: true },
    coverUrl: { type: String },
    // YouTube support (optional)
    youtubeId: { type: String },
    url: { type: String },
  },
  { timestamps: true }
);

toJSON(songSchema);

export const Song = mongoose.model('Song', songSchema);


