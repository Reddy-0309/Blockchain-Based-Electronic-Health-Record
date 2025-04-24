mod blockchain;
mod crypto;
mod api;
mod error;
mod config;
mod auth;
mod validation;
mod pagination;
mod swagger;

use std::sync::{Arc, Mutex};
use log::{info, LevelFilter};
use rocket::http::Method;
use rocket_cors::{AllowedOrigins, CorsOptions};
use env_logger::Builder;
use crate::auth::{AuthService, Role};

#[rocket::main]
async fn main() {
    // Load configuration
    let config = config::AppConfig::from_env();
    
    // Initialize logger
    let mut builder = Builder::new();
    builder.filter_level(config.log_level);
    
    if let Some(log_file) = &config.log_file {
        match std::fs::File::create(log_file) {
            Ok(file) => {
                builder.target(env_logger::Target::Pipe(Box::new(file)));
            },
            Err(e) => {
                eprintln!("Failed to create log file: {}", e);
            }
        }
    }
    
    builder.init();
    
    info!("Starting Blockchain-Based Electronic Health Records System in {} mode", 
          match config.environment {
              config::Environment::Development => "development",
              config::Environment::Test => "test",
              config::Environment::Production => "production",
          });
    
    // Create a new blockchain with configured mining difficulty and reward
    let blockchain = Arc::new(Mutex::new(blockchain::Blockchain::new(
        config.blockchain.mining_difficulty as usize, 
        config.blockchain.mining_reward
    )));
    
    // Create a new crypto service
    let crypto_service = Arc::new(Mutex::new(crypto::CryptoService::new()));
    
    // Create a new auth service
    let auth_service = AuthService::new();
    
    // Add some test users in development mode
    if config.is_development() {
        let _ = auth_service.register_user(
            "admin", 
            "admin@example.com", 
            "admin123", 
            Role::Admin, 
            Some("System".to_string())
        );
        
        let _ = auth_service.register_user(
            "doctor", 
            "doctor@example.com", 
            "doctor123", 
            Role::Provider, 
            Some("General Hospital".to_string())
        );
        
        let _ = auth_service.register_user(
            "patient", 
            "patient@example.com", 
            "patient123", 
            Role::Patient, 
            None
        );
        
        info!("Created test users for development");
    }
    
    // Configure Rocket
    let figment = rocket::Config::figment()
        .merge(("address", config.server.host.clone()))
        .merge(("port", config.server.port))
        .merge(("log_level", match config.log_level {
            LevelFilter::Trace => "trace",
            LevelFilter::Debug => "debug",
            LevelFilter::Info => "normal",
            LevelFilter::Warn => "critical",
            LevelFilter::Error => "off",
            _ => "normal",
        }));
    
    // Configure CORS
    let cors = CorsOptions::default()
        .allowed_origins(AllowedOrigins::all())
        .allowed_methods(
            vec![Method::Get, Method::Post, Method::Put, Method::Delete]
                .into_iter()
                .map(From::from)
                .collect()
        )
        .allow_credentials(true);
    
    info!("API server will be available at http://{}:{}", config.server.host, config.server.port);
    info!("Swagger UI will be available at http://{}:{}", config.server.host, config.server.port);
    
    // Launch the Rocket server
    let _ = rocket::custom(figment)
        .mount("/", rocket::fs::FileServer::from("static"))
        .mount("/api", api::routes())
        .mount("/auth", auth::routes())
        .mount("/", swagger::routes())
        .manage(blockchain.clone())
        .manage(crypto_service.clone())
        .manage(config.clone())
        .manage(auth_service)
        .attach(cors.to_cors().unwrap())
        .attach(swagger::SwaggerFairing)
        .launch()
        .await;
}
