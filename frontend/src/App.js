import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Components
import Layout from './components/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientRecords from './pages/PatientRecords';
import CreateRecord from './pages/CreateRecord';
import AccessManagement from './pages/AccessManagement';
import BlockchainExplorer from './pages/BlockchainExplorer';
import PatientDataContribution from './pages/PatientDataContribution';
import SmartContracts from './pages/SmartContracts';
import Interoperability from './pages/Interoperability';
import AdvancedAnalytics from './pages/AdvancedAnalytics';
import ProviderFeatures from './pages/ProviderFeatures';
import MobileIoTIntegration from './pages/MobileIoTIntegration';
import ComplianceGovernance from './pages/ComplianceGovernance';
import TechnicalImprovements from './pages/TechnicalImprovements';
import NotFound from './pages/NotFound';

// Context
import { useAuth } from './contexts/AuthContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
});

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  
  return currentUser ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="records" element={<PatientRecords />} />
          <Route path="create-record" element={<CreateRecord />} />
          <Route path="access-management" element={<AccessManagement />} />
          <Route path="patient-contribution" element={<PatientDataContribution />} />
          <Route path="smart-contracts" element={<SmartContracts />} />
          <Route path="blockchain-explorer" element={<BlockchainExplorer />} />
          <Route path="interoperability" element={<Interoperability />} />
          <Route path="analytics" element={<AdvancedAnalytics />} />
          <Route path="provider-features" element={<ProviderFeatures />} />
          <Route path="mobile-iot" element={<MobileIoTIntegration />} />
          <Route path="compliance" element={<ComplianceGovernance />} />
          <Route path="technical" element={<TechnicalImprovements />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
