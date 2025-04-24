import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  Alert,
  Snackbar,
  CircularProgress,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

function PatientDataContribution() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    dataType: 'PatientContribution',
    data: '',
    metadata: {
      source: '',
      description: '',
    },
  });

  // Only patients should be able to contribute their own data
  if (currentUser.userType !== 'patient') {
    return (
      <Container>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Alert severity="warning">
            Only patients can contribute their own health data.
          </Alert>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={() => navigate('/records')}
          >
            View Records
          </Button>
        </Box>
      </Container>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleMetadataChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        [name]: value,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.data) {
      setError('Please enter data to contribute');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // In a real implementation, this would be an API call to the backend
      // For demo purposes, we'll simulate a successful contribution
      const contributionData = {
        patient_id: currentUser.id,
        data_type: formData.dataType,
        data: formData.data,
        signature: `demo_signature_${Date.now()}`,
      };
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Contributing patient data:', contributionData);
      setSuccess(true);
      
      // Reset form after success
      setFormData({
        dataType: 'PatientContribution',
        data: '',
        metadata: {
          source: '',
          description: '',
        },
      });
    } catch (err) {
      console.error('Error contributing data:', err);
      setError('Failed to contribute health data: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
  };

  const dataTypes = [
    { value: 'PatientContribution', label: 'General Health Information' },
    { value: 'WearableData', label: 'Wearable Device Data' },
    { value: 'RemoteMonitoring', label: 'Remote Monitoring Data' },
  ];

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Contribute Your Health Data
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel id="data-type-label">Data Type</InputLabel>
                    <Select
                      labelId="data-type-label"
                      name="dataType"
                      value={formData.dataType}
                      onChange={handleInputChange}
                      label="Data Type"
                    >
                      {dataTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    multiline
                    rows={4}
                    label="Health Data"
                    name="data"
                    value={formData.data}
                    onChange={handleInputChange}
                    helperText="Enter your health information or data from devices"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Source"
                    name="source"
                    value={formData.metadata.source}
                    onChange={handleMetadataChange}
                    placeholder="e.g., Fitbit, Apple Watch, Home BP Monitor"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={formData.metadata.description}
                    onChange={handleMetadataChange}
                    placeholder="Brief description of the data"
                  />
                </Grid>
                
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      type="button"
                      variant="outlined"
                      sx={{ mr: 2 }}
                      onClick={() => navigate('/records')}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                    >
                      {loading ? (
                        <CircularProgress size={24} />
                      ) : (
                        'Submit Data'
                      )}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                About Patient Contributions
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" paragraph>
                You can contribute your own health data to your electronic health record. This data becomes part of your permanent record and is secured using blockchain technology.
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Types of data you can contribute:
              </Typography>
              <ul>
                <li>
                  <Typography variant="body2">
                    <strong>General Health Information</strong> - symptoms, wellness updates, etc.
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    <strong>Wearable Device Data</strong> - heart rate, steps, sleep patterns, etc.
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    <strong>Remote Monitoring Data</strong> - blood pressure, glucose readings, etc.
                  </Typography>
                </li>
              </ul>
              <Alert severity="info" sx={{ mt: 2 }}>
                All contributed data is encrypted and securely stored on the blockchain. You control who can access this information.
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Your health data has been successfully contributed!
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default PatientDataContribution;
