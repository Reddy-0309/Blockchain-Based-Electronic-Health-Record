import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

function AccessManagement() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [accessControls, setAccessControls] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    providerId: '',
    accessLevel: 'Limited',
    expiresAt: '',
    specificRecordTypes: [],
  });

  useEffect(() => {
    const fetchAccessControls = async () => {
      try {
        setLoading(true);
        setError('');
        
        // In a real implementation, this would be an actual API call
        // For demo purposes, we're using mock data
        const response = api.mockGetAccessControls(currentUser.id);
        
        setAccessControls(response.data);
      } catch (err) {
        console.error('Error fetching access controls:', err);
        setError('Failed to load access control data');
      } finally {
        setLoading(false);
      }
    };

    fetchAccessControls();
  }, [currentUser.id]);

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    // Reset form data
    setFormData({
      providerId: '',
      accessLevel: 'Limited',
      expiresAt: '',
      specificRecordTypes: [],
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleRecordTypeChange = (e) => {
    setFormData({
      ...formData,
      specificRecordTypes: e.target.value,
    });
  };

  const handleGrantAccess = async () => {
    if (!formData.providerId) {
      setError('Provider ID is required');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // In a real implementation, this would be an API call to the backend
      // For demo purposes, we'll simulate a successful access grant
      const accessData = {
        patient_id: currentUser.id,
        provider_id: formData.providerId,
        access_level: formData.accessLevel,
        granted_at: new Date().toISOString(),
        expires_at: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
        specific_record_types: formData.accessLevel === 'Limited' ? formData.specificRecordTypes : null,
      };
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Granting access:', accessData);
      
      // Add the new access control to the list
      setAccessControls([...accessControls, accessData]);
      setSuccess('Access granted successfully');
      handleCloseDialog();
    } catch (err) {
      console.error('Error granting access:', err);
      setError('Failed to grant access: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeAccess = async (providerId) => {
    try {
      setLoading(true);
      setError('');
      
      // In a real implementation, this would be an API call to the backend
      // For demo purposes, we'll simulate a successful access revocation
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Revoking access for provider:', providerId);
      
      // Remove the access control from the list
      setAccessControls(accessControls.filter(access => access.provider_id !== providerId));
      setSuccess('Access revoked successfully');
    } catch (err) {
      console.error('Error revoking access:', err);
      setError('Failed to revoke access: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const getAccessLevelColor = (level) => {
    const colors = {
      'Owner': 'secondary',
      'Provider': 'primary',
      'Limited': 'info',
      'Emergency': 'error',
      'Auditor': 'default',
    };
    return colors[level] || 'default';
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

  if (loading && accessControls.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Access Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Grant Access
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      {accessControls.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No access controls found. Use the "Grant Access" button to give healthcare providers access to your records.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {accessControls.map((access) => (
            <Grid item xs={12} md={6} key={access.provider_id}>
              <Card>
                <CardHeader
                  title={`Provider: ${access.provider_id}`}
                  subheader={`Granted: ${new Date(access.granted_at).toLocaleDateString()}`}
                  action={
                    <Chip 
                      label={access.access_level} 
                      color={getAccessLevelColor(access.access_level)} 
                    />
                  }
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Expires:</strong> {access.expires_at ? new Date(access.expires_at).toLocaleDateString() : 'Never'}
                      </Typography>
                    </Grid>
                    {access.specific_record_types && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Allowed Record Types:</strong>
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {access.specific_record_types.map((type) => (
                            <Chip 
                              key={type} 
                              label={type} 
                              size="small" 
                              variant="outlined" 
                            />
                          ))}
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <Button
                    startIcon={<DeleteIcon />}
                    color="error"
                    onClick={() => handleRevokeAccess(access.provider_id)}
                    disabled={loading}
                  >
                    Revoke Access
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Grant Access Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Grant Access to Provider</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Provider ID"
                  name="providerId"
                  value={formData.providerId}
                  onChange={handleInputChange}
                  helperText="Enter the healthcare provider's unique identifier"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="access-level-label">Access Level</InputLabel>
                  <Select
                    labelId="access-level-label"
                    name="accessLevel"
                    value={formData.accessLevel}
                    onChange={handleInputChange}
                    label="Access Level"
                  >
                    <MenuItem value="Provider">Full Access (Provider)</MenuItem>
                    <MenuItem value="Limited">Limited Access</MenuItem>
                    <MenuItem value="Emergency">Emergency Access</MenuItem>
                    <MenuItem value="Auditor">Audit Access</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Expires At"
                  name="expiresAt"
                  type="date"
                  value={formData.expiresAt}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  helperText="Leave empty for no expiration"
                />
              </Grid>
              
              {formData.accessLevel === 'Limited' && (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="record-types-label">Specific Record Types</InputLabel>
                    <Select
                      labelId="record-types-label"
                      multiple
                      value={formData.specificRecordTypes}
                      onChange={handleRecordTypeChange}
                      label="Specific Record Types"
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </Box>
                      )}
                    >
                      {recordTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleGrantAccess} 
            variant="contained" 
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Grant Access'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default AccessManagement;
