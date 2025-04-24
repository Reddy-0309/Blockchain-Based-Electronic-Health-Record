use dotenv::dotenv;
use std::env;
use std::str::FromStr;
use log::LevelFilter;

#[derive(Debug, Clone, PartialEq)]
pub enum Environment {
    Development,
    Test,
    Production,
}

impl FromStr for Environment {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "development" | "dev" => Ok(Environment::Development),
            "test" | "testing" => Ok(Environment::Test),
            "production" | "prod" => Ok(Environment::Production),
            _ => Err(format!("Unknown environment: {}", s)),
        }
    }
}

#[derive(Debug, Clone)]
pub struct AppConfig {
    pub environment: Environment,
    pub server: ServerConfig,
    pub blockchain: BlockchainConfig,
    pub security: SecurityConfig,
    pub rate_limit: RateLimitConfig,
    pub storage: StorageConfig,
    pub log_level: LevelFilter,
    pub log_file: Option<String>,
}

#[derive(Debug, Clone)]
pub struct ServerConfig {
    pub host: String,
    pub port: u16,
}

#[derive(Debug, Clone)]
pub struct BlockchainConfig {
    pub mining_difficulty: u32,
    pub mining_reward: f64,
}

#[derive(Debug, Clone)]
pub struct SecurityConfig {
    pub jwt_secret: String,
    pub jwt_expiration: u64,
}

#[derive(Debug, Clone)]
pub struct RateLimitConfig {
    pub window: u64,
    pub max_requests: u32,
}

#[derive(Debug, Clone)]
pub struct StorageConfig {
    pub off_chain_storage_type: String,
    pub ipfs_gateway: String,
}

impl AppConfig {
    pub fn from_env() -> Self {
        dotenv().ok();
        
        let environment = env::var("ENVIRONMENT")
            .unwrap_or_else(|_| "development".to_string())
            .parse::<Environment>()
            .unwrap_or(Environment::Development);
        
        let log_level = match environment {
            Environment::Development => LevelFilter::Debug,
            Environment::Test => LevelFilter::Info,
            Environment::Production => LevelFilter::Warn,
        };
        
        // Override log level if specified in .env
        let log_level = match env::var("LOG_LEVEL") {
            Ok(level) => match level.to_lowercase().as_str() {
                "trace" => LevelFilter::Trace,
                "debug" => LevelFilter::Debug,
                "info" => LevelFilter::Info,
                "warn" => LevelFilter::Warn,
                "error" => LevelFilter::Error,
                _ => log_level,
            },
            Err(_) => log_level,
        };
        
        AppConfig {
            environment,
            server: ServerConfig {
                host: env::var("SERVER_HOST").unwrap_or_else(|_| "0.0.0.0".to_string()),
                port: env::var("SERVER_PORT")
                    .unwrap_or_else(|_| "8000".to_string())
                    .parse::<u16>()
                    .unwrap_or(8000),
            },
            blockchain: BlockchainConfig {
                mining_difficulty: env::var("MINING_DIFFICULTY")
                    .unwrap_or_else(|_| "2".to_string())
                    .parse::<u32>()
                    .unwrap_or(2),
                mining_reward: env::var("MINING_REWARD")
                    .unwrap_or_else(|_| "100.0".to_string())
                    .parse::<f64>()
                    .unwrap_or(100.0),
            },
            security: SecurityConfig {
                jwt_secret: env::var("JWT_SECRET")
                    .unwrap_or_else(|_| "default_jwt_secret_key".to_string()),
                jwt_expiration: env::var("JWT_EXPIRATION")
                    .unwrap_or_else(|_| "86400".to_string())
                    .parse::<u64>()
                    .unwrap_or(86400),
            },
            rate_limit: RateLimitConfig {
                window: env::var("RATE_LIMIT_WINDOW")
                    .unwrap_or_else(|_| "60".to_string())
                    .parse::<u64>()
                    .unwrap_or(60),
                max_requests: env::var("RATE_LIMIT_MAX_REQUESTS")
                    .unwrap_or_else(|_| "100".to_string())
                    .parse::<u32>()
                    .unwrap_or(100),
            },
            storage: StorageConfig {
                off_chain_storage_type: env::var("OFF_CHAIN_STORAGE_TYPE")
                    .unwrap_or_else(|_| "IPFS".to_string()),
                ipfs_gateway: env::var("IPFS_GATEWAY")
                    .unwrap_or_else(|_| "https://ipfs.io/ipfs/".to_string()),
            },
            log_level,
            log_file: env::var("LOG_FILE").ok(),
        }
    }
    
    pub fn is_development(&self) -> bool {
        self.environment == Environment::Development
    }
    
    pub fn is_test(&self) -> bool {
        self.environment == Environment::Test
    }
    
    pub fn is_production(&self) -> bool {
        self.environment == Environment::Production
    }
}
