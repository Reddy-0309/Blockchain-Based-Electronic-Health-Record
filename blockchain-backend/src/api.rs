use rocket::http::Status;
use rocket::request::{self, FromRequest, Request};
use rocket::response::status;
use rocket::serde::json::Json;
use rocket::State;
use rocket::{get, post, routes};
use std::collections::HashMap;
use std::sync::{Mutex, Arc};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use validator::Validate;
use uuid::Uuid;
use sha2::{Sha256, Digest};

use crate::blockchain::{Blockchain, HealthRecord, TransactionType, Transaction, EncryptionType, 
    ConsensusType, ScalabilitySolution, IoTDeviceType, ComplianceStandard, RecordType, AccessLevel, AccessControl};
use crate::error::{AppError, AppResult};
use crate::pagination::paginate;
use crate::validation::ValidatedJson;

// Rate limiting guard
pub struct RateLimitGuard {
    ip_address: String,
}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for RateLimitGuard {
    type Error = String;

    async fn from_request(request: &'r Request<'_>) -> request::Outcome<Self, Self::Error> {
        // Get client IP address
        let ip = request.client_ip().map(|ip| ip.to_string()).unwrap_or_else(|| "unknown".to_string());
        
        // Get blockchain instance
        if let Some(blockchain) = request.rocket().state::<Arc<Mutex<Blockchain>>>() {
            // Check rate limit (in a real system, this would be more sophisticated)
            // For now, just check if there are too many pending transactions
            let result = {
                let mut blockchain = blockchain.lock().unwrap();
                
                // Simple rate limiting logic
                if blockchain.pending_transactions.len() < 100 {
                    Ok(())
                } else {
                    // Too many pending transactions, enforce rate limit
                    Err("Too many pending transactions")
                }
            };
            
            match result {
                Ok(_) => request::Outcome::Success(RateLimitGuard { ip_address: ip }),
                Err(_) => request::Outcome::Error((Status::TooManyRequests, "Rate limit exceeded".to_string())),
            }
        } else {
            // If we can't get the blockchain instance, allow the request
            request::Outcome::Success(RateLimitGuard { ip_address: "unknown".to_string() })
        }
    }
}

// Input validation for request structs
#[derive(Serialize, Deserialize, Validate)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub message: String,
    pub data: Option<T>,
}

#[derive(Serialize, Deserialize, Validate)]
pub struct CreateRecordRequest {
    #[validate(length(min = 1, message = "Patient ID cannot be empty"))]
    pub patient_id: String,
    
    #[validate(length(min = 1, message = "Provider ID cannot be empty"))]
    pub provider_id: String,
    
    #[validate(length(min = 1, message = "Record type cannot be empty"))]
    pub record_type: String,
    
    #[validate(length(min = 1, message = "Data cannot be empty"))]
    pub data: String,
    
    pub metadata: std::collections::HashMap<String, String>,
    
    #[validate(length(min = 1, message = "Signature cannot be empty"))]
    pub signature: String,
    
    // New field for off-chain storage
    pub off_chain_data: Option<bool>,
}

#[derive(Serialize, Deserialize)]
pub struct BlockchainInfoResponse {
    pub chain_length: usize,
    pub is_valid: bool,
    pub pending_transactions: usize,
}

#[derive(Serialize, Deserialize)]
pub struct GrantAccessRequest {
    pub patient_id: String,
    pub provider_id: String,
    pub access_level: String,
    pub expires_at: Option<String>,
    pub specific_record_types: Option<Vec<String>>,
    pub emergency_reason: Option<String>,
    pub auto_revoke_condition: Option<String>,
    pub delegate_info: Option<String>,
    pub consent_proof: Option<String>,
    pub signature: String,
}

#[derive(Serialize, Deserialize)]
pub struct AccessRecordRequest {
    pub record_id: String,
    pub accessor_id: String,
    pub access_reason: String,
}

#[derive(Serialize, Deserialize)]
pub struct CreateSmartContractRequest {
    pub contract_type: String,
    pub parties: Vec<String>,
    pub conditions: String,
    pub signature: String,
}

#[derive(Serialize, Deserialize)]
pub struct ExecuteSmartContractRequest {
    pub contract_id: String,
    pub execution_params: std::collections::HashMap<String, String>,
    pub signature: String,
}

#[derive(Serialize, Deserialize)]
pub struct PatientDataContributionRequest {
    pub patient_id: String,
    pub data_type: String,
    pub data: String,
    pub signature: String,
}

#[derive(Serialize, Deserialize)]
pub struct ImportExternalRecordRequest {
    pub patient_id: String,
    pub source_system: String,
    pub record_type: String,
    pub data: String,
    pub signature: String,
}

#[derive(Serialize, Deserialize)]
pub struct ExportRecordRequest {
    pub record_id: String,
    pub destination_system: String,
    pub signature: String,
}

#[derive(Serialize, Deserialize)]
pub struct AnalyticsRequestData {
    pub requester_id: String,
    pub data_scope: String,
    pub purpose: String,
    pub signature: String,
}

#[derive(Serialize, Deserialize)]
pub struct PrescriptionRequest {
    pub patient_id: String,
    pub provider_id: String,
    pub medication_details: String,
    pub dosage: String,
    pub duration: String,
    pub signature: String,
}

#[derive(Serialize, Deserialize)]
pub struct CollaborativeCareNoteRequest {
    pub patient_id: String,
    pub provider_id: String,
    pub collaborators: Vec<String>,
    pub content: String,
    pub signature: String,
}

#[derive(Serialize, Deserialize)]
pub struct RegisterMobileDeviceRequest {
    pub patient_id: String,
    pub device_type: String,
    pub app_version: String,
    pub signature: String,
}

#[derive(Serialize, Deserialize)]
pub struct RegisterIoTDeviceRequest {
    pub patient_id: String,
    pub device_type: String,
    pub manufacturer: String,
    pub model: String,
    pub signature: String,
}

#[derive(Serialize, Deserialize)]
pub struct SubmitMobileDataRequest {
    pub patient_id: String,
    pub device_id: String,
    pub data_type: String,
    pub data: String,
    pub signature: String,
}

#[derive(Serialize, Deserialize)]
pub struct SubmitIoTDataRequest {
    pub patient_id: String,
    pub device_id: String,
    pub device_type: String,
    pub data: String,
    pub signature: String,
}

#[derive(Serialize, Deserialize)]
pub struct ComplianceAuditRequest {
    pub standard: String,
    pub auditor: String,
    pub findings: String,
    pub signature: String,
}

#[derive(Serialize, Deserialize)]
pub struct GovernancePolicyRequest {
    pub policy_type: String,
    pub policy_content: String,
    pub approved_by: String,
    pub signature: String,
}

#[derive(Serialize, Deserialize)]
pub struct ConsensusMethodRequest {
    pub old_method: String,
    pub new_method: String,
    pub reason: String,
    pub approved_by: String,
    pub signature: String,
}

