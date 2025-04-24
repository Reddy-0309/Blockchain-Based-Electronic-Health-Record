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
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  PhoneAndroid,
  DevicesOther,
  DataUsage,
  Sync,
  Bluetooth,
  Wifi,
  Watch,
  MonitorHeart,
  Home,
  MedicalServices,
  VerifiedUser,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`mobile-iot-tabpanel-${index}`}
      aria-labelledby={`mobile-iot-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `mobile-iot-tab-${index}`,
    'aria-controls': `mobile-iot-tabpanel-${index}`,
  };
}

const MobileIoTIntegration = () => {
  const { currentUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [mobileDevice, setMobileDevice] = useState({
    patientId: '',
    deviceType: 'Smartphone',
    appVersion: '1.0.0',
  });
  const [iotDevice, setIotDevice] = useState({
    patientId: '',
    deviceType: 'Wearable',
    manufacturer: '',
    model: '',
  });
  const [mobileData, setMobileData] = useState({
    patientId: '',
    deviceId: '',
    dataType: 'Vitals',
    data: '',
  });
  const [iotData, setIotData] = useState({
    patientId: '',
    deviceId: '',
    deviceType: 'Wearable',
    data: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Mock data for demonstration
  const mockDevices = [
    { id: 'mobile-001', type: 'Smartphone', patient: 'John Doe', status: 'Active', lastSync: '2025-04-18 10:30' },
    { id: 'mobile-002', type: 'Tablet', patient: 'Jane Smith', status: 'Active', lastSync: '2025-04-17 15:45' },
    { id: 'iot-001', type: 'Wearable', patient: 'John Doe', status: 'Active', lastSync: '2025-04-18 11:15' },
    { id: 'iot-002', type: 'HomeMonitor', patient: 'Robert Johnson', status: 'Inactive', lastSync: '2025-04-15 09:20' },
    { id: 'iot-003', type: 'MedicalDevice', patient: 'Emily Davis', status: 'Active', lastSync: '2025-04-18 08:45' },
  ];

  const mockHealthData = [
    { id: 'data-001', device: 'mobile-001', type: 'Vitals', timestamp: '2025-04-18 10:30', summary: 'Heart Rate: 72 bpm, BP: 120/80, SpO2: 98%' },
    { id: 'data-002', device: 'iot-001', type: 'Activity', timestamp: '2025-04-18 11:15', summary: 'Steps: 8,542, Calories: 320, Distance: 6.2km' },
    { id: 'data-003', device: 'iot-003', type: 'Glucose', timestamp: '2025-04-18 08:45', summary: 'Blood Glucose: 105 mg/dL' },
    { id: 'data-004', device: 'mobile-002', type: 'Medication', timestamp: '2025-04-17 15:45', summary: 'Medication taken: Lisinopril 10mg' },
  ];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleMobileDeviceChange = (e) => {
    const { name, value } = e.target;
    setMobileDevice({ ...mobileDevice, [name]: value });
  };

  const handleIoTDeviceChange = (e) => {
    const { name, value } = e.target;
    setIotDevice({ ...iotDevice, [name]: value });
  };

  const handleMobileDataChange = (e) => {
    const { name, value } = e.target;
    setMobileData({ ...mobileData, [name]: value });
  };

  const handleIoTDataChange = (e) => {
    const { name, value } = e.target;
    setIotData({ ...iotData, [name]: value });
  };

  const handleRegisterMobileDevice = async (e) => {
    e.preventDefault();
    try {
      // In a real app, we would call the API
      // await api.registerMobileDevice({
      //   ...mobileDevice,
      //   signature: currentUser.id, // In a real app, this would be a digital signature
      // });

      setSnackbar({
        open: true,
        message: 'Mobile device registered successfully',
        severity: 'success',
      });

      // Reset form
      setMobileDevice({
        patientId: '',
        deviceType: 'Smartphone',
        appVersion: '1.0.0',
      });
    } catch (error) {
      console.error('Error registering mobile device:', error);
      setSnackbar({
        open: true,
        message: 'Error registering mobile device: ' + error.message,
        severity: 'error',
      });
    }
  };

  const handleRegisterIoTDevice = async (e) => {
    e.preventDefault();
    try {
      // In a real app, we would call the API
      // await api.registerIoTDevice({
      //   ...iotDevice,
      //   signature: currentUser.id, // In a real app, this would be a digital signature
      // });

      setSnackbar({
        open: true,
        message: 'IoT device registered successfully',
        severity: 'success',
      });

      // Reset form
      setIotDevice({
        patientId: '',
        deviceType: 'Wearable',
        manufacturer: '',
        model: '',
      });
    } catch (error) {
      console.error('Error registering IoT device:', error);
      setSnackbar({
        open: true,
        message: 'Error registering IoT device: ' + error.message,
        severity: 'error',
      });
    }
  };

  const handleSubmitMobileData = async (e) => {
    e.preventDefault();
    try {
      // In a real app, we would call the API
      // await api.submitMobileData({
      //   ...mobileData,
      //   signature: currentUser.id, // In a real app, this would be a digital signature
      // });

      setSnackbar({
        open: true,
        message: 'Mobile data submitted successfully',
        severity: 'success',
      });

      // Reset form
      setMobileData({
        patientId: '',
        deviceId: '',
        dataType: 'Vitals',
        data: '',
      });
    } catch (error) {
      console.error('Error submitting mobile data:', error);
      setSnackbar({
        open: true,
        message: 'Error submitting mobile data: ' + error.message,
        severity: 'error',
      });
    }
  };

  const handleSubmitIoTData = async (e) => {
    e.preventDefault();
    try {
      // In a real app, we would call the API
      // await api.submitIoTData({
      //   ...iotData,
      //   signature: currentUser.id, // In a real app, this would be a digital signature
      // });

      setSnackbar({
        open: true,
        message: 'IoT data submitted successfully',
        severity: 'success',
      });

      // Reset form
      setIotData({
        patientId: '',
        deviceId: '',
        deviceType: 'Wearable',
        data: '',
      });
    } catch (error) {
      console.error('Error submitting IoT data:', error);
      setSnackbar({
        open: true,
        message: 'Error submitting IoT data: ' + error.message,
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'Smartphone':
      case 'Tablet':
        return <PhoneAndroid />;
      case 'Wearable':
        return <Watch />;
      case 'MedicalDevice':
        return <MedicalServices />;
      case 'HomeMonitor':
        return <Home />;
      default:
        return <DevicesOther />;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
        <Typography component="h1" variant="h4" color="primary" gutterBottom>
          Mobile & IoT Integration
        </Typography>
        <Typography variant="body1" paragraph>
          Connect mobile devices and IoT health monitors to securely collect and share health data on the blockchain.
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="mobile and iot tabs">
            <Tab label="Register Devices" icon={<DevicesOther />} iconPosition="start" {...a11yProps(0)} />
            <Tab label="Submit Health Data" icon={<DataUsage />} iconPosition="start" {...a11yProps(1)} />
            <Tab label="Connected Devices" icon={<Sync />} iconPosition="start" {...a11yProps(2)} />
            <Tab label="Health Data Feed" icon={<MonitorHeart />} iconPosition="start" {...a11yProps(3)} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <PhoneAndroid sx={{ mr: 1 }} /> Register Mobile Device
                  </Typography>
                  <form onSubmit={handleRegisterMobileDevice}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          label="Patient ID"
                          name="patientId"
                          value={mobileDevice.patientId}
                          onChange={handleMobileDeviceChange}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel id="mobile-device-type-label">Device Type</InputLabel>
                          <Select
                            labelId="mobile-device-type-label"
                            name="deviceType"
                            value={mobileDevice.deviceType}
                            label="Device Type"
                            onChange={handleMobileDeviceChange}
                          >
                            <MenuItem value="Smartphone">Smartphone</MenuItem>
                            <MenuItem value="Tablet">Tablet</MenuItem>
                            <MenuItem value="Smartwatch">Smartwatch</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          label="App Version"
                          name="appVersion"
                          value={mobileDevice.appVersion}
                          onChange={handleMobileDeviceChange}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          startIcon={<PhoneAndroid />}
                        >
                          Register Mobile Device
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
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <DevicesOther sx={{ mr: 1 }} /> Register IoT Device
                  </Typography>
                  <form onSubmit={handleRegisterIoTDevice}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          label="Patient ID"
                          name="patientId"
                          value={iotDevice.patientId}
                          onChange={handleIoTDeviceChange}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel id="iot-device-type-label">Device Type</InputLabel>
                          <Select
                            labelId="iot-device-type-label"
                            name="deviceType"
                            value={iotDevice.deviceType}
                            label="Device Type"
                            onChange={handleIoTDeviceChange}
                          >
                            <MenuItem value="Wearable">Wearable</MenuItem>
                            <MenuItem value="MedicalDevice">Medical Device</MenuItem>
                            <MenuItem value="HomeMonitor">Home Monitor</MenuItem>
                            <MenuItem value="ImplantableDevice">Implantable Device</MenuItem>
                            <MenuItem value="SmartPill">Smart Pill</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          required
                          fullWidth
                          label="Manufacturer"
                          name="manufacturer"
                          value={iotDevice.manufacturer}
                          onChange={handleIoTDeviceChange}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          required
                          fullWidth
                          label="Model"
                          name="model"
                          value={iotDevice.model}
                          onChange={handleIoTDeviceChange}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          startIcon={<DevicesOther />}
                        >
                          Register IoT Device
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
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
                    <PhoneAndroid sx={{ mr: 1 }} /> Submit Mobile Health Data
                  </Typography>
                  <form onSubmit={handleSubmitMobileData}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          required
                          fullWidth
                          label="Patient ID"
                          name="patientId"
                          value={mobileData.patientId}
                          onChange={handleMobileDataChange}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          required
                          fullWidth
                          label="Device ID"
                          name="deviceId"
                          value={mobileData.deviceId}
                          onChange={handleMobileDataChange}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel id="mobile-data-type-label">Data Type</InputLabel>
                          <Select
                            labelId="mobile-data-type-label"
                            name="dataType"
                            value={mobileData.dataType}
                            label="Data Type"
                            onChange={handleMobileDataChange}
                          >
                            <MenuItem value="Vitals">Vitals</MenuItem>
                            <MenuItem value="Activity">Activity</MenuItem>
                            <MenuItem value="Sleep">Sleep</MenuItem>
                            <MenuItem value="Nutrition">Nutrition</MenuItem>
                            <MenuItem value="Medication">Medication</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          multiline
                          rows={4}
                          label="Health Data (JSON)"
                          name="data"
                          value={mobileData.data}
                          onChange={handleMobileDataChange}
                          placeholder='{"heartRate": 72, "bloodPressure": {"systolic": 120, "diastolic": 80}, "spO2": 98}'
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          startIcon={<DataUsage />}
                        >
                          Submit Mobile Data
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
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <DevicesOther sx={{ mr: 1 }} /> Submit IoT Health Data
                  </Typography>
                  <form onSubmit={handleSubmitIoTData}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          required
                          fullWidth
                          label="Patient ID"
                          name="patientId"
                          value={iotData.patientId}
                          onChange={handleIoTDataChange}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          required
                          fullWidth
                          label="Device ID"
                          name="deviceId"
                          value={iotData.deviceId}
                          onChange={handleIoTDataChange}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel id="iot-device-type-label">Device Type</InputLabel>
                          <Select
                            labelId="iot-device-type-label"
                            name="deviceType"
                            value={iotData.deviceType}
                            label="Device Type"
                            onChange={handleIoTDataChange}
                          >
                            <MenuItem value="Wearable">Wearable</MenuItem>
                            <MenuItem value="MedicalDevice">Medical Device</MenuItem>
                            <MenuItem value="HomeMonitor">Home Monitor</MenuItem>
                            <MenuItem value="ImplantableDevice">Implantable Device</MenuItem>
                            <MenuItem value="SmartPill">Smart Pill</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          multiline
                          rows={4}
                          label="Health Data (JSON)"
                          name="data"
                          value={iotData.data}
                          onChange={handleIoTDataChange}
                          placeholder='{"glucoseLevel": 105, "timestamp": "2025-04-18T08:45:00Z", "batteryLevel": 85}'
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          startIcon={<DataUsage />}
                        >
                          Submit IoT Data
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Connected Devices
              </Typography>
              <Typography variant="body2" paragraph>
                View and manage all connected mobile and IoT devices with blockchain-verified authentication.
              </Typography>
            </Grid>
            {mockDevices.map((device, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ mr: 2 }}>
                        {getDeviceIcon(device.type)}
                      </Box>
                      <Box>
                        <Typography variant="h6" component="div">
                          {device.type}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ID: {device.id}
                        </Typography>
                      </Box>
                      <Box sx={{ ml: 'auto' }}>
                        <Chip 
                          label={device.status} 
                          color={device.status === 'Active' ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Patient:
                        </Typography>
                        <Typography variant="body2">
                          {device.patient}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Last Sync:
                        </Typography>
                        <Typography variant="body2">
                          {device.lastSync}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ mr: 1 }}>
                            {device.id.startsWith('mobile') ? <Wifi fontSize="small" /> : <Bluetooth fontSize="small" />}
                          </Box>
                          <Typography variant="body2">
                            {device.id.startsWith('mobile') ? 'WiFi Connected' : 'Bluetooth Connected'}
                          </Typography>
                          <Box sx={{ ml: 'auto' }}>
                            <VerifiedUser fontSize="small" color="primary" />
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Button size="small" variant="outlined">
                        View Details
                      </Button>
                      <FormControlLabel
                        control={
                          <Switch 
                            size="small" 
                            checked={device.status === 'Active'} 
                          />}
                        label="Active"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Health Data Feed
              </Typography>
              <Typography variant="body2" paragraph>
                Real-time health data from connected mobile and IoT devices with blockchain verification.
              </Typography>
            </Grid>
            {mockHealthData.map((data, index) => (
              <Grid item xs={12} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={8}>
                        <Typography variant="h6" component="div">
                          {data.type} Data
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Device ID: {data.device} | Timestamp: {data.timestamp}
                        </Typography>
                        <Typography variant="body1">
                          {data.summary}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Box sx={{ textAlign: 'center' }}>
                          {data.type === 'Vitals' && <MonitorHeart fontSize="large" color="primary" />}
                          {data.type === 'Activity' && <DataUsage fontSize="large" color="primary" />}
                          {data.type === 'Glucose' && <MedicalServices fontSize="large" color="primary" />}
                          {data.type === 'Medication' && <MedicalServices fontSize="large" color="primary" />}
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            <VerifiedUser fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                            Blockchain Verified
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
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

export default MobileIoTIntegration;
