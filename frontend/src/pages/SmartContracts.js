import React, { useState, useEffect } from 'react';
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
  CardActions,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

function SmartContracts() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    contractType: 'TimeBasedAccess',
    parties: [],
    providerToAdd: '',
    conditions: '',
    expirationDate: '',
  });

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setLoading(true);
        setError('');
        
        // In a real implementation, this would be an actual API call
        // For demo purposes, we're using mock data
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data for smart contracts
        const mockContracts = [
          {
            contract_id: 'contract-001',
            contract_type: 'TimeBasedAccess',
            parties: [currentUser.id, 'doc_123'],
            conditions: 'Access expires on 2025-05-18',
            created_at: new Date().toISOString(),
            status: 'Active',
          },
          {
            contract_id: 'contract-002',
            contract_type: 'EmergencyAccess',
            parties: [currentUser.id, 'hospital_456'],
            conditions: 'Automatic access in case of emergency',
            created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            status: 'Active',
          },
        ];
        
        setContracts(mockContracts);
      } catch (err) {
        console.error('Error fetching smart contracts:', err);
        setError('Failed to load smart contracts');
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, [currentUser.id]);

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    // Reset form data
    setFormData({
      contractType: 'TimeBasedAccess',
      parties: [],
      providerToAdd: '',
      conditions: '',
      expirationDate: '',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAddParty = () => {
    if (!formData.providerToAdd) return;
    
    setFormData({
      ...formData,
      parties: [...formData.parties, formData.providerToAdd],
      providerToAdd: '',
    });
  };

  const handleRemoveParty = (partyToRemove) => {
    setFormData({
      ...formData,
      parties: formData.parties.filter(party => party !== partyToRemove),
    });
  };

  const handleCreateContract = async () => {
    if (formData.parties.length === 0 || !formData.conditions) {
      setError('Please add at least one party and specify conditions');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Prepare conditions based on contract type
      let conditions = formData.conditions;
      if (formData.contractType === 'TimeBasedAccess' && formData.expirationDate) {
        conditions = `Access expires on ${formData.expirationDate}`;
      }
      
      // In a real implementation, this would be an API call to the backend
      // For demo purposes, we'll simulate a successful contract creation
      const contractData = {
        contract_type: formData.contractType,
        parties: [currentUser.id, ...formData.parties],
        conditions,
        signature: `demo_signature_${Date.now()}`,
      };
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Creating smart contract:', contractData);
      
      // Add the new contract to the list
      const newContract = {
        contract_id: `contract-${Date.now()}`,
        contract_type: contractData.contract_type,
        parties: contractData.parties,
        conditions: contractData.conditions,
        created_at: new Date().toISOString(),
        status: 'Active',
      };
      
      setContracts([newContract, ...contracts]);
      setSuccess('Smart contract created successfully');
      handleCloseDialog();
    } catch (err) {
      console.error('Error creating smart contract:', err);
      setError('Failed to create smart contract: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteContract = async (contractId) => {
    try {
      setLoading(true);
      setError('');
      
      // In a real implementation, this would be an API call to the backend
      // For demo purposes, we'll simulate a successful contract execution
      const executionData = {
        contract_id: contractId,
        execution_params: { executed_by: currentUser.id },
        signature: `demo_signature_${Date.now()}`,
      };
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Executing smart contract:', executionData);
      
      // Update the contract status
      setContracts(contracts.map(contract => 
        contract.contract_id === contractId 
          ? { ...contract, status: 'Executed' } 
          : contract
      ));
      
      setSuccess('Smart contract executed successfully');
    } catch (err) {
      console.error('Error executing smart contract:', err);
      setError('Failed to execute smart contract: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const getContractTypeLabel = (type) => {
    const types = {
      'TimeBasedAccess': 'Time-Based Access',
      'EmergencyAccess': 'Emergency Access',
      'ConditionalAccess': 'Conditional Access',
      'DataSharing': 'Data Sharing Agreement',
    };
    return types[type] || type;
  };

  const getContractTypeColor = (type) => {
    const colors = {
      'TimeBasedAccess': 'primary',
      'EmergencyAccess': 'error',
      'ConditionalAccess': 'warning',
      'DataSharing': 'info',
    };
    return colors[type] || 'default';
  };

  const contractTypes = [
    { value: 'TimeBasedAccess', label: 'Time-Based Access' },
    { value: 'EmergencyAccess', label: 'Emergency Access' },
    { value: 'ConditionalAccess', label: 'Conditional Access' },
    { value: 'DataSharing', label: 'Data Sharing Agreement' },
  ];

  if (loading && contracts.length === 0) {
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
          Smart Contracts
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Create Contract
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
      
      {contracts.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No smart contracts found. Use the "Create Contract" button to create automated agreements for data access and sharing.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {contracts.map((contract) => (
            <Grid item xs={12} md={6} key={contract.contract_id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      {getContractTypeLabel(contract.contract_type)}
                    </Typography>
                    <Chip 
                      label={contract.status} 
                      color={contract.status === 'Active' ? 'success' : 'default'} 
                      size="small" 
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Contract ID:</strong> {contract.contract_id}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Created:</strong> {new Date(contract.created_at).toLocaleString()}
                  </Typography>
                  
                  <Divider sx={{ my: 1.5 }} />
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Parties:
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    {contract.parties.map((party) => (
                      <Chip 
                        key={party} 
                        label={party === currentUser.id ? `${party} (You)` : party} 
                        size="small" 
                        variant="outlined" 
                      />
                    ))}
                  </Box>
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Conditions:
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {contract.conditions}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleExecuteContract(contract.contract_id)}
                    disabled={contract.status !== 'Active' || loading}
                  >
                    Execute Contract
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Create Contract Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Create Smart Contract</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="contract-type-label">Contract Type</InputLabel>
                <Select
                  labelId="contract-type-label"
                  name="contractType"
                  value={formData.contractType}
                  onChange={handleInputChange}
                  label="Contract Type"
                >
                  {contractTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Add Parties to Contract:
              </Typography>
              <Box sx={{ display: 'flex', mb: 1 }}>
                <TextField
                  fullWidth
                  label="Provider ID"
                  name="providerToAdd"
                  value={formData.providerToAdd}
                  onChange={handleInputChange}
                  placeholder="Enter provider ID"
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddParty}
                  disabled={!formData.providerToAdd}
                >
                  Add
                </Button>
              </Box>
              
              {formData.parties.length > 0 ? (
                <Paper variant="outlined" sx={{ p: 1, mt: 1 }}>
                  <List dense>
                    {formData.parties.map((party) => (
                      <ListItem
                        key={party}
                        secondaryAction={
                          <Button 
                            size="small" 
                            color="error" 
                            onClick={() => handleRemoveParty(party)}
                          >
                            Remove
                          </Button>
                        }
                      >
                        <ListItemText primary={party} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No parties added yet. You will automatically be included as a party.
                </Typography>
              )}
            </Grid>
            
            {formData.contractType === 'TimeBasedAccess' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Expiration Date"
                  name="expirationDate"
                  type="date"
                  value={formData.expirationDate}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  helperText="When should access expire?"
                />
              </Grid>
            )}
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Conditions"
                name="conditions"
                value={formData.conditions}
                onChange={handleInputChange}
                helperText="Specify the conditions of this smart contract"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleCreateContract} 
            variant="contained" 
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Create Contract'}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={Boolean(success)}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
      >
        <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default SmartContracts;
