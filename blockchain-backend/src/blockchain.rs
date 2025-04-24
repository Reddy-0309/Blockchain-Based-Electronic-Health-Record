use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::collections::{HashMap, HashSet};
use std::fmt;
use std::time::{SystemTime, Duration};
use std::sync::RwLock;
use thiserror::Error;
use lru::LruCache;
use std::num::NonZeroUsize;

#[derive(Error, Debug)]
pub enum BlockchainError {
    #[error("Invalid block hash")]
    InvalidBlockHash,
    #[error("Invalid block index")]
    InvalidBlockIndex,
    #[error("Invalid previous hash")]
    InvalidPreviousHash,
    #[error("Access denied")]
    AccessDenied,
    #[error("Validation error: {0}")]
    ValidationError(String),
    #[error("Record not found")]
    RecordNotFound,
    #[error("Rate limit exceeded")]
    RateLimitExceeded,
    #[error("Serialization error: {0}")]
    SerializationError(String),
    #[error("Cryptography error: {0}")]
    CryptoError(String),
    #[error("Invalid signature")]
    InvalidSignature,
    #[error("Off-chain storage error: {0}")]
    OffChainStorageError(String),
    #[error("Consensus error: {0}")]
    ConsensusError(String),
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub enum RecordType {
    Diagnosis,
    Medication,
    LabResult,
    Procedure,
    Immunization,
    Allergy,
    Vital,
    Note,
    PatientContribution,  // New: Allow patients to add their own data
    WearableData,        // New: Data from wearable devices
    RemoteMonitoring,    // New: Data from remote monitoring devices
    FHIRResource,        // New: FHIR standard resource
    HL7Message,          // New: HL7 message for legacy system integration
    Prescription,        // New: E-prescription data
    ClinicalDecision,    // New: Clinical decision support data
    ResearchData,        // New: De-identified data for research
    MobileData,       // New: Data from mobile health apps
    IoTDeviceData,    // New: Data from IoT medical devices
    ComplianceAudit,  // New: Compliance and governance audit records
    TechnicalConfig,  // New: Technical configuration changes
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum AccessLevel {
    Owner,      // Patient themselves
    Provider,   // Healthcare provider with full access
    Limited,    // Limited access (e.g., specific data types)
    Emergency,  // Emergency access
    Auditor,    // For audit purposes only
    Temporary,  // New: Temporary access with automatic expiration
    Research,   // New: De-identified access for research purposes
    Delegate,   // New: Access delegated by the patient to family members
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct AccessControl {
    pub patient_id: String,
    pub provider_id: Option<String>,
    pub access_level: AccessLevel,
    pub granted_at: DateTime<Utc>,
    pub expires_at: Option<DateTime<Utc>>,
    pub specific_record_types: Option<Vec<RecordType>>,
    pub emergency_reason: Option<String>,    // New: Reason for emergency access
    pub auto_revoke_condition: Option<String>, // New: Condition for automatic revocation
    pub delegate_info: Option<String>,       // New: Information about the delegate
    pub consent_proof: Option<String>,       // New: Proof of patient consent
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct HealthRecord {
    pub record_id: String,
    pub patient_id: String,
    pub provider_id: String,
    pub record_type: RecordType,
    pub timestamp: DateTime<Utc>,
    pub data: String, // Encrypted health data
    pub metadata: HashMap<String, String>,
    pub signature: String, // Digital signature of the provider
    pub version: u32, // New: Version number for tracking changes
    pub off_chain_data: Option<OffChainReference>, // New: Reference to off-chain storage for large files
    pub last_accessed: Option<DateTime<Utc>>, // New: Track last access time
    pub data_hash: Option<String>, // New: Hash of original data for integrity verification
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum ConsensusType {
    ProofOfWork,
    ProofOfAuthority,
    PracticalByzantineFaultTolerance,
    DelegatedProofOfStake,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum ScalabilitySolution {
    Layer2Rollup,
    Sharding,
    BatchProcessing,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum EncryptionType {
    AES256,
    RSA,
    ECC,
    PostQuantumNTRU,
    PostQuantumLattice,
    HomomorphicEncryption,
    ZeroKnowledgeProof,
    Hybrid,
    HomomorphicPartial,
    HomomorphicFully,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum ComplianceStandard {
    HIPAA,
    GDPR,
    HITECH,
    ISO27001,
    Custom(String),
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ComplianceRecord {
    pub standard: ComplianceStandard,
    pub verification_date: DateTime<Utc>,
    pub verified_by: String,
    pub status: String,
    pub details: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum IoTDeviceType {
    Wearable,
    MedicalDevice,
    HomeMonitor,
    ImplantableDevice,
    SmartPill,
    Other(String),
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum TransactionType {
    CreateRecord(HealthRecord),
    UpdateRecord {
        record_id: String,
        updates: HashMap<String, String>,
        provider_id: String,
        timestamp: DateTime<Utc>,
        signature: String,
    },
    GrantAccess(AccessControl),
    RevokeAccess {
        patient_id: String,
        provider_id: String,
        revoked_at: DateTime<Utc>,
        signature: String,
    },
    AccessRecord {
        record_id: String,
        accessor_id: String,
        timestamp: DateTime<Utc>,
        access_reason: String,
    },
    // New transaction types
    CreateSmartContract {
        contract_id: String,
        contract_type: String,
        parties: Vec<String>,
        conditions: String,
        created_at: DateTime<Utc>,
        signature: String,
    },
    ExecuteSmartContract {
        contract_id: String,
        execution_params: HashMap<String, String>,
        executed_by: String,
        timestamp: DateTime<Utc>,
        signature: String,
    },
    PatientDataContribution {
        record_id: String,
        patient_id: String,
        data_type: RecordType,
        data: String,
        timestamp: DateTime<Utc>,
        signature: String,
    },
    ImportExternalRecord {
        record_id: String,
        patient_id: String,
        source_system: String,
        record_type: RecordType,
        data: String,
        timestamp: DateTime<Utc>,
        signature: String,
    },
    ExportRecord {
        record_id: String,
        destination_system: String,
        exported_by: String,
        timestamp: DateTime<Utc>,
        signature: String,
    },
    AnalyticsRequest {
        request_id: String,
        requester_id: String,
        data_scope: String,
        purpose: String,
        timestamp: DateTime<Utc>,
        signature: String,
    },
    AnalyticsResult {
        request_id: String,
        result_id: String,
        result_summary: String,
        timestamp: DateTime<Utc>,
        signature: String,
    },
    CreatePrescription {
        prescription_id: String,
        patient_id: String,
        provider_id: String,
        medication_details: String,
        dosage: String,
        duration: String,
        timestamp: DateTime<Utc>,
        signature: String,
    },
    UpdatePrescription {
        prescription_id: String,
        updates: HashMap<String, String>,
        provider_id: String,
        timestamp: DateTime<Utc>,
        signature: String,
    },
    // Adding missing transaction types
    ComplianceAudit {
        audit_id: String,
        standard: ComplianceStandard,
        auditor_id: String,
        timestamp: DateTime<Utc>,
        signature: String,
    },
    GovernancePolicy {
        policy_id: String,
        policy_type: String,
        policy_data: String,
        approved_by: String,
        timestamp: DateTime<Utc>,
        signature: String,
    },
    ConsensusMethod {
        method_id: String,
        consensus_type: ConsensusType,
        parameters: HashMap<String, String>,
        timestamp: DateTime<Utc>,
        signature: String,
    },
    ScalabilitySolution {
        solution_id: String,
        solution_type: ScalabilitySolution,
        parameters: HashMap<String, String>,
        timestamp: DateTime<Utc>,
        signature: String,
    },
    EncryptionMethod {
        method_id: String,
        encryption_type: EncryptionType,
        parameters: HashMap<String, String>,
        timestamp: DateTime<Utc>,
        signature: String,
    },
    // Mobile and IoT integration
    RegisterMobileDevice {
        device_id: String,
        patient_id: String,
        device_type: String,
        manufacturer: String,
        model: String,
        timestamp: DateTime<Utc>,
        signature: String,
    },
    RegisterIoTDevice {
        device_id: String,
        patient_id: String,
        device_type: IoTDeviceType,
        manufacturer: String,
        model: String,
        timestamp: DateTime<Utc>,
        signature: String,
    },
    MonitoringData {
        data_id: String,
        device_id: String,
        patient_id: String,
        data_type: String,
        data: String,
        timestamp: DateTime<Utc>,
        signature: String,
    },
    CollaborativeCareNote {
        note_id: String,
        patient_id: String,
        provider_id: String,
        collaborators: Vec<String>,
        note_content: String,
        timestamp: DateTime<Utc>,
        signature: String,
    },
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Transaction {
    pub transaction_id: String,
    pub transaction_type: TransactionType,
    pub timestamp: DateTime<Utc>,
    pub signature: Option<String>,
}

impl Transaction {
    pub fn new(transaction_type: TransactionType, signature: Option<String>) -> Self {
        let transaction_id = Self::generate_transaction_id(&transaction_type);
        Self {
            transaction_id,
            transaction_type,
            timestamp: Utc::now(),
            signature,
        }
    }

    fn generate_transaction_id(transaction_type: &TransactionType) -> String {
        let now = SystemTime::now()
            .duration_since(SystemTime::UNIX_EPOCH)
            .expect("Time went backwards")
            .as_millis();
        
        let mut hasher = Sha256::new();
        let serialized = serde_json::to_string(&transaction_type).unwrap_or_default();
        hasher.update(serialized.as_bytes());
        hasher.update(now.to_string().as_bytes());
        
        format!("{:x}", hasher.finalize())
    }
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Block {
    pub index: u64,
    pub timestamp: DateTime<Utc>,
    pub transactions: Vec<Transaction>,
    pub previous_hash: String,
    pub hash: String,
    pub nonce: u64,
}

impl Block {
    pub fn new(index: u64, transactions: Vec<Transaction>, previous_hash: &str) -> Result<Self, BlockchainError> {
        let mut block = Block {
            index,
            timestamp: Utc::now(),
            transactions,
            previous_hash: previous_hash.to_string(),
            hash: String::new(),
            nonce: 0,
        };
        
        block.mine(2); // Difficulty level 2 (adjust as needed)
        Ok(block)
    }
    
    pub fn genesis() -> Self {
        let mut block = Block {
            index: 0,
            timestamp: Utc::now(),
            transactions: Vec::new(),
            previous_hash: String::from("0"),
            hash: String::new(),
            nonce: 0,
        };
        
        block.mine(2);
        block
    }
    
    fn calculate_hash(&self) -> Result<String, BlockchainError> {
        let mut hasher = Sha256::new();
        
        let block_data = format!(
            "{}{}{}{}{}",
            self.index,
            self.timestamp.to_rfc3339(),
            serde_json::to_string(&self.transactions).map_err(|e| BlockchainError::SerializationError(e.to_string()))?,
            self.previous_hash,
            self.nonce
        );
        
        hasher.update(block_data.as_bytes());
        Ok(format!("{:x}", hasher.finalize()))
    }
    
    fn mine(&mut self, difficulty: usize) {
        let target = "0".repeat(difficulty);
        
        loop {
            self.hash = self.calculate_hash().unwrap_or_default();
            if self.hash.starts_with(&target) {
                break;
            }
            self.nonce += 1;
        }
    }
    
    pub fn is_valid(&self) -> Result<bool, BlockchainError> {
        let calculated_hash = self.calculate_hash()?;
        Ok(calculated_hash == self.hash)
    }
}

impl fmt::Display for Block {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(
            f,
            "Block #{} [Hash: {}, Previous Hash: {}, Transactions: {}, Nonce: {}]",
            self.index,
            self.hash,
            self.previous_hash,
            self.transactions.len(),
            self.nonce
        )
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct CacheConfig {
    pub record_cache_size: usize,
    pub block_cache_size: usize,
    pub access_control_cache_size: usize,
    pub cache_ttl_seconds: u64,
}

impl Default for CacheConfig {
    fn default() -> Self {
        CacheConfig {
            record_cache_size: 1000,
            block_cache_size: 100,
            access_control_cache_size: 500,
            cache_ttl_seconds: 300, // 5 minutes
        }
    }
}

#[derive(Clone, Debug)]
pub struct RateLimitConfig {
    pub max_transactions_per_minute: usize,
    pub max_queries_per_minute: usize,
    pub max_mining_attempts_per_minute: usize,
}

impl Default for RateLimitConfig {
    fn default() -> Self {
        RateLimitConfig {
            max_transactions_per_minute: 100,
            max_queries_per_minute: 500,
            max_mining_attempts_per_minute: 10,
        }
    }
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct OffChainReference {
    pub storage_type: String, // e.g., "IPFS", "S3", "Azure"
    pub reference_id: String,  // e.g., IPFS hash, S3 URL
    pub encryption_key_id: Option<String>,
    pub size_bytes: usize,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug)]
pub struct Blockchain {
    pub chain: Vec<Block>,
    pub pending_transactions: Vec<Transaction>,
    pub difficulty: usize,
    pub mining_reward: f64,
    // New fields for performance optimization
    record_cache: RwLock<LruCache<String, (HealthRecord, DateTime<Utc>)>>,
    block_cache: RwLock<LruCache<u64, (Block, DateTime<Utc>)>>,
    access_control_cache: RwLock<LruCache<String, (Vec<AccessControl>, DateTime<Utc>)>>,
    transaction_counts: RwLock<HashMap<String, (usize, DateTime<Utc>)>>, // IP -> (count, last_reset)
    query_counts: RwLock<HashMap<String, (usize, DateTime<Utc>)>>, // IP -> (count, last_reset)
    mining_counts: RwLock<HashMap<String, (usize, DateTime<Utc>)>>, // IP -> (count, last_reset)
    pub cache_config: CacheConfig,
    pub rate_limit_config: RateLimitConfig,
    pub consensus_type: ConsensusType,
    pub validators: HashSet<String>, // For PoA and DPoS
}

impl Blockchain {
    pub fn new(difficulty: usize, mining_reward: f64) -> Self {
        let mut chain = Vec::new();
        chain.push(Block::genesis());
        
        let record_cache_size = NonZeroUsize::new(1000).unwrap();
        let block_cache_size = NonZeroUsize::new(100).unwrap();
        let access_control_cache_size = NonZeroUsize::new(500).unwrap();
        
        Blockchain {
            chain,
            pending_transactions: Vec::new(),
            difficulty,
            mining_reward,
            record_cache: RwLock::new(LruCache::new(record_cache_size)),
            block_cache: RwLock::new(LruCache::new(block_cache_size)),
            access_control_cache: RwLock::new(LruCache::new(access_control_cache_size)),
            transaction_counts: RwLock::new(HashMap::new()),
            query_counts: RwLock::new(HashMap::new()),
            mining_counts: RwLock::new(HashMap::new()),
            cache_config: CacheConfig::default(),
            rate_limit_config: RateLimitConfig::default(),
            consensus_type: ConsensusType::ProofOfWork,
            validators: HashSet::new(),
        }
    }
    
    // Configure caching parameters
    pub fn configure_cache(&mut self, config: CacheConfig) {
        // Clone config before moving it
        self.cache_config = config.clone();
        
        let record_cache_size = NonZeroUsize::new(config.record_cache_size).unwrap();
        let block_cache_size = NonZeroUsize::new(config.block_cache_size).unwrap();
        let access_control_cache_size = NonZeroUsize::new(config.access_control_cache_size).unwrap();
        
        self.record_cache = RwLock::new(LruCache::new(record_cache_size));
        self.block_cache = RwLock::new(LruCache::new(block_cache_size));
        self.access_control_cache = RwLock::new(LruCache::new(access_control_cache_size));
    }
    
    // Configure rate limiting parameters
    pub fn configure_rate_limits(&mut self, config: RateLimitConfig) {
        self.rate_limit_config = config;
    }
    
    // Set consensus mechanism
    pub fn set_consensus_mechanism(&mut self, consensus_type: ConsensusType) {
        self.consensus_type = consensus_type;
    }
    
    // Add validator for PoA or DPoS
    pub fn add_validator(&mut self, validator_id: String) {
        self.validators.insert(validator_id);
    }
    
    // Remove validator
    pub fn remove_validator(&mut self, validator_id: &str) {
        self.validators.remove(validator_id);
    }
    
    // Check rate limits for transactions
    pub fn check_transaction_rate_limit(&self, ip_address: &str) -> Result<(), BlockchainError> {
        let mut counts = self.transaction_counts.write().unwrap();
        let now = Utc::now();
        
        if let Some((count, last_reset)) = counts.get_mut(ip_address) {
            // Reset counter if a minute has passed
            if (now - *last_reset).num_seconds() >= 60 {
                *count = 1;
                *last_reset = now;
                return Ok(());
            }
            
            // Check if limit exceeded
            if *count >= self.rate_limit_config.max_transactions_per_minute {
                return Err(BlockchainError::RateLimitExceeded);
            }
            
            // Increment counter
            *count += 1;
        } else {
            // First transaction from this IP
            counts.insert(ip_address.to_string(), (1, now));
        }
        
        Ok(())
    }
    
    // Check rate limits for queries
    pub fn check_query_rate_limit(&self, ip_address: &str) -> Result<(), BlockchainError> {
        let mut counts = self.query_counts.write().unwrap();
        let now = Utc::now();
        
        if let Some((count, last_reset)) = counts.get_mut(ip_address) {
            // Reset counter if a minute has passed
            if (now - *last_reset).num_seconds() >= 60 {
                *count = 1;
                *last_reset = now;
                return Ok(());
            }
            
            // Check if limit exceeded
            if *count >= self.rate_limit_config.max_queries_per_minute {
                return Err(BlockchainError::RateLimitExceeded);
            }
            
            // Increment counter
            *count += 1;
        } else {
            // First query from this IP
            counts.insert(ip_address.to_string(), (1, now));
        }
        
        Ok(())
    }
    
    // Enhanced add_transaction with validation
    pub fn add_transaction(&mut self, transaction: Transaction) -> Result<(), BlockchainError> {
        // Validate transaction based on type
        match &transaction.transaction_type {
            TransactionType::CreateRecord(record) => {
                // Validate record data
                if record.patient_id.is_empty() || record.provider_id.is_empty() {
                    return Err(BlockchainError::ValidationError("Missing patient or provider ID".to_string()));
                }
                
                // Check for duplicate record ID
                if self.find_record_by_id(&record.record_id).is_some() {
                    return Err(BlockchainError::ValidationError("Record ID already exists".to_string()));
                }
            },
            // Add validation for other transaction types as needed
            _ => {}
        }
        
        self.pending_transactions.push(transaction);
        Ok(())
    }
    
    // Enhanced mine_pending_transactions with consensus mechanisms
    pub fn mine_pending_transactions(&mut self) -> Result<Block, BlockchainError> {
        if self.pending_transactions.is_empty() {
            return Err(BlockchainError::InvalidBlockIndex);
        }
        
        let transactions = self.pending_transactions.clone();
        
        // Apply different consensus mechanisms
        match self.consensus_type {
            ConsensusType::ProofOfWork => {
                // Standard PoW mining
                let previous_block = self.chain.last().ok_or(BlockchainError::InvalidBlockIndex)?;
                let mut new_block = Block::new(
                    previous_block.index + 1,
                    transactions,
                    &previous_block.hash,
                )?;
                
                // Mine the block with proof of work
                new_block.mine(self.difficulty);
                
                self.chain.push(new_block.clone());
                self.pending_transactions.clear();
                
                // Update block cache
                if let Ok(mut cache) = self.block_cache.write() {
                    cache.put(new_block.index, (new_block.clone(), Utc::now()));
                }
                
                Ok(new_block)
            },
            ConsensusType::ProofOfAuthority => {
                // PoA - validate if the miner is an authorized validator
                let miner_id = "validator_1"; // This would come from the request in a real system
                
                if !self.validators.contains(miner_id) {
                    return Err(BlockchainError::ConsensusError("Not an authorized validator".to_string()));
                }
                
                let previous_block = self.chain.last().ok_or(BlockchainError::InvalidBlockIndex)?;
                let new_block = Block::new(
                    previous_block.index + 1,
                    transactions,
                    &previous_block.hash,
                )?;
                
                self.chain.push(new_block.clone());
                self.pending_transactions.clear();
                
                // Update block cache
                if let Ok(mut cache) = self.block_cache.write() {
                    cache.put(new_block.index, (new_block.clone(), Utc::now()));
                }
                
                Ok(new_block)
            },
            ConsensusType::PracticalByzantineFaultTolerance => {
                // Simplified PBFT - in a real system this would involve multiple rounds of voting
                let previous_block = self.chain.last().ok_or(BlockchainError::InvalidBlockIndex)?;
                let new_block = Block::new(
                    previous_block.index + 1,
                    transactions,
                    &previous_block.hash,
                )?;
                
                // Simulate PBFT consensus (would be more complex in reality)
                let consensus_achieved = true; // This would be the result of validator voting
                
                if !consensus_achieved {
                    return Err(BlockchainError::ConsensusError("PBFT consensus not achieved".to_string()));
                }
                
                self.chain.push(new_block.clone());
                self.pending_transactions.clear();
                
                // Update block cache
                if let Ok(mut cache) = self.block_cache.write() {
                    cache.put(new_block.index, (new_block.clone(), Utc::now()));
                }
                
                Ok(new_block)
            },
            ConsensusType::DelegatedProofOfStake => {
                // DPoS - check if the miner is a elected delegate
                let miner_id = "delegate_1"; // This would come from the request in a real system
                
                if !self.validators.contains(miner_id) {
                    return Err(BlockchainError::ConsensusError("Not an elected delegate".to_string()));
                }
                
                let previous_block = self.chain.last().ok_or(BlockchainError::InvalidBlockIndex)?;
                let new_block = Block::new(
                    previous_block.index + 1,
                    transactions,
                    &previous_block.hash,
                )?;
                
                self.chain.push(new_block.clone());
                self.pending_transactions.clear();
                
                // Update block cache
                if let Ok(mut cache) = self.block_cache.write() {
                    cache.put(new_block.index, (new_block.clone(), Utc::now()));
                }
                
                Ok(new_block)
            }
        }
    }
    
    // Enhanced find_record_by_id with caching
    pub fn find_record_by_id(&self, record_id: &str) -> Option<HealthRecord> {
        // Check cache first
        if let Ok(cache) = self.record_cache.read() {
            if let Some((record, timestamp)) = cache.peek(record_id) {
                let now = Utc::now();
                let cache_ttl = Duration::from_secs(self.cache_config.cache_ttl_seconds);
                
                // Return cached record if it's still valid
                if (now - *timestamp).num_seconds() < cache_ttl.as_secs() as i64 {
                    return Some(record.clone());
                }
            }
        }
        
        // Cache miss, search in blockchain
        for block in &self.chain {
            for transaction in &block.transactions {
                if let TransactionType::CreateRecord(record) = &transaction.transaction_type {
                    if record.record_id == record_id {
                        // Update cache with found record
                        if let Ok(mut cache) = self.record_cache.write() {
                            cache.put(record_id.to_string(), (record.clone(), Utc::now()));
                        }
                        return Some(record.clone());
                    }
                }
            }
        }
        
        None
    }
    
    // Enhanced get_patient_records with caching and pagination
    pub fn get_patient_records(&self, patient_id: &str, page: usize, page_size: usize) -> Vec<HealthRecord> {
        let mut records = Vec::new();
        
        for block in &self.chain {
            for transaction in &block.transactions {
                if let TransactionType::CreateRecord(record) = &transaction.transaction_type {
                    if record.patient_id == patient_id {
                        records.push(record.clone());
                    }
                }
            }
        }
        
        // Sort records by timestamp (newest first)
        records.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));
        
        // Apply pagination
        let start = page * page_size;
        let end = std::cmp::min(start + page_size, records.len());
        
        if start < records.len() {
            records[start..end].to_vec()
        } else {
            Vec::new()
        }
    }
    
    // Enhanced get_access_controls with caching
    pub fn get_access_controls(&self, patient_id: &str) -> Vec<AccessControl> {
        // Check cache first
        if let Ok(cache) = self.access_control_cache.read() {
            if let Some((controls, timestamp)) = cache.peek(patient_id) {
                let now = Utc::now();
                let cache_ttl = Duration::from_secs(self.cache_config.cache_ttl_seconds);
                
                // Return cached controls if still valid
                if (now - *timestamp).num_seconds() < cache_ttl.as_secs() as i64 {
                    return controls.clone();
                }
            }
        }
        
        // Cache miss, search in blockchain
        let mut controls = Vec::new();
        
        for block in &self.chain {
            for transaction in &block.transactions {
                if let TransactionType::GrantAccess(access) = &transaction.transaction_type {
                    if access.patient_id == patient_id {
                        controls.push(access.clone());
                    }
                }
            }
        }
        
        // Update cache with found controls
        if !controls.is_empty() {
            if let Ok(mut cache) = self.access_control_cache.write() {
                cache.put(patient_id.to_string(), (controls.clone(), Utc::now()));
            }
        }
        
        controls
    }
    
    // Enhanced check_access with improved security
    pub fn check_access(&self, user_id: &str, record_id: &str) -> Result<bool, BlockchainError> {
        let record = self.find_record_by_id(record_id).ok_or(BlockchainError::RecordNotFound)?;
        
        // Patient always has access to their own records
        if user_id == record.patient_id {
            // Log access for audit trail
            self.log_access_attempt(user_id, record_id, true, "Self access");
            return Ok(true);
        }
        
        // Provider who created the record has access
        if user_id == record.provider_id {
            // Log access for audit trail
            self.log_access_attempt(user_id, record_id, true, "Provider access");
            return Ok(true);
        }
        
        // Check access controls
        let access_controls = self.get_access_controls(&record.patient_id);
        let now = Utc::now();
        
        for access in access_controls {
            if let Some(provider_id) = &access.provider_id {
                if provider_id == user_id {
                    // Check if access has expired
                    if let Some(expires_at) = access.expires_at {
                        if expires_at < now {
                            self.log_access_attempt(user_id, record_id, false, "Expired access");
                            continue;
                        }
                    }
                    
                    // Check if access is limited to specific record types
                    if let Some(specific_types) = &access.specific_record_types {
                        if !specific_types.contains(&record.record_type) {
                            self.log_access_attempt(user_id, record_id, false, "Record type not allowed");
                            continue;
                        }
                    }
                    
                    // Log successful access for audit trail
                    self.log_access_attempt(user_id, record_id, true, "Granted access");
                    return Ok(true);
                }
            }
        }
        
        // Log failed access attempt for audit trail
        self.log_access_attempt(user_id, record_id, false, "No access granted");
        Err(BlockchainError::AccessDenied)
    }
    
    // New method to log access attempts for audit trail
    fn log_access_attempt(&self, user_id: &str, record_id: &str, success: bool, reason: &str) {
        // In a real implementation, this would add a transaction to the blockchain
        // For now, we'll just print to console for demonstration
        println!("Access log: User {} {} access to record {}. Reason: {}", 
            user_id, 
            if success { "granted" } else { "denied" }, 
            record_id,
            reason
        );
    }
    
    // New method to store large data off-chain
    pub fn store_off_chain_data(&self, data: &[u8], storage_type: &str) -> Result<OffChainReference, BlockchainError> {
        // In a real implementation, this would store data in IPFS, S3, etc.
        // For demonstration, we'll create a mock reference
        
        // Calculate hash of data for reference ID
        let mut hasher = Sha256::new();
        hasher.update(data);
        let hash = format!("{:x}", hasher.finalize());
        
        let reference = OffChainReference {
            storage_type: storage_type.to_string(),
            reference_id: hash.clone(),
            encryption_key_id: Some("key_123".to_string()),
            size_bytes: data.len(),
            created_at: Utc::now(),
        };
        
        // In a real implementation, this would actually store the data
        println!("Stored {} bytes in {} with reference {}", data.len(), storage_type, hash);
        
        Ok(reference)
    }
    
    // New method to retrieve off-chain data
    pub fn retrieve_off_chain_data(&self, reference: &OffChainReference) -> Result<Vec<u8>, BlockchainError> {
        // In a real implementation, this would retrieve data from IPFS, S3, etc.
        // For demonstration, we'll return a mock response
        
        println!("Retrieved data from {} with reference {}", reference.storage_type, reference.reference_id);
        
        // Return mock data
        Ok(vec![0; reference.size_bytes])
    }
    
    // New method for data pruning
    pub fn prune_old_data(&mut self, older_than_days: i64) -> Result<usize, BlockchainError> {
        let cutoff_date = Utc::now() - chrono::Duration::days(older_than_days);
        let mut pruned_count = 0;
        
        // In a real implementation, this would archive old blocks
        // For demonstration, we'll just count how many would be pruned
        for block in &self.chain {
            if block.timestamp < cutoff_date {
                pruned_count += 1;
            }
        }
        
        println!("Would prune {} blocks older than {} days", pruned_count, older_than_days);
        
        Ok(pruned_count)
    }
    
    // New method for periodic blockchain validation
    pub fn validate_blockchain_integrity(&self) -> Result<bool, BlockchainError> {
        // Check each block's hash and links
        for i in 1..self.chain.len() {
            let current_block = &self.chain[i];
            let previous_block = &self.chain[i - 1];
            
            // Verify block hash
            let calculated_hash = current_block.calculate_hash()?;
            if calculated_hash != current_block.hash {
                return Ok(false);
            }
            
            // Verify link to previous block
            if current_block.previous_hash != previous_block.hash {
                return Ok(false);
            }
            
            // Verify block index
            if current_block.index != previous_block.index + 1 {
                return Ok(false);
            }
        }
        
        Ok(true)
    }
}