#[derive(Serialize, Deserialize)]
pub struct ScalabilitySolutionRequest {
    pub solution_type: String,
    pub configuration: String,
    pub approved_by: String,
    pub signature: String,
}

#[derive(Serialize, Deserialize)]
pub struct EncryptionMethodRequest {
    pub old_method: String,
    pub new_method: String,
    pub affected_records: Vec<String>,
    pub approved_by: String,
    pub signature: String,
}

#[get("/")]
pub fn index() -> &'static str {
    "Blockchain-Based Electronic Health Records API"
}

// New health check endpoint
#[get("/health")]
pub fn health_check(blockchain: &State<Arc<Mutex<Blockchain>>>) -> Json<HealthCheckResponse> {
    let mut blockchain = blockchain.lock().unwrap();
    let chain_valid = blockchain.validate_blockchain_integrity().unwrap_or(false);
    
    Json(HealthCheckResponse {
        status: "ok".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
        uptime: 0, // This would be calculated from system start time
        blockchain_status: if chain_valid { "valid".to_string() } else { "invalid".to_string() },
        node_info: HashMap::new(), // This would include system info in a real implementation
    })
}

#[get("/blockchain/info")]
pub fn blockchain_info(blockchain: &State<Arc<Mutex<Blockchain>>>, _rate_limit: RateLimitGuard) -> Json<ApiResponse<BlockchainInfoResponse>> {
    let blockchain = blockchain.lock().unwrap();
    
    let response = BlockchainInfoResponse {
        chain_length: blockchain.chain.len(),
        is_valid: blockchain.validate_blockchain_integrity().unwrap_or(false),
        pending_transactions: blockchain.pending_transactions.len(),
    };
    
    Json(ApiResponse {
        success: true,
        message: "Blockchain information retrieved successfully".to_string(),
        data: Some(response),
    })
}

// Enhanced create_record with input validation and off-chain storage
#[post("/records/create", format = "json", data = "<request>")]
pub fn create_record(
    request: Json<CreateRecordRequest>,
    blockchain: &State<Arc<Mutex<Blockchain>>>,
    _rate_limit: RateLimitGuard
) -> status::Custom<Json<ApiResponse<String>>> {
    // Validate request
    if let Err(errors) = request.validate() {
        return status::Custom(
            Status::BadRequest,
            Json(ApiResponse {
                success: false,
                message: format!("Validation error: {:?}", errors),
                data: None,
            }),
        );
    }
    
    let mut blockchain = blockchain.lock().unwrap();
    
    // Parse record type
    let record_type = match request.record_type.as_str() {
        "Diagnosis" => RecordType::Diagnosis,
        "Medication" => RecordType::Medication,
        "LabResult" => RecordType::LabResult,
        "Procedure" => RecordType::Procedure,
        "Immunization" => RecordType::Immunization,
        "Allergy" => RecordType::Allergy,
        "Vital" => RecordType::Vital,
        "Note" => RecordType::Note,
        "PatientContribution" => RecordType::PatientContribution,
        "WearableData" => RecordType::WearableData,
        "RemoteMonitoring" => RecordType::RemoteMonitoring,
        "FHIRResource" => RecordType::FHIRResource,
        "HL7Message" => RecordType::HL7Message,
        "Prescription" => RecordType::Prescription,
        "ClinicalDecision" => RecordType::ClinicalDecision,
        "ResearchData" => RecordType::ResearchData,
        "MobileData" => RecordType::MobileData,
        "IoTDeviceData" => RecordType::IoTDeviceData,
        _ => RecordType::Note, // Default
    };
    
    // Generate a unique record ID
    let record_id = format!("record_{}", Uuid::new_v4());
    
    // Create a hash of the record for integrity verification
    let mut hasher = Sha256::new();
    hasher.update(request.data.as_bytes());
    let hash = format!("{:x}", hasher.finalize());
    
    // Handle off-chain data if requested
    let off_chain_reference = if request.off_chain_data.unwrap_or(false) && request.data.len() > 1024 {
        // For large data, store off-chain
        match blockchain.store_off_chain_data(request.data.as_bytes(), "IPFS") {
            Ok(reference) => Some(reference),
            Err(e) => {
                return status::Custom(
                    Status::InternalServerError,
                    Json(ApiResponse {
                        success: false,
                        message: format!("Failed to store off-chain data: {}", e),
                        data: None,
                    }),
                );
            }
        }
    } else {
        None
    };
    
    // Create health record
    let record = HealthRecord {
        record_id: record_id.clone(),
        patient_id: request.patient_id.clone(),
        provider_id: request.provider_id.clone(),
        record_type,
        timestamp: chrono::Utc::now(),
        data: request.data.clone(),
        metadata: request.metadata.clone(),
        signature: request.signature.clone(),
        version: 1, // Initial version
        off_chain_data: off_chain_reference,
        last_accessed: None,
        data_hash: Some(hash),
    };
    
    let transaction = Transaction::new(
        TransactionType::CreateRecord(record),
        Some(request.signature.clone()),
    );
    
    // Add transaction with validation
    if let Err(e) = blockchain.add_transaction(transaction) {
        return status::Custom(
            Status::BadRequest,
            Json(ApiResponse {
                success: false,
                message: format!("Failed to add transaction: {}", e),
                data: None,
            }),
        );
    }
    
    match blockchain.mine_pending_transactions() {
        Ok(_) => status::Custom(
            Status::Created,
            Json(ApiResponse {
                success: true,
                message: "Health record created successfully".to_string(),
                data: Some(record_id),
            }),
        ),
        Err(e) => status::Custom(
            Status::InternalServerError,
            Json(ApiResponse {
                success: false,
                message: format!("Failed to mine transaction: {}", e),
                data: None,
            }),
        ),
    }
}

// Enhanced get_patient_records with pagination
#[get("/records/patient/<patient_id>?<page>&<page_size>")]
pub fn get_patient_records(
    patient_id: String,
    page: Option<usize>,
    page_size: Option<usize>,
    blockchain: &State<Arc<Mutex<Blockchain>>>,
    _rate_limit: RateLimitGuard
) -> Json<ApiResponse<PaginatedResponse<HealthRecord>>> {
    let blockchain = blockchain.lock().unwrap();
    
    // Default pagination parameters
    let page = page.unwrap_or(0);
    let page_size = page_size.unwrap_or(10).min(100); // Cap page size at 100
    
    // Get all records to calculate total
    let all_records = blockchain.get_patient_records(&patient_id, 0, usize::MAX);
    let total_records = all_records.len();
    
    // Get paginated records
    let records = blockchain.get_patient_records(&patient_id, page, page_size);
    
    // Calculate total pages
    let total_pages = (total_records + page_size - 1) / page_size;
    
    let paginated_response = PaginatedResponse {
        items: records,
        total_items: total_records,
        page,
        page_size,
        total_pages,
    };
    
    Json(ApiResponse {
        success: true,
        message: format!("Retrieved records for patient {}", patient_id),
        data: Some(paginated_response),
    })
}

