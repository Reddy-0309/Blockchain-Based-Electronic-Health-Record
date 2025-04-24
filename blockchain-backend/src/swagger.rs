use rocket::fairing::{Fairing, Info, Kind};
use rocket::http::Header;
use rocket::response::content;
use rocket::serde::json::{json, Value, Json};
use rocket::Route;
use std::collections::HashMap;

/// OpenAPI documentation generator
pub struct OpenApiDocumentation {
    title: String,
    description: String,
    version: String,
    routes: HashMap<String, Vec<RouteDoc>>,
}

/// Route documentation
pub struct RouteDoc {
    pub path: String,
    pub method: String,
    pub summary: String,
    pub description: String,
    pub tags: Vec<String>,
    pub parameters: Vec<ParameterDoc>,
    pub request_body: Option<RequestBodyDoc>,
    pub responses: HashMap<String, ResponseDoc>,
    pub security: Vec<String>,
}

/// Parameter documentation
pub struct ParameterDoc {
    pub name: String,
    pub location: String, // path, query, header
    pub description: String,
    pub required: bool,
    pub schema_type: String,
}

/// Request body documentation
pub struct RequestBodyDoc {
    pub description: String,
    pub content_type: String,
    pub schema: String,
    pub required: bool,
}

/// Response documentation
pub struct ResponseDoc {
    pub description: String,
    pub content_type: String,
    pub schema: String,
}

impl OpenApiDocumentation {
    /// Create a new OpenAPI documentation generator
    pub fn new(title: &str, description: &str, version: &str) -> Self {
        OpenApiDocumentation {
            title: title.to_string(),
            description: description.to_string(),
            version: version.to_string(),
            routes: HashMap::new(),
        }
    }

    /// Add a tag to the documentation
    pub fn add_tag(&mut self, name: &str, routes: Vec<RouteDoc>) {
        self.routes.insert(name.to_string(), routes);
    }

    /// Generate the OpenAPI specification as JSON
    pub fn generate_spec(&self) -> Value {
        let mut paths = HashMap::new();
        let mut tags = Vec::new();

        // Add tags
        for (tag_name, _) in &self.routes {
            tags.push(json!({
                "name": tag_name,
                "description": format!("Operations related to {}", tag_name)
            }));
        }

        // Add paths
        for (tag_name, routes) in &self.routes {
            for route in routes {
                let path_key = route.path.clone();
                let method_key = route.method.to_lowercase();

                // Create parameters array
                let parameters = route.parameters.iter().map(|param| {
                    json!({
                        "name": param.name,
                        "in": param.location,
                        "description": param.description,
                        "required": param.required,
                        "schema": {
                            "type": param.schema_type
                        }
                    })
                }).collect::<Vec<_>>();

                // Create request body
                let request_body = match &route.request_body {
                    Some(body) => json!({
                        "description": body.description,
                        "required": body.required,
                        "content": {
                            body.content_type.clone(): {
                                "schema": {
                                    "$ref": format!("#/components/schemas/{}", body.schema)
                                }
                            }
                        }
                    }),
                    None => json!({}),
                };

                // Create responses
                let mut responses = json!({});
                for (status_code, response) in &route.responses {
                    responses[status_code] = json!({
                        "description": response.description,
                        "content": {
                            response.content_type.clone(): {
                                "schema": {
                                    "$ref": format!("#/components/schemas/{}", response.schema)
                                }
                            }
                        }
                    });
                }

                // Create security requirements
                let security = route.security.iter().map(|sec| {
                    let mut map = HashMap::new();
                    map.insert(sec.clone(), Vec::<String>::new());
                    map
                }).collect::<Vec<_>>();

                // Add the path method
                let path_method = json!({
                    "tags": [tag_name],
                    "summary": route.summary,
                    "description": route.description,
                    "parameters": parameters,
                    "requestBody": request_body,
                    "responses": responses,
                    "security": security
                });

                // Add to paths
                if !paths.contains_key(&path_key) {
                    paths.insert(path_key.clone(), json!({}));
                }

                let path_obj = paths.get_mut(&path_key).unwrap();
                path_obj[method_key] = path_method;
            }
        }

        // Build the full OpenAPI spec
        json!({
            "openapi": "3.0.0",
            "info": {
                "title": self.title,
                "description": self.description,
                "version": self.version,
                "contact": {
                    "name": "API Support",
                    "email": "support@example.com"
                },
                "license": {
                    "name": "MIT",
                    "url": "https://opensource.org/licenses/MIT"
                }
            },
            "servers": [
                {
                    "url": "/",
                    "description": "Local server"
                }
            ],
            "tags": tags,
            "paths": paths,
            "components": {
                "securitySchemes": {
                    "bearerAuth": {
                        "type": "http",
                        "scheme": "bearer",
                        "bearerFormat": "JWT"
                    }
                },
                "schemas": self.generate_schemas()
            }
        })
    }

