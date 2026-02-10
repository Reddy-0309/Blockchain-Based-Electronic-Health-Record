import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Description as DescriptionIcon,
  AddCircleOutline as AddIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  AccountCircle,
  HealthAndSafety as HealthIcon,
  SmartToy as SmartContractIcon,
  SyncAlt as InteropIcon,
  Analytics as AnalyticsIcon,
  MedicalServices as ProviderIcon,
  PhoneAndroid as MobileIcon,
  Policy as ComplianceIcon,
  Speed as TechnicalIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

function Layout() {
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Health Records', icon: <DescriptionIcon />, path: '/records' },
    { text: 'Create Record', icon: <AddIcon />, path: '/create-record', role: 'provider' },
    { text: 'Patient Contribution', icon: <HealthIcon />, path: '/patient-contribution', role: 'patient' },
    { text: 'Access Management', icon: <SecurityIcon />, path: '/access-management' },
    { text: 'Smart Contracts', icon: <SmartContractIcon />, path: '/smart-contracts' },
    { text: 'Interoperability', icon: <InteropIcon />, path: '/interoperability' },
    { text: 'Advanced Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
    { text: 'Provider Features', icon: <ProviderIcon />, path: '/provider-features', role: 'provider' },
    { text: 'Mobile & IoT', icon: <MobileIcon />, path: '/mobile-iot' },
    { text: 'Compliance & Governance', icon: <ComplianceIcon />, path: '/compliance' },
    { text: 'Technical Improvements', icon: <TechnicalIcon />, path: '/technical', role: 'admin' },
    { text: 'Blockchain Explorer', icon: <StorageIcon />, path: '/blockchain-explorer' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            EHR Blockchain System
          </Typography>
          {currentUser && (
            <div>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <Avatar sx={{ bgcolor: '#1565c0' }}>
                  {(currentUser?.name || 'User').charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem disabled>
                  <Typography variant="body2">
                    Signed in as <strong>{currentUser?.name || 'User'}</strong>
                    <br />
                    <small>{currentUser?.userType || 'Unknown'}</small>
                  </Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </div>
          )}
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader />
        <Divider />
        <List>
          {menuItems.map((item) => {
            // Skip items that are role-specific and don't match the current user's role
            if (item.role && currentUser?.userType !== item.role) {
              return null;
            }
            
            return (
              <ListItem key={item.text} disablePadding>
                <ListItemButton onClick={() => navigate(item.path)}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Drawer>
      <Main open={open}>
        <DrawerHeader />
        <Outlet />
      </Main>
    </Box>
  );
}

export default Layout;