// New endpoint for blockchain validation
#[get("/blockchain/validate")]
pub fn validate_blockchain(blockchain: &State<Arc<Mutex<Blockchain>>>) -> Json<ApiResponse<bool>> {
    let mut blockchain = blockchain.lock().unwrap();
    
    match blockchain.validate_blockchain_integrity() {
        Ok(is_valid) => Json(ApiResponse {
            success: true,
            message: if is_valid { "Blockchain is valid".to_string() } else { "Blockchain integrity issues detected".to_string() },
            data: Some(is_valid),
        }),
        Err(e) => Json(ApiResponse {
            success: false,
            message: format!("Error validating blockchain: {}", e),
            data: None,
        }),
    }
}

// New endpoint for data pruning
#[post("/blockchain/prune?<days>")]
pub fn prune_blockchain_data(
    days: Option<i64>,
    blockchain: &State<Arc<Mutex<Blockchain>>>
) -> Json<ApiResponse<usize>> {
    let mut blockchain = blockchain.lock().unwrap();
    let days = days.unwrap_or(365); // Default to 1 year
    
    // Prune old data from the blockchain
    match blockchain.prune_old_data(days) {
        Ok(count) => Json(ApiResponse {
            success: true,
            message: format!("Successfully pruned {} old records", count),
            data: Some(count),
        }),
        Err(e) => Json(ApiResponse {
            success: false,
            message: format!("Failed to prune old data: {}", e),
            data: Some(0),
        }),
    }
}

// New endpoint for retrieving off-chain data
#[get("/records/off-chain/<record_id>")]
pub fn get_off_chain_data(
    record_id: String,
    blockchain: &State<Arc<Mutex<Blockchain>>>,
    _rate_limit: RateLimitGuard
) -> status::Custom<Json<ApiResponse<String>>> {
    let blockchain = blockchain.lock().unwrap();
    
    // Find the record in the blockchain
    match blockchain.find_record_by_id(&record_id) {
        Some(record) => {
            // Check if the record has off-chain data
            if let Some(off_chain_ref) = &record.off_chain_data {
                // In a real system, this would retrieve data from a distributed storage
                // For this demo, we'll just return the reference information
                status::Custom(
                    Status::Ok,
                    Json(ApiResponse {
                        success: true,
                        message: "Off-chain data reference retrieved".to_string(),
                        data: Some(format!("Storage type: {}, Reference ID: {}, Size: {} bytes", 
                            off_chain_ref.storage_type, off_chain_ref.reference_id, off_chain_ref.size_bytes))
                    })
                )
            } else {
                status::Custom(
                    Status::NotFound,
                    Json(ApiResponse {
                        success: false,
                        message: "Record does not have off-chain data".to_string(),
                        data: None
                    })
                )
            }
        },
        None => status::Custom(
            Status::NotFound,
            Json(ApiResponse {
                success: false,
                message: "Record not found".to_string(),
                data: None
            })
        )
    }
}

// New response struct for paginated results
#[derive(Serialize, Deserialize)]
pub struct PaginatedResponse<T> {
    pub items: Vec<T>,
    pub total_items: usize,
    pub page: usize,
    pub page_size: usize,
    pub total_pages: usize,
}

// New struct for health check response
#[derive(Serialize, Deserialize)]
pub struct HealthCheckResponse {
    pub status: String,
    pub version: String,
    pub uptime: u64,
    pub blockchain_status: String,
    pub node_info: HashMap<String, String>,
}

// Grant access to a provider
#[post("/access/grant", format = "json", data = "<request>")]
pub fn grant_access(
    request: Json<GrantAccessRequest>,
    blockchain: &State<Arc<Mutex<Blockchain>>>,
    _rate_limit: RateLimitGuard
) -> status::Custom<Json<ApiResponse<String>>> {
    let mut blockchain = blockchain.lock().unwrap();
    
    // Parse expiration date if provided
    let expires_at = if let Some(expires_str) = &request.expires_at {
        match DateTime::parse_from_rfc3339(expires_str) {
            Ok(dt) => Some(dt.with_timezone(&Utc)),
            Err(_) => {
                return status::Custom(
                    Status::BadRequest,
                    Json(ApiResponse {
                        success: false,
                        message: "Invalid expiration date format. Use RFC3339".to_string(),
                        data: None,
                    }),
                );
            }
        }
    } else {
        None
    };
    
    // Parse record types if provided
    let specific_record_types = request.specific_record_types.as_ref().map(|types| {
        types.iter().map(|t| match t.as_str() {
            "Diagnosis" => RecordType::Diagnosis,
            "Medication" => RecordType::Medication,
            "LabResult" => RecordType::LabResult,
            "Procedure" => RecordType::Procedure,
            "Immunization" => RecordType::Immunization,
            "Allergy" => RecordType::Allergy,
            "Vital" => RecordType::Vital,
            "Note" => RecordType::Note,
            _ => RecordType::Note, // Default
        }).collect()
    });
    
    // Parse access level
    let access_level = match request.access_level.as_str() {
        "Owner" => AccessLevel::Owner,
        "Provider" => AccessLevel::Provider,
        "Limited" => AccessLevel::Limited,
        "Emergency" => AccessLevel::Emergency,
        "Auditor" => AccessLevel::Auditor,
        "Temporary" => AccessLevel::Temporary,
        "Research" => AccessLevel::Research,
        "Delegate" => AccessLevel::Delegate,
        _ => AccessLevel::Limited, // Default to limited access
    };
    
    // Create access control record
    let access_control = AccessControl {
        patient_id: request.patient_id.clone(),
        provider_id: Some(request.provider_id.clone()),
        access_level,
        granted_at: Utc::now(),
        expires_at,
        specific_record_types,
        emergency_reason: request.emergency_reason.clone(),
        auto_revoke_condition: request.auto_revoke_condition.clone(),
        delegate_info: request.delegate_info.clone(),
        consent_proof: request.consent_proof.clone(),
    };
    
    let transaction = Transaction::new(
        TransactionType::GrantAccess(access_control),
        Some(request.signature.clone()),
    );
    
    // Add transaction with validation
    if let Err(e) = blockchain.add_transaction(transaction) {
        return status::Custom(
            Status::BadRequest,
            Json(ApiResponse {
                success: false,
                message: format!("Failed to add transaction: {}", e),
                data: None,
            }),
        );
    }
    
    match blockchain.mine_pending_transactions() {
        Ok(_) => status::Custom(
            Status::Created,
            Json(ApiResponse {
                success: true,
                message: "Access granted successfully".to_string(),
                data: Some(format!("Access granted to {} by {}", request.provider_id, request.patient_id)),
            }),
        ),
        Err(e) => status::Custom(
            Status::InternalServerError,
            Json(ApiResponse {
                success: false,
                message: format!("Failed to mine transaction: {}", e),
                data: None,
            }),
        ),
    }
}

