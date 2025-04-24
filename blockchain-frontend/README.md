# MedChain - Blockchain-Based Electronic Health Records System Frontend

## Overview

This is the frontend application for the MedChain system, a secure, transparent, and efficient platform for managing electronic health records using blockchain technology. The frontend provides a user-friendly interface for patients, healthcare providers, and administrators to interact with the blockchain backend.

## Features

- **User Authentication**: Secure login and registration system for patients, doctors, and administrators
- **Health Records Management**: Create, view, and manage electronic health records
- **Access Control**: Grant and revoke access to health records with fine-grained permissions
- **Blockchain Verification**: Verify the integrity of the blockchain and health records
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, Safari)
- The MedChain backend server running (typically on http://localhost:8000)

### Installation

1. Clone the repository
2. Navigate to the project directory
3. Open the `index.html` file in your browser

Alternatively, you can serve the files using a simple HTTP server:

```bash
# Using Python 3
python -m http.server

# Using Node.js
npx serve
```

## Usage

### Login/Register

- Click the "Login" button to access your account
- New users can click "Register" to create an account

### Managing Health Records

- Create new health records by clicking "Create Record" on the dashboard
- View your health records in the "Health Records" section
- Each record can be viewed or shared with healthcare providers

### Access Control

- Grant access to your health records to healthcare providers
- Set access levels (Full, Limited, Emergency, Temporary)
- Revoke access when no longer needed

### Blockchain Verification

- View blockchain statistics and recent blocks
- Verify the integrity of the blockchain
- View detailed information about specific blocks

## Security Features

- JWT-based authentication
- Encrypted health records
- Blockchain-based immutability and audit trail
- Fine-grained access control

## Development

### Project Structure

- `index.html`: Main HTML file containing the application structure
- `styles.css`: CSS styles for the application
- `app.js`: JavaScript code handling application logic and API calls

### API Integration

The frontend communicates with the backend API running on http://localhost:8000. The main API endpoints used include:

- Authentication: `/auth/login`, `/auth/register`
- Health Records: `/api/records/create`, `/api/records/patient/:id`
- Access Control: `/api/access/grant`
- Blockchain: `/api/blockchain/info`, `/api/blockchain/validate`

## Future Enhancements

- Real-time notifications for access requests
- Enhanced data visualization for health records
- Integration with wearable devices and IoT sensors
- Mobile application version
- Support for FHIR and other healthcare data standards
- Telemedicine integration

## License

This project is licensed under the MIT License - see the LICENSE file for details.
