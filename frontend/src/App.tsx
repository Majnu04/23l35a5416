
import React, { useState, useEffect } from 'react';
import './App.css';
import { 
  Container, 
  Paper, 
  Tabs, 
  Tab, 
  Box, 
  Typography, 
  AppBar,
  Toolbar,
  ThemeProvider,
  createTheme,
  CssBaseline
} from '@mui/material';
import ShortenerForm from './components/ShortenerForm';
import StatsPage from './components/StatsPage';
import { logInfo, logError } from './loggerClient';

// Minimal black and white theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#000000',
    },
    secondary: {
      main: '#666666',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Arial", sans-serif',
    h4: {
      fontWeight: 500,
      color: '#000000',
    },
    h5: {
      fontWeight: 500,
      color: '#000000',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '4px',
        },
        contained: {
          backgroundColor: '#000000',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#333333',
          },
        },
      },
    },
  },
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`url-tabpanel-${index}`}
      aria-labelledby={`url-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 4 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `url-tab-${index}`,
    'aria-controls': `url-tabpanel-${index}`,
  };
}

function App() {
  const [currentTab, setCurrentTab] = useState(0);

  // Set up global error handling
  useEffect(() => {
    const handleUnhandledError = (event: ErrorEvent) => {
      logError('app', 'Unhandled JavaScript error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logError('app', 'Unhandled Promise rejection', {
        reason: event.reason?.toString() || 'Unknown reason'
      });
    };

    // Application startup logging
    logInfo('app', 'URL Shortener application started', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    window.addEventListener('error', handleUnhandledError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleUnhandledError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const handleTabChange = async (_: React.SyntheticEvent, newValue: number) => {
    const tabNames = ['Create Link', 'Statistics'];
    
    await logInfo('component', 'Tab changed', {
      fromTab: currentTab,
      toTab: newValue,
      tabName: tabNames[newValue]
    });
    
    setCurrentTab(newValue);
  };

  // Log page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        logInfo('app', 'Application hidden');
      } else {
        logInfo('app', 'Application visible');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppBar position="static" elevation={0} sx={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e0e0e0' }}>
          <Toolbar>
            <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: '#000000' }}>
              URL Shortener
            </Typography>
          </Toolbar>
        </AppBar>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2, overflow: 'auto' }}>
          <Container maxWidth="lg" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Paper elevation={0} sx={{ 
              border: '1px solid #e0e0e0', 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              minHeight: 0
            }}>
              <Box sx={{ borderBottom: '1px solid #e0e0e0' }}>
                <Tabs 
                  value={currentTab} 
                  onChange={handleTabChange} 
                  aria-label="URL shortener tabs"
                  variant="fullWidth"
                  sx={{
                    '& .MuiTab-root': {
                      color: '#666666',
                      '&.Mui-selected': {
                        color: '#000000',
                      },
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: '#000000',
                    },
                  }}
                >
                  <Tab 
                    label="Create Link" 
                    {...a11yProps(0)} 
                    sx={{ minHeight: 48, fontSize: '14px' }}
                  />
                  <Tab 
                    label="Statistics" 
                    {...a11yProps(1)} 
                    sx={{ minHeight: 48, fontSize: '14px' }}
                  />
                </Tabs>
              </Box>
              
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                <TabPanel value={currentTab} index={0}>
                  <ShortenerForm />
                </TabPanel>
                
                <TabPanel value={currentTab} index={1}>
                  <StatsPage />
                </TabPanel>
              </Box>
            </Paper>
          </Container>
        </Box>
      </div>
    </ThemeProvider>
  );
}

export default App;
