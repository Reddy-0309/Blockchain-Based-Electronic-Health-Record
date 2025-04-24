# Blockchain-Based Electronic Health Records System

A secure, decentralized system for managing electronic health records using blockchain technology.

## Architecture

- **Backend**: Rust-based blockchain implementation for secure storage and validation of health records
- **Frontend**: JavaScript web application for healthcare providers and patients to interact with the system

## Features

- Secure storage of patient health records on a blockchain
- Role-based access control (patients, doctors, healthcare providers)
- Immutable audit trail of all record access and modifications
- Patient consent management for data sharing
- Encryption of sensitive health information
- User-friendly interface for all stakeholders

## Setup Instructions

### Prerequisites

- Rust (latest stable version)
- Node.js (v16 or higher)
- npm or yarn

### Backend Setup

```bash
cd blockchain-backend
cargo build
cargo run
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

## Project Structure

- `/blockchain-backend`: Rust implementation of the blockchain
- `/frontend`: JavaScript web application
- `/contracts`: Smart contracts for record access and management
- `/docs`: Project documentation
