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
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

function CreateRecord() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    patientId: '',
    recordType: 'Diagnosis',
    data: '',
    metadata: {
      key1: '',
      key2: '',
      key3: '',
    },
  });

  // Only healthcare providers should be able to create records
  if (currentUser.userType !== 'provider') {
    return (
      <Container>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Alert severity="warning">
            Only healthcare providers can create new health records.
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
    
    if (!formData.patientId || !formData.data) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // In a real implementation, this would be an API call to the backend
      // For demo purposes, we'll simulate a successful record creation
      const recordData = {
        patient_id: formData.patientId,
        provider_id: currentUser.id,
        record_type: formData.recordType,
        data: formData.data,
        metadata: {
          ...Object.fromEntries(
            Object.entries(formData.metadata).filter(([_, value]) => value !== '')
          ),
        },
        signature: `demo_signature_${Date.now()}`,
      };
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Creating record:', recordData);
      setSuccess(true);
      
      // Reset form after success
      setFormData({
        patientId: '',
        recordType: 'Diagnosis',
        data: '',
        metadata: {
          key1: '',
          key2: '',
          key3: '',
        },
      });
    } catch (err) {
      console.error('Error creating record:', err);
      setError('Failed to create health record: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
  };

  const recordTypes = [
    'Diagnosis',
    'Medication',
    'LabResult',
    'Procedure',
    'Immunization',
    'Allergy',
    'Vital',
    'Note',
  ];

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Create New Health Record
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Patient ID"
                name="patientId"
                value={formData.patientId}
                onChange={handleInputChange}
                helperText="Enter the patient's unique identifier"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel id="record-type-label">Record Type</InputLabel>
                <Select
                  labelId="record-type-label"
                  name="recordType"
                  value={formData.recordType}
                  onChange={handleInputChange}
                  label="Record Type"
                >
                  {recordTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
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
                label="Record Data"
                name="data"
                value={formData.data}
                onChange={handleInputChange}
                helperText="This data will be encrypted before storing on the blockchain"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Metadata (Optional)
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Key 1"
                    name="key1"
                    value={formData.metadata.key1}
                    onChange={handleMetadataChange}
                    placeholder="e.g., Diagnosis"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Key 2"
                    name="key2"
                    value={formData.metadata.key2}
                    onChange={handleMetadataChange}
                    placeholder="e.g., Medication"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Key 3"
                    name="key3"
                    value={formData.metadata.key3}
                    onChange={handleMetadataChange}
                    placeholder="e.g., Dosage"
                  />
                </Grid>
              </Grid>
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
                    'Create Record'
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Health record created successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default CreateRecord;
