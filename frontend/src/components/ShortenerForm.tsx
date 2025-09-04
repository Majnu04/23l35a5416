import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  Link,
  Stack,
  Fade
} from '@mui/material';
import { api, type ShortenUrlRequest } from '../api';
import { logInfo, logError } from '../loggerClient';

const ShortenerForm: React.FC = () => {
  const [formData, setFormData] = useState({
    url: '',
    customCode: '',
    validityDays: 30
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ shortLink: string; expiry: string } | null>(null);
  const [error, setError] = useState('');

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleCreateShortUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const requestData: ShortenUrlRequest = {
        url: formData.url.trim(),
        validity: formData.validityDays || 30,
      };

      if (formData.customCode.trim()) {
        requestData.shortcode = formData.customCode.trim();
      }

      await logInfo('component', 'Creating short URL', { 
        originalUrl: requestData.url,
        hasCustomCode: !!requestData.shortcode 
      });

      const response = await api.shortenUrl(requestData);
      setResult(response);

      await logInfo('component', 'Short URL created successfully', { 
        shortLink: response.shortLink 
      });

      setFormData({
        url: '',
        customCode: '',
        validityDays: 30
      });

    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Something went wrong';
      setError(errorMessage);
      
      await logError('component', 'Failed to create short URL', { 
        error: errorMessage,
        url: formData.url.trim() 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!result?.shortLink) return;
    
    try {
      await navigator.clipboard.writeText(result.shortLink);
      await logInfo('component', 'Short link copied to clipboard');
    } catch (err) {
      await logError('component', 'Failed to copy link', { error: err });
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 500, mb: 3 }}>
        Create Short Link
      </Typography>

      <Box component="form" onSubmit={handleCreateShortUrl}>
        <Stack spacing={3}>
          <TextField
            fullWidth
            label="URL"
            placeholder="https://example.com/very-long-url"
            value={formData.url}
            onChange={handleInputChange('url')}
            required
            variant="outlined"
            size="medium"
          />

          <TextField
            fullWidth
            label="Custom Code (Optional)"
            placeholder="custom-code"
            value={formData.customCode}
            onChange={handleInputChange('customCode')}
            variant="outlined"
            size="medium"
            helperText="3-10 characters (letters and numbers only)"
          />

          <TextField
            fullWidth
            type="number"
            label="Validity (Days)"
            value={formData.validityDays}
            onChange={handleInputChange('validityDays')}
            variant="outlined"
            size="medium"
            inputProps={{ min: 1, max: 365 }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isLoading || !formData.url.trim()}
            sx={{ py: 1.5 }}
          >
            {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Create Link'}
          </Button>
        </Stack>
      </Box>

      {error && (
        <Fade in={!!error}>
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        </Fade>
      )}

      {result && (
        <Fade in={!!result}>
          <Box sx={{ mt: 4 }}>
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
                Success
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Your shortened URL:
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Link
                  href={result.shortLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ 
                    flexGrow: 1, 
                    wordBreak: 'break-all',
                    textDecoration: 'none',
                    color: '#000000',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  {result.shortLink}
                </Link>
                
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleCopyLink}
                >
                  Copy
                </Button>
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                Expires: {new Date(result.expiry).toLocaleDateString()}
              </Typography>
            </Paper>
          </Box>
        </Fade>
      )}
    </Box>
  );
};

export default ShortenerForm;
