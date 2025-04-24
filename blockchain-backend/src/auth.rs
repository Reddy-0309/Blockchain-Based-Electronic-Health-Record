use crate::error::{AppError, AppResult};
use argon2::{Argon2, PasswordHash, PasswordHasher, PasswordVerifier};
use argon2::password_hash::SaltString;
use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use once_cell::sync::Lazy;
use rand_core::OsRng;
use rocket::http::Status;
use rocket::request::{self, FromRequest, Outcome, Request};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use rocket::serde::json::Json;
use rocket::response::status;
use rocket::Route;

// JWT secret key
static JWT_SECRET: Lazy<String> = Lazy::new(|| {
    std::env::var("JWT_SECRET").unwrap_or_else(|_| "default_jwt_secret_key".to_string())
});

// JWT expiration time (in seconds)
static JWT_EXPIRATION: Lazy<i64> = Lazy::new(|| {
    std::env::var("JWT_EXPIRATION")
        .unwrap_or_else(|_| "86400".to_string())
        .parse::<i64>()
        .unwrap_or(86400)
});

// User roles
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum Role {
    Patient,
    Provider,
    Admin,
    Researcher,
    Auditor,
}

// User struct
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct User {
    pub id: String,
    pub username: String,
    pub email: String,
    pub role: Role,
    pub organization: Option<String>,
    pub created_at: chrono::DateTime<Utc>,
    pub last_login: Option<chrono::DateTime<Utc>>,
    #[serde(skip_serializing)]
    pub password_hash: String,
}

// Claims for JWT
#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,        // Subject (user ID)
    pub exp: i64,           // Expiration time
    pub iat: i64,           // Issued at
    pub role: Role,         // User role
    pub username: String,   // Username
}

// In-memory user store (in a real app, this would be a database)
pub struct UserStore {
    users: HashMap<String, User>,
}

impl UserStore {
    pub fn new() -> Self {
        UserStore {
            users: HashMap::new(),
        }
    }

    pub fn add_user(&mut self, user: User) {
        self.users.insert(user.id.clone(), user);
    }

    pub fn get_user(&self, user_id: &str) -> Option<&User> {
        self.users.get(user_id)
    }

    pub fn get_user_by_username(&self, username: &str) -> Option<&User> {
        self.users.values().find(|u| u.username == username)
    }

    pub fn update_last_login(&mut self, user_id: &str) {
        if let Some(user) = self.users.get_mut(user_id) {
            user.last_login = Some(Utc::now());
        }
    }
}

// Authentication service
pub struct AuthService {
    user_store: Arc<Mutex<UserStore>>,
}

impl AuthService {
    pub fn new() -> Self {
        AuthService {
            user_store: Arc::new(Mutex::new(UserStore::new())),
        }
    }

    pub fn get_user_store(&self) -> Arc<Mutex<UserStore>> {
        self.user_store.clone()
    }

    // Register a new user
    pub fn register_user(
        &self,
        username: &str,
        email: &str,
        password: &str,
        role: Role,
        organization: Option<String>,
    ) -> AppResult<User> {
        // Check if username already exists
        let store = self.user_store.lock().unwrap();
        if store.get_user_by_username(username).is_some() {
            return Err(AppError::ValidationError(format!(
                "Username '{}' already exists",
                username
            )));
        }
        drop(store); // Release the lock

        // Hash the password
        let password_hash = self.hash_password(password)?;

        // Create a new user
        let user = User {
            id: format!("user_{}", uuid::Uuid::new_v4()),
            username: username.to_string(),
            email: email.to_string(),
            role,
            organization,
            created_at: Utc::now(),
            last_login: None,
            password_hash,
        };

        // Add the user to the store
        let mut store = self.user_store.lock().unwrap();
        store.add_user(user.clone());

        Ok(user)
    }

