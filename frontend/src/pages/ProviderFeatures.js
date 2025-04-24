import React, { useState, useEffect } from 'react';
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
  Avatar,
  Chip,
} from '@mui/material';
import {
  MedicalServices,
  LocalPharmacy,
  People,
  Assignment,
  VerifiedUser,
  Today,
  AccessTime,
  Person,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`provider-tabpanel-${index}`}
      aria-labelledby={`provider-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `provider-tab-${index}`,
    'aria-controls': `provider-tabpanel-${index}`,
  };
}

const ProviderFeatures = () => {
  const { currentUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [prescriptionData, setPrescriptionData] = useState({
    patientId: '',
    medicationDetails: '',
    dosage: '',
    duration: '',
  });
  const [collaborativeNoteData, setCollaborativeNoteData] = useState({
    patientId: '',
    collaborators: [],
    content: '',
  });
  const [selectedCollaborator, setSelectedCollaborator] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Mock data for demonstration
  const mockPatients = [
    { id: 'patient_001', name: 'John Doe', age: 45, gender: 'Male' },
    { id: 'patient_002', name: 'Jane Smith', age: 32, gender: 'Female' },
    { id: 'patient_003', name: 'Robert Johnson', age: 58, gender: 'Male' },
    { id: 'patient_004', name: 'Emily Davis', age: 27, gender: 'Female' },
  ];

  const mockProviders = [
    { id: 'provider_001', name: 'Dr. Sarah Wilson', specialty: 'Cardiology' },
    { id: 'provider_002', name: 'Dr. Michael Brown', specialty: 'Neurology' },
    { id: 'provider_003', name: 'Dr. Lisa Garcia', specialty: 'Endocrinology' },
    { id: 'provider_004', name: 'Dr. James Taylor', specialty: 'Oncology' },
  ];

  const mockPrescriptions = [
    {
      id: 'rx_001',
      patientId: 'patient_001',
      patientName: 'John Doe',
      medication: 'Lisinopril',
      dosage: '10mg',
      duration: '30 days',
      date: '2025-04-15',
      status: 'Active',
    },
    {
      id: 'rx_002',
      patientId: 'patient_002',
      patientName: 'Jane Smith',
      medication: 'Metformin',
      dosage: '500mg',
      duration: '90 days',
      date: '2025-04-10',
      status: 'Active',
    },
    {
      id: 'rx_003',
      patientId: 'patient_003',
      patientName: 'Robert Johnson',
      medication: 'Atorvastatin',
      dosage: '20mg',
      duration: '60 days',
      date: '2025-03-28',
      status: 'Active',
    },
  ];

  const mockCollaborativeNotes = [
    {
      id: 'note_001',
      patientId: 'patient_001',
      patientName: 'John Doe',
      primaryProvider: 'Dr. Sarah Wilson',
      collaborators: ['Dr. Michael Brown', 'Dr. Lisa Garcia'],
      date: '2025-04-16',
      summary: 'Cardiovascular and endocrine consultation for diabetes management',
    },
    {
      id: 'note_002',
      patientId: 'patient_004',
      patientName: 'Emily Davis',
      primaryProvider: 'Dr. James Taylor',
      collaborators: ['Dr. Sarah Wilson'],
      date: '2025-04-12',
      summary: 'Oncology follow-up with cardiology consultation',
    },
  ];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handlePrescriptionChange = (e) => {
    const { name, value } = e.target;
    setPrescriptionData({ ...prescriptionData, [name]: value });
  };

  const handleCollaborativeNoteChange = (e) => {
    const { name, value } = e.target;
    setCollaborativeNoteData({ ...collaborativeNoteData, [name]: value });
  };

  const handleAddCollaborator = () => {
    if (selectedCollaborator && !collaborativeNoteData.collaborators.includes(selectedCollaborator)) {
      setCollaborativeNoteData({
        ...collaborativeNoteData,
        collaborators: [...collaborativeNoteData.collaborators, selectedCollaborator],
      });
      setSelectedCollaborator('');
    }
  };

  const handleRemoveCollaborator = (collaborator) => {
    setCollaborativeNoteData({
      ...collaborativeNoteData,
      collaborators: collaborativeNoteData.collaborators.filter((c) => c !== collaborator),
    });
  };

  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    try {
      // In a real app, we would call the API
      // await api.createPrescription({
      //   ...prescriptionData,
      //   provider_id: currentUser.id,
      //   signature: currentUser.id, // In a real app, this would be a digital signature
      // });

      setSnackbar({
        open: true,
        message: 'Prescription created successfully',
        severity: 'success',
      });

      // Reset form
      setPrescriptionData({
        patientId: '',
        medicationDetails: '',
        dosage: '',
        duration: '',
      });
    } catch (error) {
      console.error('Error creating prescription:', error);
      setSnackbar({
        open: true,
        message: 'Error creating prescription: ' + error.message,
        severity: 'error',
      });
    }
  };

  const handleCollaborativeNoteSubmit = async (e) => {
    e.preventDefault();
    try {
      // In a real app, we would call the API
      // await api.createCollaborativeNote({
      //   ...collaborativeNoteData,
      //   provider_id: currentUser.id,
      //   signature: currentUser.id, // In a real app, this would be a digital signature
      // });

      setSnackbar({
        open: true,
        message: 'Collaborative care note created successfully',
        severity: 'success',
      });

      // Reset form
      setCollaborativeNoteData({
        patientId: '',
        collaborators: [],
        content: '',
      });
    } catch (error) {
      console.error('Error creating collaborative note:', error);
      setSnackbar({
        open: true,
        message: 'Error creating collaborative note: ' + error.message,
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
          Healthcare Provider Features
        </Typography>
        <Typography variant="body1" paragraph>
          Manage prescriptions, create collaborative care notes, and coordinate patient care with blockchain-verified security.
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="provider features tabs">
            <Tab label="E-Prescriptions" icon={<LocalPharmacy />} iconPosition="start" {...a11yProps(0)} />
            <Tab label="Collaborative Care" icon={<People />} iconPosition="start" {...a11yProps(1)} />
            <Tab label="Clinical Decision Support" icon={<MedicalServices />} iconPosition="start" {...a11yProps(2)} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Create E-Prescription
              </Typography>
              <form onSubmit={handlePrescriptionSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel id="patient-select-label">Patient</InputLabel>
                      <Select
                        labelId="patient-select-label"
                        name="patientId"
                        value={prescriptionData.patientId}
                        label="Patient"
                        onChange={handlePrescriptionChange}
                        required
                      >
                        {mockPatients.map((patient) => (
                          <MenuItem key={patient.id} value={patient.id}>
                            {patient.name} ({patient.age}, {patient.gender})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Medication Details"
                      name="medicationDetails"
                      value={prescriptionData.medicationDetails}
                      onChange={handlePrescriptionChange}
                      placeholder="e.g., Lisinopril 10mg tablets"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Dosage"
                      name="dosage"
                      value={prescriptionData.dosage}
                      onChange={handlePrescriptionChange}
                      placeholder="e.g., 1 tablet daily"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Duration"
                      name="duration"
                      value={prescriptionData.duration}
                      onChange={handlePrescriptionChange}
                      placeholder="e.g., 30 days"
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={<LocalPharmacy />}
                    >
                      Create Prescription
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Recent Prescriptions
              </Typography>
              <List>
                {mockPrescriptions.map((prescription) => (
                  <Card key={prescription.id} variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Typography variant="h6">
                            {prescription.medication} {prescription.dosage}
                          </Typography>
                          <Chip
                            label={prescription.status}
                            color="primary"
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            <Person fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                            Patient: {prescription.patientName}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            <Today fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                            Date: {prescription.date}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2">
                            <AccessTime fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                            Duration: {prescription.duration}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2">
                            <VerifiedUser fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                            Blockchain Verified
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </List>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Create Collaborative Care Note
              </Typography>
              <form onSubmit={handleCollaborativeNoteSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel id="collab-patient-select-label">Patient</InputLabel>
                      <Select
                        labelId="collab-patient-select-label"
                        name="patientId"
                        value={collaborativeNoteData.patientId}
                        label="Patient"
                        onChange={handleCollaborativeNoteChange}
                        required
                      >
                        {mockPatients.map((patient) => (
                          <MenuItem key={patient.id} value={patient.id}>
                            {patient.name} ({patient.age}, {patient.gender})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Add Collaborators
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={9}>
                        <FormControl fullWidth>
                          <InputLabel id="collaborator-select-label">Select Provider</InputLabel>
                          <Select
                            labelId="collaborator-select-label"
                            value={selectedCollaborator}
                            label="Select Provider"
                            onChange={(e) => setSelectedCollaborator(e.target.value)}
                          >
                            {mockProviders.map((provider) => (
                              <MenuItem key={provider.id} value={provider.name}>
                                {provider.name} ({provider.specialty})
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={3}>
                        <Button
                          variant="outlined"
                          onClick={handleAddCollaborator}
                          disabled={!selectedCollaborator}
                          sx={{ height: '100%' }}
                        >
                          Add
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ mt: 1, mb: 2 }}>
                      {collaborativeNoteData.collaborators.map((collaborator) => (
                        <Chip
                          key={collaborator}
                          label={collaborator}
                          onDelete={() => handleRemoveCollaborator(collaborator)}
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={6}
                      label="Note Content"
                      name="content"
                      value={collaborativeNoteData.content}
                      onChange={handleCollaborativeNoteChange}
                      placeholder="Enter detailed clinical notes here..."
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={<Assignment />}
                    >
                      Create Collaborative Note
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Recent Collaborative Notes
              </Typography>
              <List>
                {mockCollaborativeNotes.map((note) => (
                  <Card key={note.id} variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Typography variant="h6">
                            {note.patientName}
                          </Typography>
                          <Typography variant="subtitle2" color="text.secondary">
                            Primary: {note.primaryProvider}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2">
                            <Today fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                            Date: {note.date}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2" gutterBottom>
                            <People fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                            Collaborators:
                          </Typography>
                          <Box sx={{ ml: 3 }}>
                            {note.collaborators.map((collaborator, index) => (
                              <Chip
                                key={index}
                                label={collaborator}
                                size="small"
                                sx={{ mr: 1, mb: 1 }}
                              />
                            ))}
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body1">
                            {note.summary}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2">
                            <VerifiedUser fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                            Blockchain Verified
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </List>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Clinical Decision Support
              </Typography>
              <Typography variant="body2" paragraph>
                AI-powered clinical decision support with blockchain-verified data integrity and transparency.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Feature Coming Soon
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Our clinical decision support system is currently under development. This feature will provide:
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <VerifiedUser />
                      </ListItemIcon>
                      <ListItemText primary="Evidence-based treatment recommendations" secondary="Using blockchain-verified medical data" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <MedicalServices />
                      </ListItemIcon>
                      <ListItemText primary="Medication interaction alerts" secondary="Real-time checking of potential drug interactions" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Assignment />
                      </ListItemIcon>
                      <ListItemText primary="Clinical pathway guidance" secondary="Step-by-step protocols for specific conditions" />
                    </ListItem>
                  </List>
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

export default ProviderFeatures;
