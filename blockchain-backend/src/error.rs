use thiserror::Error;
use rocket::http::Status;
use rocket::response::status;
use rocket::serde::json::Json;
use serde::Serialize;

use crate::api::ApiResponse;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Blockchain error: {0}")]
    BlockchainError(String),
    
    #[error("Validation error: {0}")]
    ValidationError(String),
    
    #[error("Authentication error: {0}")]
    AuthError(String),
    
    #[error("Not found: {0}")]
    NotFoundError(String),
    
    #[error("Crypto error: {0}")]
    CryptoError(String),
    
    #[error("Storage error: {0}")]
    StorageError(String),
    
    #[error("Rate limit exceeded")]
    RateLimitError,
    
    #[error("Internal server error: {0}")]
    InternalError(String),
}

impl AppError {
    pub fn to_status(&self) -> Status {
        match self {
            AppError::BlockchainError(_) => Status::BadRequest,
            AppError::ValidationError(_) => Status::BadRequest,
            AppError::AuthError(_) => Status::Unauthorized,
            AppError::NotFoundError(_) => Status::NotFound,
            AppError::CryptoError(_) => Status::BadRequest,
            AppError::StorageError(_) => Status::InternalServerError,
            AppError::RateLimitError => Status::TooManyRequests,
            AppError::InternalError(_) => Status::InternalServerError,
        }
    }
    
    pub fn to_response<T: Serialize>(&self) -> status::Custom<Json<ApiResponse<T>>> {
        status::Custom(
            self.to_status(),
            Json(ApiResponse {
                success: false,
                message: self.to_string(),
                data: None,
            }),
        )
    }
}

// Implement From traits for easy conversion
impl From<serde_json::Error> for AppError {
    fn from(err: serde_json::Error) -> Self {
        AppError::ValidationError(err.to_string())
    }
}

impl From<validator::ValidationErrors> for AppError {
    fn from(err: validator::ValidationErrors) -> Self {
        AppError::ValidationError(format!("{:?}", err))
    }
}

// Result type alias for application
pub type AppResult<T> = Result<T, AppError>;
