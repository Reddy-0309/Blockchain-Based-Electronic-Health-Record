import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  CircularProgress,
  Button,
  Alert,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

// Icons
import { 
  MedicalServices as MedicalIcon,
  LocalHospital as HospitalIcon,
  Science as ScienceIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  Security as SecurityIcon,
  Event as EventIcon,
} from '@mui/icons-material';

// Chart.js components
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function Dashboard() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [blockchainInfo, setBlockchainInfo] = useState(null);
  const [accessLogs, setAccessLogs] = useState([]);
  const [accessControls, setAccessControls] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, these would be actual API calls
        // For demo purposes, we're using mock data
        const recordsResponse = api.mockGetPatientRecords(currentUser.id);
        const blockchainResponse = api.mockGetBlockchainInfo();
        const accessControlsResponse = api.mockGetAccessControls(currentUser.id);
        
        setRecords(recordsResponse.data);
        setBlockchainInfo(blockchainResponse.data);
        setAccessControls(accessControlsResponse.data);
        
        // Mock access logs for patient view
        if (currentUser.userType === 'patient') {
          setAccessLogs([
            { provider_id: 'doc_123', provider_name: 'Dr. Smith', timestamp: new Date(Date.now() - 3600000), record_type: 'Diagnosis' },
            { provider_id: 'doc_456', provider_name: 'Dr. Johnson', timestamp: new Date(Date.now() - 86400000), record_type: 'Medication' },
            { provider_id: 'doc_123', provider_name: 'Dr. Smith', timestamp: new Date(Date.now() - 259200000), record_type: 'LabResult' },
          ]);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser.id, currentUser.userType]);

  // Prepare data for record type chart
  const recordTypeData = {
    labels: ['Diagnosis', 'Medication', 'Lab Result'],
    datasets: [
      {
        data: [1, 1, 1], // Count of each record type
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      },
    ],
  };

  // Prepare data for recent activity
  const recentActivityData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Records Created',
        data: [2, 1, 3, 0, 1, 0, 2],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
      {
        label: 'Records Accessed',
        data: [3, 2, 4, 1, 2, 1, 3],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };
  
  // Prepare data for patient access activity
  const patientAccessData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Records Accessed',
        data: [1, 0, 2, 0, 1, 0, 1],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Render provider (doctor) dashboard
  if (currentUser.userType === 'provider') {
    return (
      <Container>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        
        {error && (
          <Paper sx={{ p: 2, mb: 2, bgcolor: '#fff9c4' }}>
            <Typography color="error">{error}</Typography>
          </Paper>
        )}
        
        <Grid container spacing={3}>
          {/* User Info Card */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Welcome, {currentUser.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                User Type: Healthcare Provider
              </Typography>
              <Typography variant="body2" paragraph>
                You are logged in as {currentUser.email}
              </Typography>
              
              {blockchainInfo && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Blockchain Status
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Paper elevation={1} sx={{ p: 1, textAlign: 'center' }}>
                        <Typography variant="h6">{blockchainInfo.chain_length}</Typography>
                        <Typography variant="body2">Blocks</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={4}>
                      <Paper elevation={1} sx={{ p: 1, textAlign: 'center', bgcolor: blockchainInfo.is_valid ? '#e8f5e9' : '#ffebee' }}>
                        <Typography variant="h6">{blockchainInfo.is_valid ? 'Valid' : 'Invalid'}</Typography>
                        <Typography variant="body2">Chain Status</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={4}>
                      <Paper elevation={1} sx={{ p: 1, textAlign: 'center' }}>
                        <Typography variant="h6">{blockchainInfo.pending_transactions}</Typography>
                        <Typography variant="body2">Pending Tx</Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Paper>
          </Grid>
          
          {/* Record Type Distribution */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Record Type Distribution
              </Typography>
              <Box sx={{ height: 250, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Pie data={recordTypeData} options={{ maintainAspectRatio: false }} />
              </Box>
            </Paper>
          </Grid>
          
          {/* Recent Records */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Recent Health Records
              </Typography>
              {records.length > 0 ? (
                <List>
                  {records.map((record, index) => (
                    <React.Fragment key={record.record_id}>
                      {index > 0 && <Divider />}
                      <ListItem>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle1">{record.record_type}</Typography>
                              <Chip 
                                size="small" 
                                label={new Date(record.timestamp).toLocaleDateString()} 
                                color="primary" 
                                variant="outlined" 
                              />
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" component="span">
                                Provider: {record.provider_id}
                              </Typography>
                              <br />
                              <Typography variant="body2" component="span" color="text.secondary">
                                {Object.entries(record.metadata).map(([key, value]) => `${key}: ${value}`).join(', ')}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No records found.
                </Typography>
              )}
            </Paper>
          </Grid>
          
          {/* Activity Chart */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Weekly Activity
              </Typography>
              <Box sx={{ height: 250 }}>
                <Bar 
                  data={recentActivityData} 
                  options={{
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1
                        }
                      }
                    }
                  }} 
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    );
  }
  
  // Render patient dashboard
  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      {error && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: '#fff9c4' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}
      
      <Grid container spacing={3}>
        {/* User Info Card */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Welcome, {currentUser.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              User Type: Patient
            </Typography>
            <Typography variant="body2" paragraph>
              You are logged in as {currentUser.email}
            </Typography>
            
            {blockchainInfo && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Blockchain Status
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Paper elevation={1} sx={{ p: 1, textAlign: 'center' }}>
                      <Typography variant="h6">{blockchainInfo.chain_length}</Typography>
                      <Typography variant="body2">Blocks</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper elevation={1} sx={{ p: 1, textAlign: 'center', bgcolor: blockchainInfo.is_valid ? '#e8f5e9' : '#ffebee' }}>
                      <Typography variant="h6">{blockchainInfo.is_valid ? 'Valid' : 'Invalid'}</Typography>
                      <Typography variant="body2">Chain Status</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper elevation={1} sx={{ p: 1, textAlign: 'center' }}>
                      <Typography variant="h6">{blockchainInfo.pending_transactions}</Typography>
                      <Typography variant="body2">Pending Tx</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* My Health Summary */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              My Health Summary
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Alert severity="info" sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                  <Typography variant="body2">You have {records.length} health records secured on the blockchain</Typography>
                  <Button size="small" variant="outlined">View All</Button>
                </Box>
              </Alert>
              <Alert severity="success" sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Your data is encrypted with {blockchainInfo?.is_valid ? 'verified' : 'unverified'} blockchain protection</Typography>
                </Box>
              </Alert>
              <Alert severity="warning" sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                  <Typography variant="body2">{accessControls.length} healthcare providers have access to your records</Typography>
                  <Button size="small" variant="outlined">Manage</Button>
                </Box>
              </Alert>
            </Box>
          </Paper>
        </Grid>
        
        {/* Recent Records */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              My Health Timeline
            </Typography>
            {records.length > 0 ? (
              <Timeline position="alternate">
                {records.map((record) => (
                  <TimelineItem key={record.record_id}>
                    <TimelineOppositeContent color="text.secondary">
                      {new Date(record.timestamp).toLocaleDateString()}
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot color={
                        record.record_type === 'Diagnosis' ? 'error' : 
                        record.record_type === 'Medication' ? 'primary' : 'success'
                      }>
                        {record.record_type === 'Diagnosis' ? <MedicalIcon /> : 
                         record.record_type === 'Medication' ? <HospitalIcon /> : <ScienceIcon />}
                      </TimelineDot>
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent>
                      <Paper elevation={3} sx={{ p: 2 }}>
                        <Typography variant="h6" component="span">
                          {record.record_type}
                        </Typography>
                        <Typography>
                          {Object.entries(record.metadata).map(([key, value]) => `${key}: ${value}`).join(', ')}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Provider: {record.provider_id}
                        </Typography>
                      </Paper>
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No records found.
              </Typography>
            )}
          </Paper>
        </Grid>
        
        {/* Record Access Log */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Record Access
            </Typography>
            {accessLogs.length > 0 ? (
              <List>
                {accessLogs.map((log, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <Divider />}
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1">{log.provider_name}</Typography>
                            <Chip 
                              size="small" 
                              icon={<VisibilityIcon />}
                              label={log.timestamp.toLocaleDateString() + ' ' + log.timestamp.toLocaleTimeString()} 
                              color="secondary" 
                              variant="outlined" 
                            />
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" component="span" color="text.secondary">
                            Accessed your {log.record_type} record
                          </Typography>
                        }
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No recent access logs.
              </Typography>
            )}
          </Paper>
        </Grid>
        
        {/* Access Control Summary */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Current Access Permissions
            </Typography>
            {accessControls.length > 0 ? (
              <Grid container spacing={2}>
                {accessControls.map((control, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonIcon color="primary" />
                            <Typography variant="h6">{control.provider_id}</Typography>
                          </Box>
                          <Chip 
                            label={control.access_level} 
                            color={control.access_level === 'Provider' ? 'primary' : 'secondary'}
                            icon={<SecurityIcon />}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <EventIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                          Granted: {new Date(control.granted_at).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <EventIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                          Expires: {new Date(control.expires_at).toLocaleDateString()}
                        </Typography>
                        {control.specific_record_types && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" gutterBottom>Access limited to:</Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              {control.specific_record_types.map((type, i) => (
                                <Chip key={i} label={type} size="small" />
                              ))}
                            </Box>
                          </Box>
                        )}
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                          <Button size="small" variant="outlined" color="error">Revoke Access</Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No access permissions set.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;