// Record access to a health record
#[post("/records/access", format = "json", data = "<request>")]
pub fn access_record(
    request: Json<AccessRecordRequest>,
    blockchain: &State<Arc<Mutex<Blockchain>>>,
    _rate_limit: RateLimitGuard
) -> status::Custom<Json<ApiResponse<HealthRecord>>> {
    let mut blockchain = blockchain.lock().unwrap();
    
    // Check if user has access to the record
    let record_id = &request.record_id;
    let accessor_id = &request.accessor_id;
    
    match blockchain.check_access(accessor_id, record_id) {
        Ok(true) => {
            // User has access, find the record
            let record = match blockchain.find_record_by_id(record_id) {
                Some(record) => record,
                None => {
                    return status::Custom(
                        Status::NotFound,
                        Json(ApiResponse {
                            success: false,
                            message: "Record not found".to_string(),
                            data: None,
                        }),
                    );
                }
            };
            
            // Log the access
            let transaction = Transaction::new(
                TransactionType::AccessRecord {
                    record_id: record_id.clone(),
                    accessor_id: accessor_id.clone(),
                    timestamp: Utc::now(),
                    access_reason: request.access_reason.clone(),
                },
                None, // No signature for access logs
            );
            
            // Add the access log transaction
            if let Err(e) = blockchain.add_transaction(transaction) {
                return status::Custom(
                    Status::InternalServerError,
                    Json(ApiResponse {
                        success: false,
                        message: format!("Failed to log access: {}", e),
                        data: None,
                    }),
                );
            }
            
            // Mine the transaction
            if let Err(e) = blockchain.mine_pending_transactions() {
                return status::Custom(
                    Status::InternalServerError,
                    Json(ApiResponse {
                        success: false,
                        message: format!("Failed to mine access log: {}", e),
                        data: None,
                    }),
                );
            }
            
            // Return the record
            status::Custom(
                Status::Ok,
                Json(ApiResponse {
                    success: true,
                    message: "Record accessed successfully".to_string(),
                    data: Some(record),
                }),
            )
        },
        Ok(false) | Err(_) => {
            status::Custom(
                Status::Forbidden,
                Json(ApiResponse {
                    success: false,
                    message: "Access denied".to_string(),
                    data: None,
                }),
            )
        }
    }
}

// Create a smart contract
#[post("/contracts/create", format = "json", data = "<request>")]
pub fn create_smart_contract(
    request: Json<CreateSmartContractRequest>,
    blockchain: &State<Arc<Mutex<Blockchain>>>,
    _rate_limit: RateLimitGuard
) -> status::Custom<Json<ApiResponse<String>>> {
    let mut blockchain = blockchain.lock().unwrap();
    
    // Generate a unique contract ID
    let contract_id = format!("contract_{}", Uuid::new_v4());
    
    let transaction = Transaction::new(
        TransactionType::CreateSmartContract {
            contract_id: contract_id.clone(),
            contract_type: request.contract_type.clone(),
            parties: request.parties.clone(),
            conditions: request.conditions.clone(),
            created_at: Utc::now(),
            signature: request.signature.clone(),
        },
        Some(request.signature.clone()),
    );
    
    // Add transaction with validation
    if let Err(e) = blockchain.add_transaction(transaction) {
        return status::Custom(
            Status::BadRequest,
            Json(ApiResponse {
                success: false,
                message: format!("Failed to add transaction: {}", e),
                data: None,
            }),
        );
    }
    
    match blockchain.mine_pending_transactions() {
        Ok(_) => status::Custom(
            Status::Created,
            Json(ApiResponse {
                success: true,
                message: "Smart contract created successfully".to_string(),
                data: Some(contract_id),
            }),
        ),
        Err(e) => status::Custom(
            Status::InternalServerError,
            Json(ApiResponse {
                success: false,
                message: format!("Failed to mine transaction: {}", e),
                data: None,
            }),
        ),
    }
}

// Execute a smart contract
#[post("/contracts/execute", format = "json", data = "<request>")]
pub fn execute_smart_contract(
    request: Json<ExecuteSmartContractRequest>,
    blockchain: &State<Arc<Mutex<Blockchain>>>,
    _rate_limit: RateLimitGuard
) -> status::Custom<Json<ApiResponse<String>>> {
    let mut blockchain = blockchain.lock().unwrap();
    
    let transaction = Transaction::new(
        TransactionType::ExecuteSmartContract {
            contract_id: request.contract_id.clone(),
            execution_params: request.execution_params.clone(),
            executed_by: "user".to_string(), // In a real app, this would come from auth
            timestamp: Utc::now(),
            signature: request.signature.clone(),
        },
        Some(request.signature.clone()),
    );
    
    // Add transaction with validation
    if let Err(e) = blockchain.add_transaction(transaction) {
        return status::Custom(
            Status::BadRequest,
            Json(ApiResponse {
                success: false,
                message: format!("Failed to add transaction: {}", e),
                data: None,
            }),
        );
    }
    
    match blockchain.mine_pending_transactions() {
        Ok(_) => status::Custom(
            Status::Ok,
            Json(ApiResponse {
                success: true,
                message: "Smart contract executed successfully".to_string(),
                data: Some(request.contract_id.clone()),
            }),
        ),
        Err(e) => status::Custom(
            Status::InternalServerError,
            Json(ApiResponse {
                success: false,
                message: format!("Failed to mine transaction: {}", e),
                data: None,
            }),
        ),
    }
}

// Patient data contribution endpoint
#[post("/patient/contribute", format = "json", data = "<request>")]
pub fn contribute_patient_data(
    request: Json<PatientDataContributionRequest>,
    blockchain: &State<Arc<Mutex<Blockchain>>>,
    _rate_limit: RateLimitGuard
) -> status::Custom<Json<ApiResponse<String>>> {
    let mut blockchain = blockchain.lock().unwrap();
    
    // Parse record type
    let data_type = match request.data_type.as_str() {
        "Vital" => RecordType::Vital,
        "Note" => RecordType::Note,
        "PatientContribution" => RecordType::PatientContribution,
        "WearableData" => RecordType::WearableData,
        "RemoteMonitoring" => RecordType::RemoteMonitoring,
        _ => RecordType::PatientContribution, // Default
    };
    
    // Generate a unique record ID
    let record_id = format!("rec_{}", Uuid::new_v4());
    
    let transaction = Transaction::new(
        TransactionType::PatientDataContribution {
            record_id: record_id.clone(),
            patient_id: request.patient_id.clone(),
            data_type,
            data: request.data.clone(),
            timestamp: Utc::now(),
            signature: request.signature.clone(),
        },
        Some(request.signature.clone()),
    );
    
    // Add transaction with validation
    if let Err(e) = blockchain.add_transaction(transaction) {
        return status::Custom(
            Status::BadRequest,
            Json(ApiResponse {
                success: false,
                message: format!("Failed to add transaction: {}", e),
                data: None,
            }),
        );
    }
    
    match blockchain.mine_pending_transactions() {
        Ok(_) => status::Custom(
            Status::Created,
            Json(ApiResponse {
                success: true,
                message: "Patient data contribution added successfully".to_string(),
                data: Some(record_id),
            }),
        ),
        Err(e) => status::Custom(
            Status::InternalServerError,
            Json(ApiResponse {
                success: false,
                message: format!("Failed to mine transaction: {}", e),
                data: None,
            }),
        ),
    }
}

