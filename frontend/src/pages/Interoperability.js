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
} from '@mui/material';
import { CloudUpload, CloudDownload, Sync } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`interop-tabpanel-${index}`}
      aria-labelledby={`interop-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `interop-tab-${index}`,
    'aria-controls': `interop-tabpanel-${index}`,
  };
}

const Interoperability = () => {
  const { currentUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [importData, setImportData] = useState({
    patientId: '',
    sourceSystem: '',
    recordType: 'FHIRResource',
    data: '',
  });
  const [exportData, setExportData] = useState({
    recordId: '',
    destinationSystem: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleImportChange = (e) => {
    const { name, value } = e.target;
    setImportData({ ...importData, [name]: value });
  };

  const handleExportChange = (e) => {
    const { name, value } = e.target;
    setExportData({ ...exportData, [name]: value });
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    try {
      // In a real app, we would call the API
      // await api.importExternalRecord({
      //   ...importData,
      //   signature: currentUser.id, // In a real app, this would be a digital signature
      // });

      // For demo purposes, we'll just show a success message
      setSnackbar({
        open: true,
        message: 'External record imported successfully',
        severity: 'success',
      });

      // Reset form
      setImportData({
        patientId: '',
        sourceSystem: '',
        recordType: 'FHIRResource',
        data: '',
      });
    } catch (error) {
      console.error('Error importing record:', error);
      setSnackbar({
        open: true,
        message: 'Error importing record: ' + error.message,
        severity: 'error',
      });
    }
  };

  const handleExportSubmit = async (e) => {
    e.preventDefault();
    try {
      // In a real app, we would call the API
      // await api.exportRecord({
      //   ...exportData,
      //   signature: currentUser.id, // In a real app, this would be a digital signature
      // });

      // For demo purposes, we'll just show a success message
      setSnackbar({
        open: true,
        message: 'Record exported successfully',
        severity: 'success',
      });

      // Reset form
      setExportData({
        recordId: '',
        destinationSystem: '',
      });
    } catch (error) {
      console.error('Error exporting record:', error);
      setSnackbar({
        open: true,
        message: 'Error exporting record: ' + error.message,
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
          Interoperability
        </Typography>
        <Typography variant="body1" paragraph>
          Import and export health records using standard formats like FHIR and HL7 for seamless data exchange between healthcare systems.
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="interoperability tabs">
            <Tab label="Import External Records" icon={<CloudUpload />} iconPosition="start" {...a11yProps(0)} />
            <Tab label="Export Records" icon={<CloudDownload />} iconPosition="start" {...a11yProps(1)} />
            <Tab label="Connected Systems" icon={<Sync />} iconPosition="start" {...a11yProps(2)} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <form onSubmit={handleImportSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  label="Patient ID"
                  name="patientId"
                  value={importData.patientId}
                  onChange={handleImportChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  label="Source System"
                  name="sourceSystem"
                  placeholder="e.g., Epic, Cerner, Allscripts"
                  value={importData.sourceSystem}
                  onChange={handleImportChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="record-type-label">Record Type</InputLabel>
                  <Select
                    labelId="record-type-label"
                    name="recordType"
                    value={importData.recordType}
                    label="Record Type"
                    onChange={handleImportChange}
                  >
                    <MenuItem value="FHIRResource">FHIR Resource</MenuItem>
                    <MenuItem value="HL7Message">HL7 Message</MenuItem>
                    <MenuItem value="CDA">Clinical Document Architecture (CDA)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  multiline
                  rows={8}
                  label="Record Data (JSON or XML)"
                  name="data"
                  value={importData.data}
                  onChange={handleImportChange}
                  placeholder="Paste FHIR JSON, HL7 message, or other structured data here"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<CloudUpload />}
                >
                  Import Record
                </Button>
              </Grid>
            </Grid>
          </form>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <form onSubmit={handleExportSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  label="Record ID"
                  name="recordId"
                  value={exportData.recordId}
                  onChange={handleExportChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  label="Destination System"
                  name="destinationSystem"
                  placeholder="e.g., Epic, Cerner, Allscripts"
                  value={exportData.destinationSystem}
                  onChange={handleExportChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<CloudDownload />}
                >
                  Export Record
                </Button>
              </Grid>
            </Grid>
          </form>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Connected Healthcare Systems
              </Typography>
            </Grid>
            {[
              { name: 'Epic Systems', status: 'Connected', lastSync: '2025-04-17 14:30' },
              { name: 'Cerner', status: 'Connected', lastSync: '2025-04-18 09:15' },
              { name: 'Allscripts', status: 'Disconnected', lastSync: '2025-04-10 11:45' },
              { name: 'Meditech', status: 'Pending', lastSync: 'Never' },
            ].map((system, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" component="div">
                      {system.name}
                    </Typography>
                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                      Status: <span style={{ color: system.status === 'Connected' ? 'green' : system.status === 'Pending' ? 'orange' : 'red' }}>{system.status}</span>
                    </Typography>
                    <Typography variant="body2">
                      Last Synchronized: {system.lastSync}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        disabled={system.status === 'Connected'}
                      >
                        {system.status === 'Connected' ? 'Connected' : 'Connect'}
                      </Button>
                      {system.status === 'Connected' && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          sx={{ ml: 1 }}
                        >
                          Sync Now
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
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

export default Interoperability;
