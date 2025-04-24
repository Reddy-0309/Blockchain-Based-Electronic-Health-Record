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
  TextField,
  Typography,
  Alert,
  Snackbar,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Analytics, 
  Assignment, 
  Lock,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as LineChartIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const AdvancedAnalytics = () => {
  const { currentUser } = useAuth();
  const [analyticsRequest, setAnalyticsRequest] = useState({
    dataScope: 'population_health',
    purpose: '',
    timeframe: 'last_6_months',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [loading, setLoading] = useState(false);
  const [analyticsResults, setAnalyticsResults] = useState(null);

  // Mock data for demonstration
  const mockAnalyticsData = {
    populationHealth: {
      ageDistribution: [
        { name: '0-18', value: 120 },
        { name: '19-35', value: 210 },
        { name: '36-50', value: 180 },
        { name: '51-65', value: 150 },
        { name: '65+', value: 90 },
      ],
      diagnosisDistribution: [
        { name: 'Hypertension', value: 180 },
        { name: 'Diabetes', value: 120 },
        { name: 'Asthma', value: 80 },
        { name: 'Arthritis', value: 60 },
        { name: 'Depression', value: 40 },
      ],
      medicationAdherence: [
        { name: 'High', value: 60 },
        { name: 'Medium', value: 25 },
        { name: 'Low', value: 15 },
      ],
    },
    treatmentOutcomes: {
      recoveryRates: [
        { name: 'Jan', recovered: 65, ongoing: 35 },
        { name: 'Feb', recovered: 68, ongoing: 32 },
        { name: 'Mar', recovered: 72, ongoing: 28 },
        { name: 'Apr', recovered: 75, ongoing: 25 },
        { name: 'May', recovered: 78, ongoing: 22 },
        { name: 'Jun', recovered: 80, ongoing: 20 },
      ],
      readmissionRates: [
        { name: 'Diabetes', rate: 12 },
        { name: 'Heart Disease', rate: 18 },
        { name: 'Pneumonia', rate: 8 },
        { name: 'COPD', rate: 15 },
      ],
    },
    researchTrends: {
      participationTrends: [
        { name: 'Q1 2024', participants: 120 },
        { name: 'Q2 2024', participants: 150 },
        { name: 'Q3 2024', participants: 180 },
        { name: 'Q4 2024', participants: 220 },
        { name: 'Q1 2025', participants: 250 },
      ],
      consentRates: [
        { name: 'Consented', value: 75 },
        { name: 'Declined', value: 25 },
      ],
    },
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAnalyticsRequest({ ...analyticsRequest, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // In a real app, we would call the API
      // const response = await api.requestAnalytics({
      //   requester_id: currentUser.id,
      //   data_scope: analyticsRequest.dataScope,
      //   purpose: analyticsRequest.purpose,
      //   signature: currentUser.id, // In a real app, this would be a digital signature
      // });

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Set mock results based on the selected data scope
      if (analyticsRequest.dataScope === 'population_health') {
        setAnalyticsResults(mockAnalyticsData.populationHealth);
      } else if (analyticsRequest.dataScope === 'treatment_outcomes') {
        setAnalyticsResults(mockAnalyticsData.treatmentOutcomes);
      } else {
        setAnalyticsResults(mockAnalyticsData.researchTrends);
      }

      setSnackbar({
        open: true,
        message: 'Analytics request processed successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error requesting analytics:', error);
      setSnackbar({
        open: true,
        message: 'Error requesting analytics: ' + error.message,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Simple data visualization component that doesn't require recharts
  const SimpleBarChart = ({ data, dataKey, nameKey = 'name', maxValue }) => {
    const max = maxValue || Math.max(...data.map(item => item[dataKey]));
    
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        {data.map((item, index) => (
          <Box key={index} sx={{ mb: 1 }}>
            <Typography variant="body2">{item[nameKey]}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  height: 20,
                  width: `${(item[dataKey] / max) * 100}%`,
                  bgcolor: 'primary.main',
                  borderRadius: 1,
                }}
              />
              <Typography variant="body2" sx={{ ml: 1 }}>
                {item[dataKey]}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    );
  };

  const SimplePieChart = ({ data, dataKey, nameKey = 'name' }) => {
    const total = data.reduce((sum, item) => sum + item[dataKey], 0);
    const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
    
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', mb: 2 }}>
          {data.map((item, index) => (
            <Box 
              key={index} 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mr: 2, 
                mb: 1 
              }}
            >
              <Box 
                sx={{ 
                  width: 16, 
                  height: 16, 
                  bgcolor: colors[index % colors.length],
                  mr: 1,
                  borderRadius: '50%'
                }} 
              />
              <Typography variant="body2">
                {item[nameKey]} ({Math.round((item[dataKey] / total) * 100)}%)
              </Typography>
            </Box>
          ))}
        </Box>
        <Box sx={{ position: 'relative', width: 200, height: 200 }}>
          {data.map((item, index, arr) => {
            const percentage = item[dataKey] / total;
            const previousPercentages = arr
              .slice(0, index)
              .reduce((sum, i) => sum + i[dataKey] / total, 0);
            
            return (
              <Box
                key={index}
                sx={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: `conic-gradient(transparent ${previousPercentages * 360}deg, ${colors[index % colors.length]} ${previousPercentages * 360}deg, ${colors[index % colors.length]} ${(previousPercentages + percentage) * 360}deg, transparent ${(previousPercentages + percentage) * 360}deg)`,
                }}
              />
            );
          })}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '70%',
              height: '70%',
              borderRadius: '50%',
              bgcolor: 'background.paper',
            }}
          />
        </Box>
      </Box>
    );
  };

  const renderAnalyticsResults = () => {
    if (!analyticsResults) return null;

    if (analyticsRequest.dataScope === 'population_health') {
      return (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Population Health Analysis
            </Typography>
            <Chip icon={<Lock />} label="De-identified Data" color="primary" size="small" sx={{ mb: 2 }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
                  <BarChartIcon sx={{ mr: 1 }} /> Age Distribution
                </Typography>
                <SimpleBarChart data={analyticsResults.ageDistribution} dataKey="value" />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
                  <PieChartIcon sx={{ mr: 1 }} /> Diagnosis Distribution
                </Typography>
                <SimplePieChart data={analyticsResults.diagnosisDistribution} dataKey="value" />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
                  <PieChartIcon sx={{ mr: 1 }} /> Medication Adherence
                </Typography>
                <SimplePieChart data={analyticsResults.medicationAdherence} dataKey="value" />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      );
    } else if (analyticsRequest.dataScope === 'treatment_outcomes') {
      return (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Treatment Outcomes Analysis
            </Typography>
            <Chip icon={<Lock />} label="De-identified Data" color="primary" size="small" sx={{ mb: 2 }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
                  <BarChartIcon sx={{ mr: 1 }} /> Recovery Rates (Last 6 Months)
                </Typography>
                <List>
                  {analyticsResults.recoveryRates.map((item, index) => (
                    <ListItem key={index}>
                      <ListItemText 
                        primary={item.name}
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box
                                  sx={{
                                    height: 10,
                                    width: `${(item.recovered / (item.recovered + item.ongoing)) * 100}%`,
                                    bgcolor: 'success.main',
                                    borderRadius: '4px 0 0 4px',
                                  }}
                                />
                                <Box
                                  sx={{
                                    height: 10,
                                    width: `${(item.ongoing / (item.recovered + item.ongoing)) * 100}%`,
                                    bgcolor: 'primary.main',
                                    borderRadius: '0 4px 4px 0',
                                  }}
                                />
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                                <Typography variant="caption">Recovered: {item.recovered}%</Typography>
                                <Typography variant="caption">Ongoing: {item.ongoing}%</Typography>
                              </Box>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
                  <BarChartIcon sx={{ mr: 1 }} /> Readmission Rates by Condition
                </Typography>
                <SimpleBarChart data={analyticsResults.readmissionRates} dataKey="rate" />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      );
    } else {
      return (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Research Trends Analysis
            </Typography>
            <Chip icon={<Lock />} label="De-identified Data" color="primary" size="small" sx={{ mb: 2 }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
                  <LineChartIcon sx={{ mr: 1 }} /> Research Participation Trends
                </Typography>
                <SimpleBarChart data={analyticsResults.participationTrends} dataKey="participants" />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
                  <PieChartIcon sx={{ mr: 1 }} /> Research Consent Rates
                </Typography>
                <SimplePieChart data={analyticsResults.consentRates} dataKey="value" />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      );
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
        <Typography component="h1" variant="h4" color="primary" gutterBottom>
          Advanced Analytics
        </Typography>
        <Typography variant="body1" paragraph>
          Analyze de-identified health data with blockchain-verified consent for population health insights, treatment outcomes, and research trends.
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="data-scope-label">Data Scope</InputLabel>
                <Select
                  labelId="data-scope-label"
                  name="dataScope"
                  value={analyticsRequest.dataScope}
                  label="Data Scope"
                  onChange={handleChange}
                >
                  <MenuItem value="population_health">Population Health</MenuItem>
                  <MenuItem value="treatment_outcomes">Treatment Outcomes</MenuItem>
                  <MenuItem value="research_trends">Research Trends</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="timeframe-label">Timeframe</InputLabel>
                <Select
                  labelId="timeframe-label"
                  name="timeframe"
                  value={analyticsRequest.timeframe}
                  label="Timeframe"
                  onChange={handleChange}
                >
                  <MenuItem value="last_month">Last Month</MenuItem>
                  <MenuItem value="last_3_months">Last 3 Months</MenuItem>
                  <MenuItem value="last_6_months">Last 6 Months</MenuItem>
                  <MenuItem value="last_year">Last Year</MenuItem>
                  <MenuItem value="all_time">All Time</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Analysis Purpose"
                name="purpose"
                value={analyticsRequest.purpose}
                onChange={handleChange}
                placeholder="e.g., Quality improvement, Research study"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<Analytics />}
                disabled={loading}
              >
                Generate Analytics
              </Button>
            </Grid>
          </Grid>
        </form>

        {loading && (
          <Box sx={{ width: '100%', mt: 3 }}>
            <Typography variant="body2" gutterBottom>
              Processing analytics request...
            </Typography>
            <LinearProgress />
          </Box>
        )}

        {analyticsResults && (
          <Box sx={{ mt: 4 }}>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ mb: 2 }}>
              <Typography variant="h5" gutterBottom>
                Analytics Results
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Results are based on de-identified data with blockchain-verified consent. All data access is recorded on the blockchain for transparency.
              </Typography>
            </Box>
            {renderAnalyticsResults()}
          </Box>
        )}
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

export default AdvancedAnalytics;
