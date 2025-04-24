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
  VerifiedUser,
  Policy,
  Security,
  Gavel,
  CheckCircle,
  Error,
  Info,
  Assignment,
  Person,
  CalendarToday,
  Description,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`compliance-tabpanel-${index}`}
      aria-labelledby={`compliance-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `compliance-tab-${index}`,
    'aria-controls': `compliance-tabpanel-${index}`,
  };
}

const ComplianceGovernance = () => {
  const { currentUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [complianceAudit, setComplianceAudit] = useState({
    standard: 'HIPAA',
    auditor: '',
    findings: '',
  });
  const [governancePolicy, setGovernancePolicy] = useState({
    policyType: 'Data Access',
    policyContent: '',
    approvedBy: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Mock data for demonstration
  const mockComplianceAudits = [
    { id: 'audit-001', standard: 'HIPAA', date: '2025-04-10', auditor: 'John Smith', status: 'Compliant', findings: 'No issues found' },
    { id: 'audit-002', standard: 'GDPR', date: '2025-03-15', auditor: 'Emma Johnson', status: 'Compliant', findings: 'Minor documentation updates required' },
    { id: 'audit-003', standard: 'HITECH', date: '2025-02-22', auditor: 'David Wilson', status: 'Non-Compliant', findings: 'Security vulnerability in access control' },
    { id: 'audit-004', standard: 'ISO27001', date: '2025-01-30', auditor: 'Sarah Davis', status: 'Compliant', findings: 'Recommendations for improved documentation' },
  ];

  const mockPolicies = [
    { id: 'policy-001', type: 'Data Access', date: '2025-04-01', approvedBy: 'Board of Directors', version: '2.1', status: 'Active' },
    { id: 'policy-002', type: 'Data Retention', date: '2025-03-10', approvedBy: 'Compliance Committee', version: '1.3', status: 'Active' },
    { id: 'policy-003', type: 'Patient Consent', date: '2025-02-15', approvedBy: 'Ethics Committee', version: '3.0', status: 'Active' },
    { id: 'policy-004', type: 'Security Protocol', date: '2025-01-20', approvedBy: 'Security Officer', version: '2.5', status: 'Active' },
  ];

  const mockComplianceMetrics = {
    hipaaCompliance: 98,
    gdprCompliance: 95,
    hitechCompliance: 92,
    iso27001Compliance: 94,
    auditHistory: [
      { month: 'Jan', hipaa: 90, gdpr: 88, hitech: 85, iso: 89 },
      { month: 'Feb', hipaa: 92, gdpr: 90, hitech: 87, iso: 90 },
      { month: 'Mar', hipaa: 95, gdpr: 92, hitech: 90, iso: 92 },
      { month: 'Apr', hipaa: 98, gdpr: 95, hitech: 92, iso: 94 },
    ],
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleComplianceAuditChange = (e) => {
    const { name, value } = e.target;
    setComplianceAudit({ ...complianceAudit, [name]: value });
  };

  const handleGovernancePolicyChange = (e) => {
    const { name, value } = e.target;
    setGovernancePolicy({ ...governancePolicy, [name]: value });
  };

  const handleRecordComplianceAudit = async (e) => {
    e.preventDefault();
    try {
      // In a real app, we would call the API
      // await api.recordComplianceAudit({
      //   ...complianceAudit,
      //   signature: currentUser.id, // In a real app, this would be a digital signature
      // });

      setSnackbar({
        open: true,
        message: 'Compliance audit recorded successfully',
        severity: 'success',
      });

      // Reset form
      setComplianceAudit({
        standard: 'HIPAA',
        auditor: '',
        findings: '',
      });
    } catch (error) {
      console.error('Error recording compliance audit:', error);
      setSnackbar({
        open: true,
        message: 'Error recording compliance audit: ' + error.message,
        severity: 'error',
      });
    }
  };

  const handleUpdateGovernancePolicy = async (e) => {
    e.preventDefault();
    try {
      // In a real app, we would call the API
      // await api.updateGovernancePolicy({
      //   ...governancePolicy,
      //   signature: currentUser.id, // In a real app, this would be a digital signature
      // });

      setSnackbar({
        open: true,
        message: 'Governance policy updated successfully',
        severity: 'success',
      });

      // Reset form
      setGovernancePolicy({
        policyType: 'Data Access',
        policyContent: '',
        approvedBy: '',
      });
    } catch (error) {
      console.error('Error updating governance policy:', error);
      setSnackbar({
        open: true,
        message: 'Error updating governance policy: ' + error.message,
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getComplianceStatusColor = (status) => {
    return status === 'Compliant' ? 'success' : 'error';
  };

  const renderComplianceMetrics = () => {
    const { hipaaCompliance, gdprCompliance, hitechCompliance, iso27001Compliance } = mockComplianceMetrics;
    
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                HIPAA
              </Typography>
              <Box sx={{ position: 'relative', display: 'inline-flex', width: '100%', justifyContent: 'center' }}>
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: `conic-gradient(#4caf50 ${hipaaCompliance}%, #f5f5f5 0)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h6">{hipaaCompliance}%</Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                GDPR
              </Typography>
              <Box sx={{ position: 'relative', display: 'inline-flex', width: '100%', justifyContent: 'center' }}>
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: `conic-gradient(#2196f3 ${gdprCompliance}%, #f5f5f5 0)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h6">{gdprCompliance}%</Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                HITECH
              </Typography>
              <Box sx={{ position: 'relative', display: 'inline-flex', width: '100%', justifyContent: 'center' }}>
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: `conic-gradient(#ff9800 ${hitechCompliance}%, #f5f5f5 0)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h6">{hitechCompliance}%</Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ISO 27001
              </Typography>
              <Box sx={{ position: 'relative', display: 'inline-flex', width: '100%', justifyContent: 'center' }}>
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: `conic-gradient(#9c27b0 ${iso27001Compliance}%, #f5f5f5 0)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h6">{iso27001Compliance}%</Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
        <Typography component="h1" variant="h4" color="primary" gutterBottom>
          Compliance & Governance
        </Typography>
        <Typography variant="body1" paragraph>
          Manage regulatory compliance, governance policies, and audit trails with blockchain-verified security and transparency.
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="compliance and governance tabs">
            <Tab label="Compliance Dashboard" icon={<VerifiedUser />} iconPosition="start" {...a11yProps(0)} />
            <Tab label="Compliance Audits" icon={<Gavel />} iconPosition="start" {...a11yProps(1)} />
            <Tab label="Governance Policies" icon={<Policy />} iconPosition="start" {...a11yProps(2)} />
            <Tab label="Audit Trails" icon={<Assignment />} iconPosition="start" {...a11yProps(3)} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Compliance Metrics
              </Typography>
              <Typography variant="body2" paragraph>
                Current compliance status across all regulatory standards with blockchain verification.
              </Typography>
            </Grid>
            {renderComplianceMetrics()}
            <Grid item xs={12}>
              <Card variant="outlined" sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Compliance Activities
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="HIPAA Quarterly Audit Completed" 
                        secondary="April 10, 2025 - All requirements met"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Info color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="GDPR Data Processing Agreement Updated" 
                        secondary="March 15, 2025 - Version 2.1 approved"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Error color="error" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Security Vulnerability Remediation" 
                        secondary="February 22, 2025 - Access control issue fixed"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="ISO 27001 Certification Renewed" 
                        secondary="January 30, 2025 - Valid for 3 years"
                      />
                    </ListItem>
                  </List>
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
                    <Gavel sx={{ mr: 1 }} /> Record Compliance Audit
                  </Typography>
                  <form onSubmit={handleRecordComplianceAudit}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel id="compliance-standard-label">Compliance Standard</InputLabel>
                          <Select
                            labelId="compliance-standard-label"
                            name="standard"
                            value={complianceAudit.standard}
                            label="Compliance Standard"
                            onChange={handleComplianceAuditChange}
                          >
                            <MenuItem value="HIPAA">HIPAA</MenuItem>
                            <MenuItem value="GDPR">GDPR</MenuItem>
                            <MenuItem value="HITECH">HITECH</MenuItem>
                            <MenuItem value="ISO27001">ISO 27001</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          label="Auditor Name"
                          name="auditor"
                          value={complianceAudit.auditor}
                          onChange={handleComplianceAuditChange}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          multiline
                          rows={4}
                          label="Audit Findings"
                          name="findings"
                          value={complianceAudit.findings}
                          onChange={handleComplianceAuditChange}
                          placeholder="Enter detailed audit findings and recommendations..."
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          startIcon={<Gavel />}
                        >
                          Record Audit
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Recent Compliance Audits
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Standard</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockComplianceAudits.map((audit) => (
                      <TableRow key={audit.id}>
                        <TableCell>{audit.standard}</TableCell>
                        <TableCell>{audit.date}</TableCell>
                        <TableCell>
                          <Chip 
                            label={audit.status} 
                            color={getComplianceStatusColor(audit.status)} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell>
                          <Button size="small" variant="outlined">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Policy sx={{ mr: 1 }} /> Update Governance Policy
                  </Typography>
                  <form onSubmit={handleUpdateGovernancePolicy}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel id="policy-type-label">Policy Type</InputLabel>
                          <Select
                            labelId="policy-type-label"
                            name="policyType"
                            value={governancePolicy.policyType}
                            label="Policy Type"
                            onChange={handleGovernancePolicyChange}
                          >
                            <MenuItem value="Data Access">Data Access</MenuItem>
                            <MenuItem value="Data Retention">Data Retention</MenuItem>
                            <MenuItem value="Patient Consent">Patient Consent</MenuItem>
                            <MenuItem value="Security Protocol">Security Protocol</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          multiline
                          rows={6}
                          label="Policy Content"
                          name="policyContent"
                          value={governancePolicy.policyContent}
                          onChange={handleGovernancePolicyChange}
                          placeholder="Enter detailed policy content..."
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          label="Approved By"
                          name="approvedBy"
                          value={governancePolicy.approvedBy}
                          onChange={handleGovernancePolicyChange}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          startIcon={<Policy />}
                        >
                          Update Policy
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Active Governance Policies
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Policy Type</TableCell>
                      <TableCell>Version</TableCell>
                      <TableCell>Last Updated</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockPolicies.map((policy) => (
                      <TableRow key={policy.id}>
                        <TableCell>{policy.type}</TableCell>
                        <TableCell>{policy.version}</TableCell>
                        <TableCell>{policy.date}</TableCell>
                        <TableCell>
                          <Button size="small" variant="outlined">
                            View Policy
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Blockchain Audit Trail
              </Typography>
              <Typography variant="body2" paragraph>
                Immutable record of all system activities with cryptographic verification.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Activity</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Details</TableCell>
                      <TableCell>Verification</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      { time: '2025-04-18 11:30:45', activity: 'Record Access', user: 'Dr. Sarah Wilson', details: 'Accessed patient record #12345', verification: 'Verified' },
                      { time: '2025-04-18 10:15:22', activity: 'Policy Update', user: 'Admin User', details: 'Updated Data Retention Policy v1.3', verification: 'Verified' },
                      { time: '2025-04-18 09:45:10', activity: 'Compliance Check', user: 'System', details: 'Automated HIPAA compliance check', verification: 'Verified' },
                      { time: '2025-04-17 16:20:33', activity: 'Data Export', user: 'Jane Smith', details: 'Exported records to Epic Systems', verification: 'Verified' },
                      { time: '2025-04-17 14:05:18', activity: 'Access Grant', user: 'John Doe', details: 'Granted access to Dr. Michael Brown', verification: 'Verified' },
                    ].map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell>{entry.time}</TableCell>
                        <TableCell>{entry.activity}</TableCell>
                        <TableCell>{entry.user}</TableCell>
                        <TableCell>{entry.details}</TableCell>
                        <TableCell>
                          <Chip 
                            icon={<VerifiedUser />} 
                            label={entry.verification} 
                            color="primary" 
                            size="small" 
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="outlined" startIcon={<Assignment />}>
                  Export Audit Trail
                </Button>
              </Box>
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

export default ComplianceGovernance;
