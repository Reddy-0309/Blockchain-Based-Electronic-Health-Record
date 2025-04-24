use rocket::request::{FromRequest, Outcome, Request};
use serde::{Deserialize, Serialize};
use std::cmp::min;

/// Default pagination values
pub const DEFAULT_PAGE: u32 = 1;
pub const DEFAULT_PAGE_SIZE: u32 = 20;
pub const MAX_PAGE_SIZE: u32 = 100;

/// Pagination parameters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Pagination {
    pub page: u32,
    pub page_size: u32,
    pub total_items: Option<u64>,
    pub total_pages: Option<u32>,
}

impl Pagination {
    /// Create a new pagination with default values
    pub fn new() -> Self {
        Pagination {
            page: DEFAULT_PAGE,
            page_size: DEFAULT_PAGE_SIZE,
            total_items: None,
            total_pages: None,
        }
    }

    /// Create a new pagination with custom values
    pub fn with_params(page: u32, page_size: u32) -> Self {
        let page = if page == 0 { DEFAULT_PAGE } else { page };
        let page_size = min(page_size, MAX_PAGE_SIZE);
        let page_size = if page_size == 0 { DEFAULT_PAGE_SIZE } else { page_size };

        Pagination {
            page,
            page_size,
            total_items: None,
            total_pages: None,
        }
    }

    /// Set the total number of items and calculate total pages
    pub fn with_total_items(mut self, total_items: u64) -> Self {
        self.total_items = Some(total_items);
        self.total_pages = Some(self.calculate_total_pages(total_items));
        self
    }

    /// Calculate the total number of pages
    fn calculate_total_pages(&self, total_items: u64) -> u32 {
        let total_items = total_items as u32;
        let total_pages = (total_items + self.page_size - 1) / self.page_size;
        if total_pages == 0 { 1 } else { total_pages }
    }

    /// Get the offset for database queries
    pub fn offset(&self) -> u64 {
        ((self.page - 1) * self.page_size) as u64
    }

    /// Get the limit for database queries
    pub fn limit(&self) -> u64 {
        self.page_size as u64
    }

    /// Check if there is a next page
    pub fn has_next_page(&self) -> bool {
        match self.total_pages {
            Some(total_pages) => self.page < total_pages,
            None => true, // Assume there might be more pages if we don't know the total
        }
    }

    /// Check if there is a previous page
    pub fn has_prev_page(&self) -> bool {
        self.page > 1
    }
}

/// Response wrapper with pagination metadata
#[derive(Debug, Serialize, Deserialize)]
pub struct PaginatedResponse<T> {
    pub data: Vec<T>,
    pub pagination: Pagination,
}

impl<T> PaginatedResponse<T> {
    /// Create a new paginated response
    pub fn new(data: Vec<T>, pagination: Pagination) -> Self {
        PaginatedResponse { data, pagination }
    }

    /// Create a paginated response with the total count
    pub fn with_total_count(data: Vec<T>, pagination: Pagination, total_count: u64) -> Self {
        PaginatedResponse {
            data,
            pagination: pagination.with_total_items(total_count),
        }
    }
}

/// Pagination request guard for extracting pagination parameters from query strings
#[rocket::async_trait]
impl<'r> FromRequest<'r> for Pagination {
    type Error = std::convert::Infallible;

    async fn from_request(request: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        // Extract page and page_size from query parameters
        let page = request
            .query_value::<u32>("page")
            .and_then(|r| r.ok())
            .unwrap_or(DEFAULT_PAGE);

        let page_size = request
            .query_value::<u32>("page_size")
            .and_then(|r| r.ok())
            .unwrap_or(DEFAULT_PAGE_SIZE);

        Outcome::Success(Pagination::with_params(page, page_size))
    }
}

/// Helper function to paginate a vector
pub fn paginate<T: Clone>(items: &[T], pagination: &Pagination) -> PaginatedResponse<T> {
    let total_items = items.len() as u64;
    let start = pagination.offset() as usize;
    let end = min(start + pagination.limit() as usize, items.len());

    let data = if start < items.len() {
        items[start..end].to_vec()
    } else {
        Vec::new()
    };

    PaginatedResponse::with_total_count(data, pagination.clone(), total_items)
}