// Import external health record
#[post("/records/import", format = "json", data = "<request>")]
pub fn import_external_record(
    request: Json<ImportExternalRecordRequest>,
    blockchain: &State<Arc<Mutex<Blockchain>>>,
    _rate_limit: RateLimitGuard
) -> status::Custom<Json<ApiResponse<String>>> {
    let mut blockchain = blockchain.lock().unwrap();
    
    // Parse record type
    let record_type = match request.record_type.as_str() {
        "Diagnosis" => RecordType::Diagnosis,
        "Medication" => RecordType::Medication,
        "LabResult" => RecordType::LabResult,
        "Procedure" => RecordType::Procedure,
        "Immunization" => RecordType::Immunization,
        "Allergy" => RecordType::Allergy,
        "Vital" => RecordType::Vital,
        "Note" => RecordType::Note,
        "FHIRResource" => RecordType::FHIRResource,
        "HL7Message" => RecordType::HL7Message,
        _ => RecordType::Note, // Default
    };
    
    // Generate a unique record ID
    let record_id = format!("rec_{}", Uuid::new_v4());
    
    let transaction = Transaction::new(
        TransactionType::ImportExternalRecord {
            record_id: record_id.clone(),
            patient_id: request.patient_id.clone(),
            source_system: request.source_system.clone(),
            record_type,
            data: request.data.clone(),
            timestamp: Utc::now(),
            signature: request.signature.clone(),
        },
        Some(request.signature.clone()),
    );
    
    // Add transaction with validation
    if let Err(e) = blockchain.add_transaction(transaction) {
        return status::Custom(
            Status::BadRequest,
            Json(ApiResponse {
                success: false,
                message: format!("Failed to add transaction: {}", e),
                data: None,
            }),
        );
    }
    
    match blockchain.mine_pending_transactions() {
        Ok(_) => status::Custom(
            Status::Created,
            Json(ApiResponse {
                success: true,
                message: "External record imported successfully".to_string(),
                data: Some(record_id),
            }),
        ),
        Err(e) => status::Custom(
            Status::InternalServerError,
            Json(ApiResponse {
                success: false,
                message: format!("Failed to mine transaction: {}", e),
                data: None,
            }),
        ),
    }
}

// Export health record to external system
#[post("/records/export", format = "json", data = "<request>")]
pub fn export_record(
    request: Json<ExportRecordRequest>,
    blockchain: &State<Arc<Mutex<Blockchain>>>,
    _rate_limit: RateLimitGuard
) -> status::Custom<Json<ApiResponse<String>>> {
    let mut blockchain = blockchain.lock().unwrap();
    
    // Check if record exists
    if blockchain.find_record_by_id(&request.record_id).is_none() {
        return status::Custom(
            Status::NotFound,
            Json(ApiResponse {
                success: false,
                message: "Record not found".to_string(),
                data: None,
            }),
        );
    }
    
    let transaction = Transaction::new(
        TransactionType::ExportRecord {
            record_id: request.record_id.clone(),
            destination_system: request.destination_system.clone(),
            exported_by: "user".to_string(), // In a real app, this would come from auth
            timestamp: Utc::now(),
            signature: request.signature.clone(),
        },
        Some(request.signature.clone()),
    );
    
    // Add transaction with validation
    if let Err(e) = blockchain.add_transaction(transaction) {
        return status::Custom(
            Status::BadRequest,
            Json(ApiResponse {
                success: false,
                message: format!("Failed to add transaction: {}", e),
                data: None,
            }),
        );
    }
    
    match blockchain.mine_pending_transactions() {
        Ok(_) => status::Custom(
            Status::Ok,
            Json(ApiResponse {
                success: true,
                message: "Record exported successfully".to_string(),
                data: Some(format!("Exported record {} to {}", request.record_id, request.destination_system)),
            }),
        ),
        Err(e) => status::Custom(
            Status::InternalServerError,
            Json(ApiResponse {
                success: false,
                message: format!("Failed to mine transaction: {}", e),
                data: None,
            }),
        ),
    }
}

pub fn routes() -> Vec<rocket::Route> {
    routes![
        index,
        health_check,
        blockchain_info,
        create_record,
        get_patient_records,
        validate_blockchain,
        prune_blockchain_data,
        get_off_chain_data,
        grant_access,
        access_record,
        create_smart_contract,
        execute_smart_contract,
        contribute_patient_data,
        import_external_record,
        export_record,
        request_analytics,
        create_prescription,
        create_collaborative_note,
        register_mobile_device
    ]
}

// Request analytics on de-identified data
#[post("/analytics/request", format = "json", data = "<request>")]
pub fn request_analytics(
    request: Json<AnalyticsRequestData>,
    blockchain: &State<Arc<Mutex<Blockchain>>>,
    _rate_limit: RateLimitGuard
) -> status::Custom<Json<ApiResponse<String>>> {
    let mut blockchain = blockchain.lock().unwrap();
    
    // Generate a unique request ID
    let request_id = format!("analytics_{}", Uuid::new_v4());
    
    let transaction = Transaction::new(
        TransactionType::AnalyticsRequest {
            request_id: request_id.clone(),
            requester_id: request.requester_id.clone(),
            data_scope: request.data_scope.clone(),
            purpose: request.purpose.clone(),
            timestamp: Utc::now(),
            signature: request.signature.clone(),
        },
        Some(request.signature.clone()),
    );
    
    // Add transaction with validation
    if let Err(e) = blockchain.add_transaction(transaction) {
        return status::Custom(
            Status::BadRequest,
            Json(ApiResponse {
                success: false,
                message: format!("Failed to add transaction: {}", e),
                data: None,
            }),
        );
    }
    
    match blockchain.mine_pending_transactions() {
        Ok(_) => status::Custom(
            Status::Created,
            Json(ApiResponse {
                success: true,
                message: "Analytics request submitted successfully".to_string(),
                data: Some(request_id),
            }),
        ),
        Err(e) => status::Custom(
            Status::InternalServerError,
            Json(ApiResponse {
                success: false,
                message: format!("Failed to mine transaction: {}", e),
                data: None,
            }),
        ),
    }
}