    /// Generate schema definitions for the OpenAPI spec
    fn generate_schemas(&self) -> Value {
        json!({
            "HealthRecord": {
                "type": "object",
                "properties": {
                    "record_id": { "type": "string" },
                    "patient_id": { "type": "string" },
                    "provider_id": { "type": "string" },
                    "timestamp": { "type": "string", "format": "date-time" },
                    "data": { "type": "object" },
                    "signature": { "type": "string" }
                }
            },
            "Patient": {
                "type": "object",
                "properties": {
                    "id": { "type": "string" },
                    "name": { "type": "string" },
                    "dob": { "type": "string", "format": "date" },
                    "gender": { "type": "string" },
                    "contact": { "type": "string" }
                }
            },
            "Provider": {
                "type": "object",
                "properties": {
                    "id": { "type": "string" },
                    "name": { "type": "string" },
                    "specialty": { "type": "string" },
                    "organization": { "type": "string" },
                    "license": { "type": "string" }
                }
            },
            "LoginRequest": {
                "type": "object",
                "properties": {
                    "username": { "type": "string" },
                    "password": { "type": "string" }
                },
                "required": ["username", "password"]
            },
            "LoginResponse": {
                "type": "object",
                "properties": {
                    "success": { "type": "boolean" },
                    "message": { "type": "string" },
                    "data": {
                        "type": "object",
                        "properties": {
                            "token": { "type": "string" },
                            "user": { "$ref": "#/components/schemas/User" }
                        }
                    }
                }
            },
            "User": {
                "type": "object",
                "properties": {
                    "id": { "type": "string" },
                    "username": { "type": "string" },
                    "email": { "type": "string" },
                    "role": { "type": "string", "enum": ["Patient", "Provider", "Admin", "Researcher", "Auditor"] },
                    "organization": { "type": "string" }
                }
            },
            "Error": {
                "type": "object",
                "properties": {
                    "error": { "type": "string" },
                    "message": { "type": "string" },
                    "status": { "type": "integer" }
                }
            },
            "PaginatedResponse": {
                "type": "object",
                "properties": {
                    "data": { "type": "array", "items": { "type": "object" } },
                    "pagination": {
                        "type": "object",
                        "properties": {
                            "page": { "type": "integer" },
                            "page_size": { "type": "integer" },
                            "total_items": { "type": "integer" },
                            "total_pages": { "type": "integer" }
                        }
                    }
                }
            }
        })
    }
}

/// Swagger UI handler
#[rocket::get("/swagger")]
pub fn swagger_ui() -> content::RawHtml<String> {
    content::RawHtml(include_str!("../static/swagger-ui.html").to_string())
}