    // Authenticate a user and generate a JWT
    pub fn login(&self, username: &str, password: &str) -> AppResult<String> {
        // Get the user and verify password
        let user = {
            // Get a reference to the user
            let store = self.user_store.lock().unwrap();
            let user = store
                .get_user_by_username(username)
                .ok_or_else(|| AppError::AuthError("Invalid username or password".to_string()))?;
            
            // Verify the password
            self.verify_password(password, &user.password_hash)?;
            
            // Clone the user to avoid borrowing issues
            user.clone()
        };
        
        // Update last login time in a separate scope
        {
            let mut store = self.user_store.lock().unwrap();
            store.update_last_login(&user.id);
        }

        // Generate a JWT
        let token = self.generate_token(&user)?;

        Ok(token)
    }

    // Validate a JWT and return the claims
    pub fn validate_token(&self, token: &str) -> AppResult<Claims> {
        let validation = Validation::default();
        let token_data = decode::<Claims>(
            token,
            &DecodingKey::from_secret(JWT_SECRET.as_bytes()),
            &validation,
        )
        .map_err(|e| AppError::AuthError(format!("Invalid token: {}", e)))?;

        Ok(token_data.claims)
    }

    // Hash a password
    fn hash_password(&self, password: &str) -> AppResult<String> {
        let salt = SaltString::generate(&mut OsRng);
        let argon2 = Argon2::default();
        let password_hash = argon2
            .hash_password(password.as_bytes(), &salt)
            .map_err(|e| AppError::AuthError(format!("Failed to hash password: {}", e)))?;

        Ok(password_hash.to_string())
    }

    // Verify a password
    fn verify_password(&self, password: &str, hash: &str) -> AppResult<()> {
        let parsed_hash = PasswordHash::new(hash)
            .map_err(|e| AppError::AuthError(format!("Invalid password hash: {}", e)))?;

        Argon2::default()
            .verify_password(password.as_bytes(), &parsed_hash)
            .map_err(|_| AppError::AuthError("Invalid username or password".to_string()))?;

        Ok(())
    }

    // Generate a JWT
    fn generate_token(&self, user: &User) -> AppResult<String> {
        let now = Utc::now();
        let expiration = now + Duration::seconds(*JWT_EXPIRATION);

        let claims = Claims {
            sub: user.id.clone(),
            exp: expiration.timestamp(),
            iat: now.timestamp(),
            role: user.role.clone(),
            username: user.username.clone(),
        };

        let token = encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(JWT_SECRET.as_bytes()),
        )
        .map_err(|e| AppError::AuthError(format!("Failed to generate token: {}", e)))?;

        Ok(token)
    }
}

// JWT guard for protected routes
pub struct JwtGuard {
    pub claims: Claims,
}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for JwtGuard {
    type Error = AppError;

    async fn from_request(request: &'r Request<'_>) -> request::Outcome<Self, Self::Error> {
        // Get the authorization header
        let auth_header = match request.headers().get_one("Authorization") {
            Some(header) => header,
            None => {
                return Outcome::Error((Status::Unauthorized, AppError::AuthError("Missing Authorization header".to_string())))
            }
        };

        // Check if it's a Bearer token
        let token = match auth_header.strip_prefix("Bearer ") {
            Some(token) => token,
            None => {
                return Outcome::Error((Status::Unauthorized, AppError::AuthError("Invalid Authorization header format".to_string())))
            }
        };

        // Get the auth service
        let auth_service = match request.rocket().state::<AuthService>() {
            Some(service) => service,
            None => {
                return Outcome::Error((Status::InternalServerError, AppError::InternalError("Auth service not available".to_string())))
            }
        };

        // Validate the token
        match auth_service.validate_token(token) {
            Ok(claims) => Outcome::Success(JwtGuard { claims }),
            Err(e) => Outcome::Error((Status::Unauthorized, e)),
        }
    }
}

// Role-based authorization
pub struct RoleGuard {
    pub required_roles: Vec<Role>,
}