// Create a prescription
#[post("/prescriptions/create", format = "json", data = "<request>")]
pub fn create_prescription(
    request: Json<PrescriptionRequest>,
    blockchain: &State<Arc<Mutex<Blockchain>>>,
    _rate_limit: RateLimitGuard
) -> status::Custom<Json<ApiResponse<String>>> {
    let mut blockchain = blockchain.lock().unwrap();
    
    // Generate a unique prescription ID
    let prescription_id = format!("rx_{}", Uuid::new_v4());
    
    let transaction = Transaction::new(
        TransactionType::CreatePrescription {
            prescription_id: prescription_id.clone(),
            patient_id: request.patient_id.clone(),
            provider_id: request.provider_id.clone(),
            medication_details: request.medication_details.clone(),
            dosage: request.dosage.clone(),
            duration: request.duration.clone(),
            timestamp: Utc::now(),
            signature: request.signature.clone(),
        },
        Some(request.signature.clone()),
    );
    
    // Add transaction with validation
    if let Err(e) = blockchain.add_transaction(transaction) {
        return status::Custom(
            Status::BadRequest,
            Json(ApiResponse {
                success: false,
                message: format!("Failed to add transaction: {}", e),
                data: None,
            }),
        );
    }
    
    match blockchain.mine_pending_transactions() {
        Ok(_) => status::Custom(
            Status::Created,
            Json(ApiResponse {
                success: true,
                message: "Prescription created successfully".to_string(),
                data: Some(prescription_id),
            }),
        ),
        Err(e) => status::Custom(
            Status::InternalServerError,
            Json(ApiResponse {
                success: false,
                message: format!("Failed to mine transaction: {}", e),
                data: None,
            }),
        ),
    }
}

// Create a collaborative care note
#[post("/care/notes/create", format = "json", data = "<request>")]
pub fn create_collaborative_note(
    request: Json<CollaborativeCareNoteRequest>,
    blockchain: &State<Arc<Mutex<Blockchain>>>,
    _rate_limit: RateLimitGuard
) -> status::Custom<Json<ApiResponse<String>>> {
    let mut blockchain = blockchain.lock().unwrap();
    
    // Generate a unique note ID
    let note_id = format!("note_{}", Uuid::new_v4());
    
    let transaction = Transaction::new(
        TransactionType::CollaborativeCareNote {
            note_id: note_id.clone(),
            patient_id: request.patient_id.clone(),
            provider_id: request.provider_id.clone(),
            collaborators: request.collaborators.clone(),
            note_content: request.content.clone(),
            timestamp: Utc::now(),
            signature: request.signature.clone(),
        },
        Some(request.signature.clone()),
    );
    
    // Add transaction with validation
    if let Err(e) = blockchain.add_transaction(transaction) {
        return status::Custom(
            Status::BadRequest,
            Json(ApiResponse {
                success: false,
                message: format!("Failed to add transaction: {}", e),
                data: None,
            }),
        );
    }
    
    match blockchain.mine_pending_transactions() {
        Ok(_) => status::Custom(
            Status::Created,
            Json(ApiResponse {
                success: true,
                message: "Collaborative care note created successfully".to_string(),
                data: Some(note_id),
            }),
        ),
        Err(e) => status::Custom(
            Status::InternalServerError,
            Json(ApiResponse {
                success: false,
                message: format!("Failed to mine transaction: {}", e),
                data: None,
            }),
        ),
    }
}

// Register a mobile device
#[post("/devices/mobile/register", format = "json", data = "<request>")]
pub fn register_mobile_device(
    request: Json<RegisterMobileDeviceRequest>,
    blockchain: &State<Arc<Mutex<Blockchain>>>,
    _rate_limit: RateLimitGuard
) -> status::Custom<Json<ApiResponse<String>>> {
    let mut blockchain = blockchain.lock().unwrap();
    
    // Generate a unique device ID
    let device_id = format!("mobile_{}", Uuid::new_v4());
    
    let transaction = Transaction::new(
        TransactionType::RegisterMobileDevice {
            device_id: device_id.clone(),
            patient_id: request.patient_id.clone(),
            device_type: request.device_type.clone(),
            manufacturer: request.device_type.clone(),
            model: request.app_version.clone(),
            timestamp: Utc::now(),
            signature: request.signature.clone(),
        },
        Some(request.signature.clone()),
    );
    
    // Add transaction with validation
    if let Err(e) = blockchain.add_transaction(transaction) {
        return status::Custom(
            Status::BadRequest,
            Json(ApiResponse {
                success: false,
                message: format!("Failed to add transaction: {}", e),
                data: None,
            }),
        );
    }
    
    match blockchain.mine_pending_transactions() {
        Ok(_) => status::Custom(
            Status::Created,
            Json(ApiResponse {
                success: true,
                message: "Mobile device registered successfully".to_string(),
                data: Some(device_id),
            }),
        ),
        Err(e) => status::Custom(
            Status::InternalServerError,
            Json(ApiResponse {
                success: false,
                message: format!("Failed to mine transaction: {}", e),
                data: None,
            }),
        ),
    }
}

// Register an IoT device
#[post("/devices/iot/register", format = "json", data = "<request>")]
pub fn register_iot_device(
    request: Json<RegisterIoTDeviceRequest>,
    blockchain: &State<Arc<Mutex<Blockchain>>>,
    _rate_limit: RateLimitGuard
) -> status::Custom<Json<ApiResponse<String>>> {
    let mut blockchain = blockchain.lock().unwrap();
    
    // Generate a unique device ID
    let device_id = format!("iot_{}", Uuid::new_v4());
    
    // Parse device type
    let device_type = match request.device_type.as_str() {
        "Wearable" => IoTDeviceType::Wearable,
        "MedicalDevice" => IoTDeviceType::MedicalDevice,
        "HomeMonitor" => IoTDeviceType::HomeMonitor,
        "ImplantableDevice" => IoTDeviceType::ImplantableDevice,
        "SmartPill" => IoTDeviceType::SmartPill,
        _ => IoTDeviceType::Other(request.device_type.clone()),
    };
    
    let transaction = Transaction::new(
        TransactionType::RegisterIoTDevice {
            device_id: device_id.clone(),
            patient_id: request.patient_id.clone(),
            device_type,
            manufacturer: request.manufacturer.clone(),
            model: request.model.clone(),
            timestamp: Utc::now(),
            signature: request.signature.clone(),
        },
        Some(request.signature.clone()),
    );
    
    // Add transaction with validation
    if let Err(e) = blockchain.add_transaction(transaction) {
        return status::Custom(
            Status::BadRequest,
            Json(ApiResponse {
                success: false,
                message: format!("Failed to add transaction: {}", e),
                data: None,
            }),
        );
    }
    
    match blockchain.mine_pending_transactions() {
        Ok(_) => status::Custom(
            Status::Created,
            Json(ApiResponse {
                success: true,
                message: "IoT device registered successfully".to_string(),
                data: Some(device_id),
            }),
        ),
        Err(e) => status::Custom(
            Status::InternalServerError,
            Json(ApiResponse {
                success: false,
                message: format!("Failed to mine transaction: {}", e),
                data: None,
            }),
        ),
    }
}