/// OpenAPI JSON spec handler
#[rocket::get("/api-docs")]
pub fn api_docs() -> Json<String> {
    let mut api_docs = OpenApiDocumentation::new(
        "Blockchain-Based EHR API",
        "API for a Blockchain-Based Electronic Health Records System",
        "1.0.0",
    );

    // Add authentication routes
    api_docs.add_tag("Authentication", vec![
        RouteDoc {
            path: "/auth/login".to_string(),
            method: "POST".to_string(),
            summary: "Login to the system".to_string(),
            description: "Authenticate a user and receive a JWT token".to_string(),
            tags: vec!["Authentication".to_string()],
            parameters: vec![],
            request_body: Some(RequestBodyDoc {
                description: "Login credentials".to_string(),
                content_type: "application/json".to_string(),
                schema: "LoginRequest".to_string(),
                required: true,
            }),
            responses: {
                let mut map = HashMap::new();
                map.insert("200".to_string(), ResponseDoc {
                    description: "Successful login".to_string(),
                    content_type: "application/json".to_string(),
                    schema: "LoginResponse".to_string(),
                });
                map.insert("401".to_string(), ResponseDoc {
                    description: "Invalid credentials".to_string(),
                    content_type: "application/json".to_string(),
                    schema: "Error".to_string(),
                });
                map
            },
            security: vec![],
        },
        RouteDoc {
            path: "/auth/register".to_string(),
            method: "POST".to_string(),
            summary: "Register a new user".to_string(),
            description: "Create a new user account".to_string(),
            tags: vec!["Authentication".to_string()],
            parameters: vec![],
            request_body: Some(RequestBodyDoc {
                description: "User registration information".to_string(),
                content_type: "application/json".to_string(),
                schema: "RegisterRequest".to_string(),
                required: true,
            }),
            responses: {
                let mut map = HashMap::new();
                map.insert("201".to_string(), ResponseDoc {
                    description: "User registered successfully".to_string(),
                    content_type: "application/json".to_string(),
                    schema: "UserResponse".to_string(),
                });
                map.insert("400".to_string(), ResponseDoc {
                    description: "Invalid registration data".to_string(),
                    content_type: "application/json".to_string(),
                    schema: "Error".to_string(),
                });
                map
            },
            security: vec![],
        },
        RouteDoc {
            path: "/auth/me".to_string(),
            method: "GET".to_string(),
            summary: "Get current user".to_string(),
            description: "Get the profile of the currently authenticated user".to_string(),
            tags: vec!["Authentication".to_string()],
            parameters: vec![],
            request_body: None,
            responses: {
                let mut map = HashMap::new();
                map.insert("200".to_string(), ResponseDoc {
                    description: "User profile retrieved successfully".to_string(),
                    content_type: "application/json".to_string(),
                    schema: "UserResponse".to_string(),
                });
                map.insert("401".to_string(), ResponseDoc {
                    description: "Unauthorized".to_string(),
                    content_type: "application/json".to_string(),
                    schema: "Error".to_string(),
                });
                map
            },
            security: vec!["bearerAuth".to_string()],
        },
    ]);

    // Add health records routes
    api_docs.add_tag("Health Records", vec![
        RouteDoc {
            path: "/api/create_record".to_string(),
            method: "POST".to_string(),
            summary: "Create a new health record".to_string(),
            description: "Create a new health record and add it to the blockchain".to_string(),
            tags: vec!["Health Records".to_string()],
            parameters: vec![],
            request_body: Some(RequestBodyDoc {
                description: "Health record data".to_string(),
                content_type: "application/json".to_string(),
                schema: "HealthRecord".to_string(),
                required: true,
            }),
            responses: {
                let mut map = HashMap::new();
                map.insert("201".to_string(), ResponseDoc {
                    description: "Record created successfully".to_string(),
                    content_type: "application/json".to_string(),
                    schema: "HealthRecord".to_string(),
                });
                map.insert("400".to_string(), ResponseDoc {
                    description: "Invalid record data".to_string(),
                    content_type: "application/json".to_string(),
                    schema: "Error".to_string(),
                });
                map.insert("401".to_string(), ResponseDoc {
                    description: "Unauthorized".to_string(),
                    content_type: "application/json".to_string(),
                    schema: "Error".to_string(),
                });
                map
            },
            security: vec!["bearerAuth".to_string()],
        },
        RouteDoc {
            path: "/api/get_patient_records".to_string(),
            method: "GET".to_string(),
            summary: "Get patient records".to_string(),
            description: "Retrieve all health records for a specific patient".to_string(),
            tags: vec!["Health Records".to_string()],
            parameters: vec![
                ParameterDoc {
                    name: "patient_id".to_string(),
                    location: "query".to_string(),
                    description: "ID of the patient".to_string(),
                    required: true,
                    schema_type: "string".to_string(),
                },
                ParameterDoc {
                    name: "page".to_string(),
                    location: "query".to_string(),
                    description: "Page number for pagination".to_string(),
                    required: false,
                    schema_type: "integer".to_string(),
                },
                ParameterDoc {
                    name: "page_size".to_string(),
                    location: "query".to_string(),
                    description: "Number of records per page".to_string(),
                    required: false,
                    schema_type: "integer".to_string(),
                },
            ],
            request_body: None,
            responses: {
                let mut map = HashMap::new();
                map.insert("200".to_string(), ResponseDoc {
                    description: "Records retrieved successfully".to_string(),
                    content_type: "application/json".to_string(),
                    schema: "PaginatedResponse".to_string(),
                });
                map.insert("401".to_string(), ResponseDoc {
                    description: "Unauthorized".to_string(),
                    content_type: "application/json".to_string(),
                    schema: "Error".to_string(),
                });
                map.insert("403".to_string(), ResponseDoc {
                    description: "Forbidden".to_string(),
                    content_type: "application/json".to_string(),
                    schema: "Error".to_string(),
                });
                map
            },
            security: vec!["bearerAuth".to_string()],
        },
    ]);

    // Add blockchain routes
    api_docs.add_tag("Blockchain", vec![
        RouteDoc {
            path: "/api/validate_blockchain".to_string(),
            method: "GET".to_string(),
            summary: "Validate blockchain".to_string(),
            description: "Validate the integrity of the blockchain".to_string(),
            tags: vec!["Blockchain".to_string()],
            parameters: vec![],
            request_body: None,
            responses: {
                let mut map = HashMap::new();
                map.insert("200".to_string(), ResponseDoc {
                    description: "Blockchain validation result".to_string(),
                    content_type: "application/json".to_string(),
                    schema: "ValidationResult".to_string(),
                });
                map.insert("401".to_string(), ResponseDoc {
                    description: "Unauthorized".to_string(),
                    content_type: "application/json".to_string(),
                    schema: "Error".to_string(),
                });
                map
            },
            security: vec!["bearerAuth".to_string()],
        },
    ]);

    Json(api_docs.generate_spec().to_string())
}

/// Routes for the Swagger documentation
pub fn routes() -> Vec<Route> {
    rocket::routes![
        swagger_ui,
        api_docs,
    ]
}

/// Fairing to add CORS headers for Swagger UI
pub struct SwaggerFairing;

#[rocket::async_trait]
impl Fairing for SwaggerFairing {
    fn info(&self) -> Info {
        Info {
            name: "Swagger UI CORS",
            kind: Kind::Response,
        }
    }

    async fn on_response<'r>(&self, _request: &'r rocket::Request<'_>, response: &mut rocket::Response<'r>) {
        response.set_header(Header::new("Access-Control-Allow-Origin", "*"));
        response.set_header(Header::new("Access-Control-Allow-Methods", "GET, POST, OPTIONS"));
        response.set_header(Header::new("Access-Control-Allow-Headers", "Content-Type, Authorization"));
    }
}
