use crate::error::{AppError, AppResult};
use rocket::data::{Data, FromData, Outcome};
use rocket::http::Status;
use rocket::request::{FromRequest, Request};
use rocket::serde::json::Json;
use serde::de::DeserializeOwned;
use validator::{Validate, ValidationErrors};

/// A wrapper type that provides validation for request bodies
#[derive(Debug)]
pub struct ValidatedJson<T>(pub T);

#[rocket::async_trait]
impl<'r, T: DeserializeOwned + Validate> FromData<'r> for ValidatedJson<T> {
    type Error = AppError;

    async fn from_data(req: &'r Request<'_>, data: Data<'r>) -> Outcome<'r, Self> {
        // First, parse the JSON
        let json_outcome = Json::<T>::from_data(req, data).await;

        match json_outcome {
            Outcome::Success(json) => {
                let value = json.into_inner();
                match value.validate() {
                    Ok(_) => Outcome::Success(ValidatedJson(value)),
                    Err(e) => Outcome::Error((Status::BadRequest, AppError::ValidationError(format!("{:?}", e)))),
                }
            }
            Outcome::Error(e) => Outcome::Error((Status::BadRequest, AppError::ValidationError(format!("{:?}", e)))),
            Outcome::Forward(forward) => Outcome::Forward(forward),
        }
    }
}

/// Helper function to format validation errors into a readable string
fn format_validation_errors(errors: ValidationErrors) -> String {
    let mut error_messages = Vec::new();

    for (field, field_errors) in errors.field_errors() {
        for error in field_errors {
            let message = match &error.message {
                Some(msg) => msg.to_string(),
                None => format!("Validation failed for field '{}'", field),
            };
            error_messages.push(message);
        }
    }

    if error_messages.is_empty() {
        "Validation failed".to_string()
    } else {
        error_messages.join(", ")
    }
}

/// A trait for types that can be validated
pub trait Validatable {
    fn validate_request(&self) -> AppResult<()>;
}

/// A guard that ensures a request is valid
pub struct ValidatedRequest<T>(pub T);

#[rocket::async_trait]
impl<'r, T: FromRequest<'r> + Validatable + 'r> FromRequest<'r> for ValidatedRequest<T> {
    type Error = AppError;

    async fn from_request(request: &'r Request<'_>) -> rocket::request::Outcome<Self, Self::Error> {
        match T::from_request(request).await {
            rocket::request::Outcome::Success(value) => {
                match value.validate_request() {
                    Ok(_) => rocket::request::Outcome::Success(ValidatedRequest(value)),
                    Err(e) => rocket::request::Outcome::Error((Status::BadRequest, e)),
                }
            }
            rocket::request::Outcome::Error(_) => {
                rocket::request::Outcome::Error((Status::BadRequest, AppError::ValidationError("Invalid request".to_string())))
            }
            rocket::request::Outcome::Forward(f) => rocket::request::Outcome::Forward(f),
        }
    }
}
