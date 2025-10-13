import React from 'react';
import { Box } from '@mui/material';
import SentimentAnalysis from '../components/SentimentAnalysis';

const SentimentAnalysisPage: React.FC = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <SentimentAnalysis />
    </Box>
  );
};

export default SentimentAnalysisPage;
