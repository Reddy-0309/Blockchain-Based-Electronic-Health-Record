import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Chip,
  TextField,
  Button,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

function BlockchainExplorer() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [blockchainInfo, setBlockchainInfo] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBlockchainData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // In a real implementation, these would be actual API calls
        // For demo purposes, we're using mock data
        const infoResponse = api.mockGetBlockchainInfo();
        
        setBlockchainInfo(infoResponse.data);
        
        // Generate mock blocks for demonstration
        const mockBlocks = generateMockBlocks(infoResponse.data.chain_length);
        setBlocks(mockBlocks);
      } catch (err) {
        console.error('Error fetching blockchain data:', err);
        setError('Failed to load blockchain data');
      } finally {
        setLoading(false);
      }
    };

    fetchBlockchainData();
  }, []);

  const generateMockBlocks = (chainLength) => {
    const blocks = [];
    
    for (let i = chainLength - 1; i >= 0; i--) {
      const timestamp = new Date(Date.now() - i * 600000); // Each block 10 minutes apart
      const transactions = [];
      
      // Generate 1-5 transactions per block
      const txCount = Math.floor(Math.random() * 5) + 1;
      
      for (let j = 0; j < txCount; j++) {
        const txTypes = ['CreateRecord', 'UpdateRecord', 'GrantAccess', 'RevokeAccess', 'AccessRecord'];
        const txType = txTypes[Math.floor(Math.random() * txTypes.length)];
        
        transactions.push({
          transaction_id: `tx_${i}_${j}_${Math.random().toString(36).substring(2, 10)}`,
          transaction_type: txType,
          timestamp: new Date(timestamp.getTime() - j * 60000).toISOString(), // Each tx 1 minute apart
          signature: `sig_${Math.random().toString(36).substring(2, 15)}`,
        });
      }
      
      blocks.push({
        index: i,
        timestamp: timestamp.toISOString(),
        transactions,
        previous_hash: i > 0 ? `hash_${i-1}_${Math.random().toString(36).substring(2, 10)}` : '0',
        hash: `hash_${i}_${Math.random().toString(36).substring(2, 10)}`,
        nonce: Math.floor(Math.random() * 10000),
      });
    }
    
    return blocks;
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      return;
    }
    
    // In a real implementation, this would search for blocks, transactions, or records
    // For demo purposes, we'll just show an alert
    alert(`Search functionality would look for: ${searchTerm}`);
  };

  const getTransactionTypeColor = (type) => {
    const colors = {
      'CreateRecord': 'success',
      'UpdateRecord': 'primary',
      'GrantAccess': 'info',
      'RevokeAccess': 'warning',
      'AccessRecord': 'secondary',
    };
    return colors[type] || 'default';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Blockchain Explorer
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search by block hash, transaction ID, or record ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {blockchainInfo && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Blockchain Information
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {blockchainInfo.chain_length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Blocks
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color={blockchainInfo.is_valid ? 'success.main' : 'error.main'}>
                    {blockchainInfo.is_valid ? 'Valid' : 'Invalid'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Chain Status
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="secondary">
                    {blockchainInfo.pending_transactions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Transactions
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}
      
      <Typography variant="h6" gutterBottom>
        Recent Blocks
      </Typography>
      
      {blocks.map((block) => (
        <Accordion key={block.index} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Grid container alignItems="center">
              <Grid item xs={2} md={1}>
                <Chip label={`#${block.index}`} color="primary" />
              </Grid>
              <Grid item xs={10} md={3}>
                <Typography variant="body2">
                  <strong>Hash:</strong> {block.hash.substring(0, 15)}...
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="body2">
                  <strong>Prev Hash:</strong> {block.previous_hash.substring(0, 10)}...
                </Typography>
              </Grid>
              <Grid item xs={6} md={2}>
                <Typography variant="body2">
                  <strong>Tx:</strong> {block.transactions.length}
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="body2">
                  <strong>Time:</strong> {new Date(block.timestamp).toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Block Details
              </Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>Hash:</strong> {block.hash}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>Previous Hash:</strong> {block.previous_hash}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>Timestamp:</strong> {new Date(block.timestamp).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>Nonce:</strong> {block.nonce}
                  </Typography>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Transactions ({block.transactions.length})
              </Typography>
              
              <List>
                {block.transactions.map((tx) => (
                  <ListItem key={tx.transaction_id} sx={{ bgcolor: '#f5f5f5', mb: 1, borderRadius: 1 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2">
                            <strong>ID:</strong> {tx.transaction_id}
                          </Typography>
                          <Chip 
                            label={tx.transaction_type} 
                            size="small" 
                            color={getTransactionTypeColor(tx.transaction_type)} 
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" component="span">
                            <strong>Time:</strong> {new Date(tx.timestamp).toLocaleString()}
                          </Typography>
                          <br />
                          <Typography variant="body2" component="span" color="text.secondary">
                            <strong>Signature:</strong> {tx.signature}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Container>
  );
}

export default BlockchainExplorer;