// Submit data from a mobile device
#[post("/devices/mobile/data", format = "json", data = "<request>")]
pub fn submit_mobile_data(
    request: Json<SubmitMobileDataRequest>,
    blockchain: &State<Arc<Mutex<Blockchain>>>,
    _rate_limit: RateLimitGuard
) -> status::Custom<Json<ApiResponse<String>>> {
    let mut blockchain = blockchain.lock().unwrap();
    
    // Generate a unique data ID
    let data_id = format!("mdata_{}", Uuid::new_v4());
    
    let transaction = Transaction::new(
        TransactionType::MonitoringData {
            data_id: data_id.clone(),
            device_id: request.device_id.clone(),
            patient_id: request.patient_id.clone(),
            data_type: request.data_type.clone(),
            data: request.data.clone(),
            timestamp: Utc::now(),
            signature: request.signature.clone(),
        },
        Some(request.signature.clone()),
    );
    
    // Add transaction with validation
    if let Err(e) = blockchain.add_transaction(transaction) {
        return status::Custom(
            Status::BadRequest,
            Json(ApiResponse {
                success: false,
                message: format!("Failed to add transaction: {}", e),
                data: None,
            }),
        );
    }
    
    match blockchain.mine_pending_transactions() {
        Ok(_) => status::Custom(
            Status::Created,
            Json(ApiResponse {
                success: true,
                message: "Mobile data submitted successfully".to_string(),
                data: Some(data_id),
            }),
        ),
        Err(e) => status::Custom(
            Status::InternalServerError,
            Json(ApiResponse {
                success: false,
                message: format!("Failed to mine transaction: {}", e),
                data: None,
            }),
        ),
    }
}

// Submit data from an IoT device
#[post("/devices/iot/data", format = "json", data = "<request>")]
pub fn submit_iot_data(
    request: Json<SubmitIoTDataRequest>,
    blockchain: &State<Arc<Mutex<Blockchain>>>,
    _rate_limit: RateLimitGuard
) -> status::Custom<Json<ApiResponse<String>>> {
    let mut blockchain = blockchain.lock().unwrap();
    
    // Generate a unique data ID
    let data_id = format!("iotdata_{}", Uuid::new_v4());
    
    // Parse device type
    let device_type = match request.device_type.as_str() {
        "Wearable" => IoTDeviceType::Wearable,
        "MedicalDevice" => IoTDeviceType::MedicalDevice,
        "HomeMonitor" => IoTDeviceType::HomeMonitor,
        "ImplantableDevice" => IoTDeviceType::ImplantableDevice,
        "SmartPill" => IoTDeviceType::SmartPill,
        _ => IoTDeviceType::Other(request.device_type.clone()),
    };
    
    let transaction = Transaction::new(
        TransactionType::MonitoringData {
            data_id: data_id.clone(),
            device_id: request.device_id.clone(),
            patient_id: request.patient_id.clone(),
            data_type: format!("IoT_{:?}", device_type),  // Convert device_type to a string
            data: request.data.clone(),
            timestamp: Utc::now(),
            signature: request.signature.clone(),
        },
        Some(request.signature.clone()),
    );
    
    // Add transaction with validation
    if let Err(e) = blockchain.add_transaction(transaction) {
        return status::Custom(
            Status::BadRequest,
            Json(ApiResponse {
                success: false,
                message: format!("Failed to add transaction: {}", e),
                data: None,
            }),
        );
    }
    
    match blockchain.mine_pending_transactions() {
        Ok(_) => status::Custom(
            Status::Created,
            Json(ApiResponse {
                success: true,
                message: "IoT data submitted successfully".to_string(),
                data: Some(data_id),
            }),
        ),
        Err(e) => status::Custom(
            Status::InternalServerError,
            Json(ApiResponse {
                success: false,
                message: format!("Failed to mine transaction: {}", e),
                data: None,
            }),
        ),
    }
}

// Record compliance audit
#[post("/compliance/audit", format = "json", data = "<request>")]
pub fn record_compliance_audit(
    request: Json<ComplianceAuditRequest>,
    blockchain: &State<Arc<Mutex<Blockchain>>>,
    _rate_limit: RateLimitGuard
) -> status::Custom<Json<ApiResponse<String>>> {
    let mut blockchain = blockchain.lock().unwrap();
    
    // Generate a unique audit ID
    let audit_id = format!("audit_{}", Uuid::new_v4());
    
    let transaction = Transaction::new(
        TransactionType::ComplianceAudit {
            audit_id: audit_id.clone(),
            standard: ComplianceStandard::Custom(request.standard.clone()),
            auditor_id: request.auditor.clone(),
            timestamp: Utc::now(),
            signature: request.signature.clone(),
        },
        Some(request.signature.clone()),
    );
    
    // Add transaction with validation
    if let Err(e) = blockchain.add_transaction(transaction) {
        return status::Custom(
            Status::BadRequest,
            Json(ApiResponse {
                success: false,
                message: format!("Failed to add transaction: {}", e),
                data: None,
            }),
        );
    }
    
    match blockchain.mine_pending_transactions() {
        Ok(_) => status::Custom(
            Status::Created,
            Json(ApiResponse {
                success: true,
                message: "Compliance audit recorded successfully".to_string(),
                data: Some(audit_id),
            }),
        ),
        Err(e) => status::Custom(
            Status::InternalServerError,
            Json(ApiResponse {
                success: false,
                message: format!("Failed to mine transaction: {}", e),
                data: None,
            }),
        ),
    }
}

// Update governance policy
#[post("/governance/policy", format = "json", data = "<request>")]
pub fn update_governance_policy(
    request: Json<GovernancePolicyRequest>,
    blockchain: &State<Arc<Mutex<Blockchain>>>,
    _rate_limit: RateLimitGuard
) -> status::Custom<Json<ApiResponse<String>>> {
    let mut blockchain = blockchain.lock().unwrap();
    
    // Generate a unique policy ID
    let policy_id = format!("policy_{}", Uuid::new_v4());
    
    let transaction = Transaction::new(
        TransactionType::GovernancePolicy {
            policy_id: policy_id.clone(),
            policy_type: request.policy_type.clone(),
            policy_data: request.policy_content.clone(),  // Changed from 'policy_content' to 'policy_data'
            approved_by: request.approved_by.clone(),
            timestamp: Utc::now(),
            signature: request.signature.clone(),
        },
        Some(request.signature.clone()),
    );
    
    // Add transaction with validation
    if let Err(e) = blockchain.add_transaction(transaction) {
        return status::Custom(
            Status::BadRequest,
            Json(ApiResponse {
                success: false,
                message: format!("Failed to add transaction: {}", e),
                data: None,
            }),
        );
    }
    
    match blockchain.mine_pending_transactions() {
        Ok(_) => status::Custom(
            Status::Created,
            Json(ApiResponse {
                success: true,
                message: "Governance policy updated successfully".to_string(),
                data: Some(policy_id),
            }),
        ),
        Err(e) => status::Custom(
            Status::InternalServerError,
            Json(ApiResponse {
                success: false,
                message: format!("Failed to mine transaction: {}", e),
                data: None,
            }),
        ),
    }
}

