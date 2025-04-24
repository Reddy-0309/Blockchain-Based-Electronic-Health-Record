import axios from 'axios';

const API_URL = '/api';

const api = {
  // Blockchain information
  getBlockchainInfo: async () => {
    try {
      const response = await axios.get(`${API_URL}/blockchain/info`);
      return response.data;
    } catch (error) {
      console.error('Error fetching blockchain info:', error);
      throw error;
    }
  },

  // Health Records
  getPatientRecords: async (patientId) => {
    try {
      const response = await axios.get(`${API_URL}/records/patient/${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient records:', error);
      throw error;
    }
  },

  createHealthRecord: async (recordData) => {
    try {
      const response = await axios.post(`${API_URL}/records/create`, recordData);
      return response.data;
    } catch (error) {
      console.error('Error creating health record:', error);
      throw error;
    }
  },

  accessRecord: async (accessData) => {
    try {
      const response = await axios.post(`${API_URL}/records/access`, accessData);
      return response.data;
    } catch (error) {
      console.error('Error accessing record:', error);
      throw error;
    }
  },

  // Access Control
  grantAccess: async (accessData) => {
    try {
      const response = await axios.post(`${API_URL}/access/grant`, accessData);
      return response.data;
    } catch (error) {
      console.error('Error granting access:', error);
      throw error;
    }
  },

  // Smart Contracts
  createSmartContract: async (contractData) => {
    try {
      const response = await axios.post(`${API_URL}/contracts/create`, contractData);
      return response.data;
    } catch (error) {
      console.error('Error creating smart contract:', error);
      throw error;
    }
  },

  executeSmartContract: async (executionData) => {
    try {
      const response = await axios.post(`${API_URL}/contracts/execute`, executionData);
      return response.data;
    } catch (error) {
      console.error('Error executing smart contract:', error);
      throw error;
    }
  },

  // Patient Data Contributions
  contributePatientData: async (contributionData) => {
    try {
      const response = await axios.post(`${API_URL}/records/contribute`, contributionData);
      return response.data;
    } catch (error) {
      console.error('Error contributing patient data:', error);
      throw error;
    }
  },

  // Mock functions for demo purposes
  mockGetPatientRecords: (patientId) => {
    return {
      success: true,
      message: `Retrieved records for patient ${patientId}`,
      data: [
        {
          record_id: 'rec_001',
          patient_id: patientId,
          provider_id: 'doc_123',
          record_type: 'Diagnosis',
          timestamp: new Date().toISOString(),
          data: 'Encrypted health data for diagnosis',
          metadata: { diagnosis: 'Common Cold', severity: 'Mild' },
          signature: 'digital_signature_here',
        },
        {
          record_id: 'rec_002',
          patient_id: patientId,
          provider_id: 'doc_456',
          record_type: 'Medication',
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          data: 'Encrypted health data for medication',
          metadata: { medication: 'Amoxicillin', dosage: '500mg' },
          signature: 'digital_signature_here',
        },
        {
          record_id: 'rec_003',
          patient_id: patientId,
          provider_id: 'doc_123',
          record_type: 'LabResult',
          timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          data: 'Encrypted health data for lab result',
          metadata: { test: 'Blood Test', result: 'Normal' },
          signature: 'digital_signature_here',
        },
      ],
    };
  },

  mockGetAccessControls: (patientId) => {
    return {
      success: true,
      message: `Retrieved access controls for patient ${patientId}`,
      data: [
        {
          patient_id: patientId,
          provider_id: 'doc_123',
          access_level: 'Provider',
          granted_at: new Date(Date.now() - 604800000).toISOString(), // 1 week ago
          expires_at: new Date(Date.now() + 2592000000).toISOString(), // 30 days from now
          specific_record_types: null,
        },
        {
          patient_id: patientId,
          provider_id: 'doc_456',
          access_level: 'Limited',
          granted_at: new Date(Date.now() - 1209600000).toISOString(), // 2 weeks ago
          expires_at: new Date(Date.now() + 1296000000).toISOString(), // 15 days from now
          specific_record_types: ['Medication', 'Diagnosis'],
        },
      ],
    };
  },

  mockGetBlockchainInfo: () => {
    return {
      success: true,
      message: 'Blockchain information retrieved successfully',
      data: {
        chain_length: 42,
        is_valid: true,
        pending_transactions: 3,
      },
    };
  },

  mockGetSmartContracts: (userId) => {
    return {
      success: true,
      message: `Retrieved smart contracts for user ${userId}`,
      data: [
        {
          contract_id: 'contract-001',
          contract_type: 'TimeBasedAccess',
          parties: [userId, 'doc_123'],
          conditions: 'Access expires on 2025-05-18',
          created_at: new Date().toISOString(),
          status: 'Active',
        },
        {
          contract_id: 'contract-002',
          contract_type: 'EmergencyAccess',
          parties: [userId, 'hospital_456'],
          conditions: 'Automatic access in case of emergency',
          created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          status: 'Active',
        },
      ],
    };
  },
};

export default api;
