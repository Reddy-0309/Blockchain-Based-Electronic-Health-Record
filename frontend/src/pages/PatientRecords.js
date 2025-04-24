import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Box,
  TextField,
  InputAdornment,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

function PatientRecords() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);
        setError('');
        
        // In a real implementation, this would be an actual API call
        // For demo purposes, we're using mock data
        const response = api.mockGetPatientRecords(currentUser.id);
        
        setRecords(response.data);
        setFilteredRecords(response.data);
      } catch (err) {
        console.error('Error fetching patient records:', err);
        setError('Failed to load health records');
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [currentUser.id]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredRecords(records);
      return;
    }
    
    const filtered = records.filter(record => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        record.record_type.toLowerCase().includes(searchTermLower) ||
        record.provider_id.toLowerCase().includes(searchTermLower) ||
        Object.entries(record.metadata).some(([key, value]) => 
          key.toLowerCase().includes(searchTermLower) || 
          value.toString().toLowerCase().includes(searchTermLower)
        )
      );
    });
    
    setFilteredRecords(filtered);
  }, [searchTerm, records]);

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const getRecordTypeColor = (type) => {
    const colors = {
      'Diagnosis': 'primary',
      'Medication': 'success',
      'LabResult': 'info',
      'Procedure': 'warning',
      'Immunization': 'secondary',
      'Allergy': 'error',
      'Vital': 'default',
      'Note': 'default',
    };
    return colors[type] || 'default';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Health Records
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search records by type, provider, or metadata..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      {filteredRecords.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No health records found.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredRecords.map((record) => (
            <Grid item xs={12} md={6} lg={4} key={record.record_id}>
              <Card className="record-card" sx={{ height: '100%' }}>
                <CardHeader
                  title={record.record_type}
                  subheader={`Provider: ${record.provider_id}`}
                  action={
                    <Chip 
                      label={new Date(record.timestamp).toLocaleDateString()} 
                      color={getRecordTypeColor(record.record_type)} 
                      size="small" 
                      variant="outlined"
                    />
                  }
                />
                <CardContent>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {Object.entries(record.metadata).map(([key, value]) => (
                      <Box key={key} sx={{ mb: 0.5 }}>
                        <strong>{key}:</strong> {value}
                      </Box>
                    ))}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleViewRecord(record)}
                      size="small"
                    >
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Record Details Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        {selectedRecord && (
          <>
            <DialogTitle>
              {selectedRecord.record_type} Record Details
              <Chip 
                label={new Date(selectedRecord.timestamp).toLocaleString()} 
                color={getRecordTypeColor(selectedRecord.record_type)} 
                size="small" 
                sx={{ ml: 2 }}
              />
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Record ID</Typography>
                  <Typography variant="body2" paragraph>{selectedRecord.record_id}</Typography>
                  
                  <Typography variant="subtitle2">Patient ID</Typography>
                  <Typography variant="body2" paragraph>{selectedRecord.patient_id}</Typography>
                  
                  <Typography variant="subtitle2">Provider ID</Typography>
                  <Typography variant="body2" paragraph>{selectedRecord.provider_id}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Metadata</Typography>
                  {Object.entries(selectedRecord.metadata).map(([key, value]) => (
                    <Box key={key} sx={{ mb: 1 }}>
                      <Typography variant="body2">
                        <strong>{key}:</strong> {value}
                      </Typography>
                    </Box>
                  ))}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Encrypted Data</Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={selectedRecord.data}
                    InputProps={{
                      readOnly: true,
                    }}
                    variant="outlined"
                    size="small"
                    sx={{ fontFamily: 'monospace', mt: 1 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Digital Signature</Typography>
                  <TextField
                    fullWidth
                    value={selectedRecord.signature}
                    InputProps={{
                      readOnly: true,
                    }}
                    variant="outlined"
                    size="small"
                    sx={{ fontFamily: 'monospace', mt: 1 }}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
}

export default PatientRecords;