impl RoleGuard {
    pub fn new(roles: Vec<Role>) -> Self {
        RoleGuard { required_roles: roles }
    }
}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for RoleGuard {
    type Error = AppError;

    async fn from_request(request: &'r Request<'_>) -> request::Outcome<Self, Self::Error> {
        // First, get the JWT guard
        let jwt_outcome = JwtGuard::from_request(request).await;
        let jwt_guard = match jwt_outcome {
            Outcome::Success(guard) => guard,
            Outcome::Error(e) => return Outcome::Error(e),
            Outcome::Forward(f) => return Outcome::Forward(f),
        };

        // Get the required roles from the route
        let required_roles = request.local_cache(|| {
            vec![Role::Admin] // Default to admin-only if not specified
        });

        // Check if the user has one of the required roles
        if required_roles.contains(&jwt_guard.claims.role) {
            Outcome::Success(RoleGuard { required_roles: required_roles.clone() })
        } else {
            Outcome::Error((Status::Forbidden, AppError::AuthError("Insufficient permissions".to_string())))
        }
    }
}

// Request and response models
#[derive(Debug, Serialize, Deserialize)]
pub struct LoginRequest {
    pub username: String,
    pub password: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RegisterRequest {
    pub username: String,
    pub email: String,
    pub password: String,
    pub role: Role,
    pub organization: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthResponse<T> {
    pub success: bool,
    pub message: String,
    pub data: Option<T>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TokenResponse {
    pub token: String,
    pub user: UserResponse,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserResponse {
    pub id: String,
    pub username: String,
    pub email: String,
    pub role: Role,
    pub organization: Option<String>,
}

// Convert User to UserResponse
impl From<User> for UserResponse {
    fn from(user: User) -> Self {
        UserResponse {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            organization: user.organization,
        }
    }
}

// Login endpoint
#[rocket::post("/login", format = "json", data = "<request>")]
pub fn login(
    request: Json<LoginRequest>,
    auth_service: &rocket::State<AuthService>,
) -> status::Custom<Json<AuthResponse<TokenResponse>>> {
    match auth_service.login(&request.username, &request.password) {
        Ok(token) => {
            // Get the user
            let store = auth_service.get_user_store();
            let store = store.lock().unwrap();
            let user = store.get_user_by_username(&request.username).unwrap();
            let user_response = UserResponse::from(user.clone());

            status::Custom(
                Status::Ok,
                Json(AuthResponse {
                    success: true,
                    message: "Login successful".to_string(),
                    data: Some(TokenResponse {
                        token,
                        user: user_response,
                    }),
                }),
            )
        }
        Err(e) => status::Custom(
            Status::Unauthorized,
            Json(AuthResponse::<TokenResponse> {
                success: false,
                message: e.to_string(),
                data: None,
            }),
        ),
    }
}

// Register endpoint
#[rocket::post("/register", format = "json", data = "<request>")]
pub fn register(
    request: Json<RegisterRequest>,
    auth_service: &rocket::State<AuthService>,
) -> status::Custom<Json<AuthResponse<UserResponse>>> {
    match auth_service.register_user(
        &request.username,
        &request.email,
        &request.password,
        request.role.clone(),
        request.organization.clone(),
    ) {
        Ok(user) => status::Custom(
            Status::Created,
            Json(AuthResponse {
                success: true,
                message: "User registered successfully".to_string(),
                data: Some(UserResponse::from(user)),
            }),
        ),
        Err(e) => status::Custom(
            Status::BadRequest,
            Json(AuthResponse::<UserResponse> {
                success: false,
                message: e.to_string(),
                data: None,
            }),
        ),
    }
}

// Me endpoint - get current user
#[rocket::get("/me")]
pub fn me(jwt_guard: JwtGuard, auth_service: &rocket::State<AuthService>) -> status::Custom<Json<AuthResponse<UserResponse>>> {
    let store = auth_service.get_user_store();
    let store = store.lock().unwrap();
    
    match store.get_user(&jwt_guard.claims.sub) {
        Some(user) => status::Custom(
            Status::Ok,
            Json(AuthResponse {
                success: true,
                message: "User retrieved successfully".to_string(),
                data: Some(UserResponse::from(user.clone())),
            }),
        ),
        None => status::Custom(
            Status::NotFound,
            Json(AuthResponse::<UserResponse> {
                success: false,
                message: "User not found".to_string(),
                data: None,
            }),
        ),
    }
}

// Routes function
pub fn routes() -> Vec<Route> {
    rocket::routes![
        login,
        register,
        me,
    ]
}
