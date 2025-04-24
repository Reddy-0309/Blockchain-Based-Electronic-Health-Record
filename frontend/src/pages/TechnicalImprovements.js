import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Speed,
  Security,
  Storage,
  SettingsEthernet,
  Layers,
  Cached,
  Lock,
  VerifiedUser,
  CheckCircle,
  Info,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tech-tabpanel-${index}`}
      aria-labelledby={`tech-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `tech-tab-${index}`,
    'aria-controls': `tech-tabpanel-${index}`,
  };
}

const TechnicalImprovements = () => {
  const { currentUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [consensusMethod, setConsensusMethod] = useState({
    oldMethod: 'ProofOfWork',
    newMethod: 'ProofOfAuthority',
    reason: '',
    approvedBy: '',
  });
  const [scalabilitySolution, setScalabilitySolution] = useState({
    solutionType: 'Layer2Rollup',
    configuration: '',
    approvedBy: '',
  });
  const [encryptionMethod, setEncryptionMethod] = useState({
    oldMethod: 'AES256',
    newMethod: 'PostQuantumNTRU',
    affectedRecords: [],
    approvedBy: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleConsensusMethodChange = (e) => {
    const { name, value } = e.target;
    setConsensusMethod({ ...consensusMethod, [name]: value });
  };

  const handleScalabilitySolutionChange = (e) => {
    const { name, value } = e.target;
    setScalabilitySolution({ ...scalabilitySolution, [name]: value });
  };

  const handleEncryptionMethodChange = (e) => {
    const { name, value } = e.target;
    setEncryptionMethod({ ...encryptionMethod, [name]: value });
  };

  const handleUpdateConsensusMethod = async (e) => {
    e.preventDefault();
    try {
      // In a real app, we would call the API
      // await api.updateConsensusMethod({
      //   ...consensusMethod,
      //   signature: currentUser.id, // In a real app, this would be a digital signature
      // });

      setSnackbar({
        open: true,
        message: 'Consensus method updated successfully',
        severity: 'success',
      });

      // Reset form
      setConsensusMethod({
        oldMethod: 'ProofOfWork',
        newMethod: 'ProofOfAuthority',
        reason: '',
        approvedBy: '',
      });
    } catch (error) {
      console.error('Error updating consensus method:', error);
      setSnackbar({
        open: true,
        message: 'Error updating consensus method: ' + error.message,
        severity: 'error',
      });
    }
  };

  const handleImplementScalabilitySolution = async (e) => {
    e.preventDefault();
    try {
      // In a real app, we would call the API
      // await api.implementScalabilitySolution({
      //   ...scalabilitySolution,
      //   signature: currentUser.id, // In a real app, this would be a digital signature
      // });

      setSnackbar({
        open: true,
        message: 'Scalability solution implemented successfully',
        severity: 'success',
      });

      // Reset form
      setScalabilitySolution({
        solutionType: 'Layer2Rollup',
        configuration: '',
        approvedBy: '',
      });
    } catch (error) {
      console.error('Error implementing scalability solution:', error);
      setSnackbar({
        open: true,
        message: 'Error implementing scalability solution: ' + error.message,
        severity: 'error',
      });
    }
  };

  const handleUpdateEncryptionMethod = async (e) => {
    e.preventDefault();
    try {
      // In a real app, we would call the API
      // await api.updateEncryptionMethod({
      //   ...encryptionMethod,
      //   signature: currentUser.id, // In a real app, this would be a digital signature
      // });

      setSnackbar({
        open: true,
        message: 'Encryption method updated successfully',
        severity: 'success',
      });

      // Reset form
      setEncryptionMethod({
        oldMethod: 'AES256',
        newMethod: 'PostQuantumNTRU',
        affectedRecords: [],
        approvedBy: '',
      });
    } catch (error) {
      console.error('Error updating encryption method:', error);
      setSnackbar({
        open: true,
        message: 'Error updating encryption method: ' + error.message,
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
        <Typography component="h1" variant="h4" color="primary" gutterBottom>
          Technical Improvements
        </Typography>
        <Typography variant="body1" paragraph>
          Enhance the blockchain infrastructure with advanced scalability solutions, consensus mechanisms, and encryption options.
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="technical improvements tabs">
            <Tab label="Scalability Solutions" icon={<Speed />} iconPosition="start" {...a11yProps(0)} />
            <Tab label="Consensus Mechanisms" icon={<SettingsEthernet />} iconPosition="start" {...a11yProps(1)} />
            <Tab label="Advanced Encryption" icon={<Security />} iconPosition="start" {...a11yProps(2)} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Speed sx={{ mr: 1 }} /> Implement Scalability Solution
                  </Typography>
                  <form onSubmit={handleImplementScalabilitySolution}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel id="scalability-solution-label">Solution Type</InputLabel>
                          <Select
                            labelId="scalability-solution-label"
                            name="solutionType"
                            value={scalabilitySolution.solutionType}
                            label="Solution Type"
                            onChange={handleScalabilitySolutionChange}
                          >
                            <MenuItem value="Layer2Rollup">Layer 2 Rollup</MenuItem>
                            <MenuItem value="Sharding">Sharding</MenuItem>
                            <MenuItem value="BatchProcessing">Batch Processing</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          multiline
                          rows={4}
                          label="Configuration Details"
                          name="configuration"
                          value={scalabilitySolution.configuration}
                          onChange={handleScalabilitySolutionChange}
                          placeholder="Enter detailed configuration parameters..."
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          label="Approved By"
                          name="approvedBy"
                          value={scalabilitySolution.approvedBy}
                          onChange={handleScalabilitySolutionChange}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          startIcon={<Speed />}
                        >
                          Implement Solution
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Scalability Solutions Overview
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <Layers />
                      </ListItemIcon>
                      <ListItemText
                        primary="Layer 2 Rollups"
                        secondary="Offloads transaction processing from the main blockchain to increase throughput while maintaining security. Ideal for high-volume healthcare data."
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Storage />
                      </ListItemIcon>
                      <ListItemText
                        primary="Sharding"
                        secondary="Partitions the blockchain database to distribute load across multiple nodes. Enables horizontal scaling for large healthcare networks."
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Cached />
                      </ListItemIcon>
                      <ListItemText
                        primary="Batch Processing"
                        secondary="Groups multiple transactions into a single batch for more efficient processing. Reduces overhead and increases throughput."
                      />
                    </ListItem>
                  </List>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Current System Status
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      Transactions per second:
                    </Typography>
                    <Chip label="1,500" color="primary" size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      Active solution:
                    </Typography>
                    <Chip label="Layer 2 Rollup" color="success" size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      Last updated:
                    </Typography>
                    <Typography variant="body2">
                      April 15, 2025
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <SettingsEthernet sx={{ mr: 1 }} /> Update Consensus Method
                  </Typography>
                  <form onSubmit={handleUpdateConsensusMethod}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel id="old-consensus-label">Current Method</InputLabel>
                          <Select
                            labelId="old-consensus-label"
                            name="oldMethod"
                            value={consensusMethod.oldMethod}
                            label="Current Method"
                            onChange={handleConsensusMethodChange}
                          >
                            <MenuItem value="ProofOfWork">Proof of Work</MenuItem>
                            <MenuItem value="ProofOfAuthority">Proof of Authority</MenuItem>
                            <MenuItem value="PracticalByzantineFaultTolerance">PBFT</MenuItem>
                            <MenuItem value="DelegatedProofOfStake">Delegated Proof of Stake</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel id="new-consensus-label">New Method</InputLabel>
                          <Select
                            labelId="new-consensus-label"
                            name="newMethod"
                            value={consensusMethod.newMethod}
                            label="New Method"
                            onChange={handleConsensusMethodChange}
                          >
                            <MenuItem value="ProofOfWork">Proof of Work</MenuItem>
                            <MenuItem value="ProofOfAuthority">Proof of Authority</MenuItem>
                            <MenuItem value="PracticalByzantineFaultTolerance">PBFT</MenuItem>
                            <MenuItem value="DelegatedProofOfStake">Delegated Proof of Stake</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          multiline
                          rows={3}
                          label="Reason for Change"
                          name="reason"
                          value={consensusMethod.reason}
                          onChange={handleConsensusMethodChange}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          label="Approved By"
                          name="approvedBy"
                          value={consensusMethod.approvedBy}
                          onChange={handleConsensusMethodChange}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          startIcon={<SettingsEthernet />}
                        >
                          Update Consensus Method
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Consensus Mechanisms Comparison
                  </Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Mechanism</TableCell>
                          <TableCell>Energy Usage</TableCell>
                          <TableCell>Throughput</TableCell>
                          <TableCell>Security</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>Proof of Work</TableCell>
                          <TableCell>High</TableCell>
                          <TableCell>Low</TableCell>
                          <TableCell>Very High</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Proof of Authority</TableCell>
                          <TableCell>Very Low</TableCell>
                          <TableCell>High</TableCell>
                          <TableCell>High*</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>PBFT</TableCell>
                          <TableCell>Low</TableCell>
                          <TableCell>Medium</TableCell>
                          <TableCell>High</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Delegated PoS</TableCell>
                          <TableCell>Low</TableCell>
                          <TableCell>High</TableCell>
                          <TableCell>Medium</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                    * Depends on trusted validators in permissioned networks
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Current System Status
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      Active consensus:
                    </Typography>
                    <Chip label="Proof of Authority" color="primary" size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      Validator nodes:
                    </Typography>
                    <Typography variant="body2">
                      5 healthcare organizations
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Security sx={{ mr: 1 }} /> Update Encryption Method
                  </Typography>
                  <form onSubmit={handleUpdateEncryptionMethod}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel id="old-encryption-label">Current Method</InputLabel>
                          <Select
                            labelId="old-encryption-label"
                            name="oldMethod"
                            value={encryptionMethod.oldMethod}
                            label="Current Method"
                            onChange={handleEncryptionMethodChange}
                          >
                            <MenuItem value="AES256">AES-256</MenuItem>
                            <MenuItem value="RSA">RSA</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel id="new-encryption-label">New Method</InputLabel>
                          <Select
                            labelId="new-encryption-label"
                            name="newMethod"
                            value={encryptionMethod.newMethod}
                            label="New Method"
                            onChange={handleEncryptionMethodChange}
                          >
                            <MenuItem value="PostQuantumNTRU">Post-Quantum NTRU</MenuItem>
                            <MenuItem value="PostQuantumLattice">Post-Quantum Lattice</MenuItem>
                            <MenuItem value="HomomorphicEncryption">Homomorphic Encryption</MenuItem>
                            <MenuItem value="ZeroKnowledgeProof">Zero-Knowledge Proof</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Affected Records (comma-separated IDs)"
                          name="affectedRecords"
                          value={encryptionMethod.affectedRecords.join(',')}
                          onChange={(e) => setEncryptionMethod({
                            ...encryptionMethod,
                            affectedRecords: e.target.value ? e.target.value.split(',') : [],
                          })}
                          placeholder="Leave empty to apply to all new records"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          label="Approved By"
                          name="approvedBy"
                          value={encryptionMethod.approvedBy}
                          onChange={handleEncryptionMethodChange}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          startIcon={<Security />}
                        >
                          Update Encryption Method
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Advanced Encryption Options
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <Lock color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Post-Quantum Cryptography"
                        secondary="Resistant to attacks from quantum computers. Includes NTRU and lattice-based algorithms for future-proof security."
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Lock color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Homomorphic Encryption"
                        secondary="Allows computation on encrypted data without decryption. Enables privacy-preserving analytics on sensitive health data."
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Lock color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Zero-Knowledge Proofs"
                        secondary="Verifies information without revealing the underlying data. Useful for consent verification and compliance checks."
                      />
                    </ListItem>
                  </List>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Current System Status
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      Primary encryption:
                    </Typography>
                    <Chip label="AES-256" color="primary" size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      Quantum-resistant:
                    </Typography>
                    <Chip label="In Progress" color="warning" size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      Key rotation:
                    </Typography>
                    <Typography variant="body2">
                      Every 90 days
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TechnicalImprovements;