// Update consensus method
#[post("/consensus/method", format = "json", data = "<request>")]
pub fn update_consensus_method(
    request: Json<ConsensusMethodRequest>,
    blockchain: &State<Arc<Mutex<Blockchain>>>,
    _rate_limit: RateLimitGuard
) -> status::Custom<Json<ApiResponse<String>>> {
    let mut blockchain = blockchain.lock().unwrap();
    
    // Generate a unique method ID
    let method_id = format!("consensus_{}", Uuid::new_v4());
    
    // Parse the consensus type from the string
    let consensus_type = match request.new_method.as_str() {
        "ProofOfWork" => ConsensusType::ProofOfWork,
        "ProofOfAuthority" => ConsensusType::ProofOfAuthority,
        "PBFT" | "PracticalByzantineFaultTolerance" => ConsensusType::PracticalByzantineFaultTolerance,
        "DPoS" | "DelegatedProofOfStake" => ConsensusType::DelegatedProofOfStake,
        _ => ConsensusType::ProofOfWork, // Default to PoW
    };
    
    // Create parameters map from request fields
    let mut parameters = HashMap::new();
    parameters.insert("reason".to_string(), request.reason.clone());
    parameters.insert("approved_by".to_string(), request.approved_by.clone());
    
    let transaction = Transaction::new(
        TransactionType::ConsensusMethod {
            method_id: method_id.clone(),
            consensus_type,
            parameters: parameters,
            timestamp: Utc::now(),
            signature: request.signature.clone(),
        },
        Some(request.signature.clone()),
    );
    
    // Add transaction with validation
    if let Err(e) = blockchain.add_transaction(transaction) {
        return status::Custom(
            Status::BadRequest,
            Json(ApiResponse {
                success: false,
                message: format!("Failed to add transaction: {}", e),
                data: None,
            }),
        );
    }
    
    match blockchain.mine_pending_transactions() {
        Ok(_) => status::Custom(
            Status::Created,
            Json(ApiResponse {
                success: true,
                message: "Consensus method updated successfully".to_string(),
                data: Some(method_id),
            }),
        ),
        Err(e) => status::Custom(
            Status::InternalServerError,
            Json(ApiResponse {
                success: false,
                message: format!("Failed to mine transaction: {}", e),
                data: None,
            }),
        ),
    }
}

// Implement scalability solution
#[post("/scalability/solution", format = "json", data = "<request>")]
pub fn implement_scalability_solution(
    request: Json<ScalabilitySolutionRequest>,
    blockchain: &State<Arc<Mutex<Blockchain>>>,
    _rate_limit: RateLimitGuard
) -> status::Custom<Json<ApiResponse<String>>> {
    let mut blockchain = blockchain.lock().unwrap();
    
    // Generate a unique solution ID
    let solution_id = format!("solution_{}", Uuid::new_v4());
    
    // Parse the scalability solution type from the string
    let solution_type = match request.solution_type.as_str() {
        "Layer2Rollup" | "Layer2" | "Rollup" => ScalabilitySolution::Layer2Rollup,
        "Sharding" => ScalabilitySolution::Sharding,
        "BatchProcessing" | "Batch" => ScalabilitySolution::BatchProcessing,
        _ => ScalabilitySolution::BatchProcessing, // Default to batch processing
    };
    
    // Create parameters map from request fields
    let mut parameters = HashMap::new();
    parameters.insert("configuration".to_string(), request.configuration.clone());
    parameters.insert("approved_by".to_string(), request.approved_by.clone());
    
    let transaction = Transaction::new(
        TransactionType::ScalabilitySolution {
            solution_id: solution_id.clone(),
            solution_type,
            parameters: parameters,
            timestamp: Utc::now(),
            signature: request.signature.clone(),
        },
        Some(request.signature.clone()),
    );
    
    // Add transaction with validation
    if let Err(e) = blockchain.add_transaction(transaction) {
        return status::Custom(
            Status::BadRequest,
            Json(ApiResponse {
                success: false,
                message: format!("Failed to add transaction: {}", e),
                data: None,
            }),
        );
    }
    
    match blockchain.mine_pending_transactions() {
        Ok(_) => status::Custom(
            Status::Created,
            Json(ApiResponse {
                success: true,
                message: "Scalability solution implemented successfully".to_string(),
                data: Some(solution_id),
            }),
        ),
        Err(e) => status::Custom(
            Status::InternalServerError,
            Json(ApiResponse {
                success: false,
                message: format!("Failed to mine transaction: {}", e),
                data: None,
            }),
        ),
    }
}

// Update encryption method
#[post("/encryption/method", format = "json", data = "<request>")]
pub fn update_encryption_method(
    request: Json<EncryptionMethodRequest>,
    blockchain: &State<Arc<Mutex<Blockchain>>>,
    _rate_limit: RateLimitGuard
) -> status::Custom<Json<ApiResponse<String>>> {
    let mut blockchain = blockchain.lock().unwrap();
    
    // Generate a unique method ID
    let method_id = format!("encryption_{}", Uuid::new_v4());
    
    // Parse the encryption type from the string
    let encryption_type = match request.new_method.as_str() {
        "AES256" | "AES" => EncryptionType::AES256,
        "RSA" => EncryptionType::RSA,
        "NTRU" | "PostQuantumNTRU" => EncryptionType::PostQuantumNTRU,
        "Lattice" | "PostQuantumLattice" => EncryptionType::PostQuantumLattice,
        "Homomorphic" | "HomomorphicEncryption" => EncryptionType::HomomorphicEncryption,
        "ZKP" | "ZeroKnowledge" | "ZeroKnowledgeProof" => EncryptionType::ZeroKnowledgeProof,
        _ => EncryptionType::AES256, // Default to AES256
    };
    
    // Create parameters map from request fields
    let mut parameters = HashMap::new();
    parameters.insert("old_method".to_string(), request.old_method.clone());
    parameters.insert("affected_records".to_string(), request.affected_records.iter().cloned().collect::<Vec<String>>().join(","));
    parameters.insert("approved_by".to_string(), request.approved_by.clone());
    
    let transaction = Transaction::new(
        TransactionType::EncryptionMethod {
            method_id: method_id.clone(),
            encryption_type,
            parameters,
            timestamp: Utc::now(),
            signature: request.signature.clone(),
        },
        Some(request.signature.clone()),
    );
    
    // Add transaction with validation
    if let Err(e) = blockchain.add_transaction(transaction) {
        return status::Custom(
            Status::BadRequest,
            Json(ApiResponse {
                success: false,
                message: format!("Failed to add transaction: {}", e),
                data: None,
            }),
        );
    }
    
    match blockchain.mine_pending_transactions() {
        Ok(_) => status::Custom(
            Status::Created,
            Json(ApiResponse {
                success: true,
                message: "Encryption method updated successfully".to_string(),
                data: Some(method_id),
            }),
        ),
        Err(e) => status::Custom(
            Status::InternalServerError,
            Json(ApiResponse {
                success: false,
                message: format!("Failed to mine transaction: {}", e),
                data: None,
            }),
        ),
    }
}
