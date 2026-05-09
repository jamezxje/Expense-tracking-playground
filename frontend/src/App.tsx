import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, Box, CircularProgress } from '@mui/material';

function App() {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setStatus(data.status);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setStatus('error');
        setLoading(false);
      });
  }, []);

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Personal Finance
        </Typography>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">Backend Status:</Typography>
          {loading ? (
            <CircularProgress size={24} sx={{ mt: 2 }} />
          ) : (
            <Typography variant="body1" color={status === 'ok' ? 'success.main' : 'error.main'} sx={{ fontWeight: 'bold', mt: 1 }}>
              {status?.toUpperCase()}
            </Typography>
          )}
        </Paper>
      </Box>
    </Container>
  );
}

export default App;
