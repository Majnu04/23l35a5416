import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Stack,
  Fade,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { api, type UrlStatsResponse } from '../api';
import { logInfo, logError } from '../loggerClient';

const StatsPage: React.FC = () => {
  const [searchCode, setSearchCode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [urlStats, setUrlStats] = useState<UrlStatsResponse | null>(null);
  const [searchError, setSearchError] = useState('');

  const handleSearchStats = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;

    setIsSearching(true);
    setSearchError('');
    setUrlStats(null);

    try {
      await logInfo('component', 'Searching for URL statistics', { 
        shortcode: searchCode.trim() 
      });

      const response = await api.getUrlStats(searchCode.trim());
      setUrlStats(response);

      await logInfo('component', 'URL statistics retrieved successfully', { 
        shortcode: searchCode.trim(),
        clicks: response.clicks 
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch statistics';
      setSearchError(errorMessage);
      
      await logError('component', 'Failed to fetch URL statistics', { 
        error: errorMessage,
        shortcode: searchCode.trim() 
      });
    } finally {
      setIsSearching(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    };
  };

  const isLinkExpired = (expiryString: string) => {
    return new Date() > new Date(expiryString);
  };

  const getDaysUntilExpiry = (expiryString: string) => {
    const now = new Date();
    const expiry = new Date(expiryString);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getClickRating = (clicks: number) => {
    if (clicks === 0) return { label: 'No clicks yet', progress: 0 };
    if (clicks < 10) return { label: 'Getting started', progress: 25 };
    if (clicks < 50) return { label: 'Growing popularity', progress: 50 };
    if (clicks < 100) return { label: 'Very popular', progress: 75 };
    return { label: 'Viral link', progress: 100 };
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 500, mb: 3 }}>
        Link Analytics
      </Typography>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Box component="form" onSubmit={handleSearchStats}>
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              Search Link Statistics
            </Typography>

            <TextField
              fullWidth
              label="Enter Short Code"
              placeholder="e.g., abc123"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              required
              variant="outlined"
              helperText="Enter the code part after the last slash in your short URL"
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isSearching || !searchCode.trim()}
              sx={{ py: 1.5 }}
            >
              {isSearching ? <CircularProgress size={20} color="inherit" /> : 'Get Analytics'}
            </Button>
          </Stack>
        </Box>
      </Paper>

      {searchError && (
        <Fade in={!!searchError}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {searchError}
          </Alert>
        </Fade>
      )}

      {urlStats && (
        <Fade in={!!urlStats}>
          <Box>
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
                      Link: {searchCode}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Analytics and performance metrics
                    </Typography>
                  </Box>
                  
                  <Chip 
                    label={isLinkExpired(urlStats.expiry) ? 'Expired' : 'Active'} 
                    color={isLinkExpired(urlStats.expiry) ? 'error' : 'success'} 
                    variant="outlined"
                  />
                </Box>

                <Paper variant="outlined" sx={{ p: 3, mb: 3, bgcolor: '#fafafa' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Original URL:
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      wordBreak: 'break-all',
                      fontFamily: 'monospace',
                      fontSize: '0.95rem',
                      p: 2,
                      bgcolor: 'white',
                      borderRadius: 1,
                      border: '1px solid #e0e0e0'
                    }}
                  >
                    {urlStats.originalUrl}
                  </Typography>
                </Paper>

                <Box sx={{ display: 'flex', gap: 3, mb: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                  <Box sx={{ flex: 1 }}>
                    <Card variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#000000' }}>
                        {urlStats.clicks}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Total Clicks
                      </Typography>
                      
                      <Box sx={{ mt: 2, mb: 2 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={getClickRating(urlStats.clicks).progress} 
                          sx={{ height: 8, borderRadius: 4, bgcolor: '#f5f5f5', '& .MuiLinearProgress-bar': { bgcolor: '#000000' } }}
                        />
                      </Box>
                      
                      <Chip 
                        label={getClickRating(urlStats.clicks).label}
                        variant="outlined"
                        size="small"
                      />
                    </Card>
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Card variant="outlined" sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 500, mb: 3 }}>
                        Time Information
                      </Typography>
                      
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Created:
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {formatDateTime(urlStats.createdAt).date} at {formatDateTime(urlStats.createdAt).time}
                          </Typography>
                        </Box>
                        
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Expires:
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {formatDateTime(urlStats.expiry).date} at {formatDateTime(urlStats.expiry).time}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {isLinkExpired(urlStats.expiry) 
                              ? 'This link has expired' 
                              : `${getDaysUntilExpiry(urlStats.expiry)} days remaining`
                            }
                          </Typography>
                        </Box>
                      </Stack>
                    </Card>
                  </Box>
                </Box>

                <Box sx={{ mt: 3 }}>
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                          <TableCell sx={{ fontWeight: 'bold' }}>Property</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Value</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>Short Code</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace' }}>{searchCode}</TableCell>
                        </TableRow>
                        <TableRow sx={{ bgcolor: '#fafafa' }}>
                          <TableCell>Short Link</TableCell>
                          <TableCell>
                            <Typography 
                              component="a" 
                              href={`http://localhost:5000/${searchCode}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              sx={{ 
                                color: '#000000', 
                                textDecoration: 'none',
                                '&:hover': { textDecoration: 'underline' }
                              }}
                            >
                              http://localhost:5000/{searchCode}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Total Clicks</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>{urlStats.clicks}</TableCell>
                        </TableRow>
                        <TableRow sx={{ bgcolor: '#fafafa' }}>
                          <TableCell>Status</TableCell>
                          <TableCell>
                            <Chip 
                              label={isLinkExpired(urlStats.expiry) ? 'Expired' : 'Active'} 
                              color={isLinkExpired(urlStats.expiry) ? 'error' : 'success'} 
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Stack direction="row" spacing={2} justifyContent="center">
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => window.open(`http://localhost:5000/${searchCode}`, '_blank')}
                    >
                      Visit Link
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => setSearchCode('')}
                    >
                      Search Another
                    </Button>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Fade>
      )}

      {!urlStats && !searchError && !isSearching && (
        <Paper sx={{ p: 6, textAlign: 'center', bgcolor: '#fafafa' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Ready to analyze your links?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enter a short code above to view detailed analytics and performance metrics.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default StatsPage;
