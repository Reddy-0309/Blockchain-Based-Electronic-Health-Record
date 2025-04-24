// Configuration
const API_BASE_URL = 'http://localhost:8000';

// Initialize variables
let authToken = localStorage.getItem('authToken');
let currentUser = localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')) : null;

// Initialize Bootstrap components after DOM is fully loaded
let loginModal, registerModal, createRecordModal, grantAccessModal;

// DOM Elements
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav-link');

document.addEventListener('DOMContentLoaded', function() {
    console.log('App initialized');
    checkAuthentication();
    setupEventListeners();
});

function checkAuthentication() {
    const authToken = localStorage.getItem('authToken');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (authToken && currentUser) {
        console.log('User is authenticated:', currentUser);
        showAuthenticatedUI(currentUser);
    } else {
        console.log('User is not authenticated');
        showUnauthenticatedUI();
    }
}

function setupEventListeners() {
    // Login form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            handleLogin(email, password);
        });
    }
    
    // Registration form submission
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const role = document.getElementById('register-role').value;
            handleRegistration(name, email, password, role);
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            handleLogout();
        });
    }
    
    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = this.getAttribute('data-section');
            if (targetSection) {
                showSection(targetSection);
            }
        });
    });
    
    // System check button
    const systemCheckBtn = document.getElementById('system-check-btn');
    if (systemCheckBtn) {
        systemCheckBtn.addEventListener('click', function() {
            runSystemCheck();
        });
    }
    
    // Create record form submission
    const createRecordForm = document.getElementById('create-record-form');
    if (createRecordForm) {
        createRecordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const title = document.getElementById('record-title').value;
            const type = document.getElementById('record-type').value;
            const provider = document.getElementById('record-provider').value;
            const notes = document.getElementById('record-notes').value;
            handleCreateRecord(title, type, provider, notes);
        });
    }
}

function handleLogin(email, password) {
    console.log('Login attempt:', email);
    // This is a mock login - in a real app, you would validate against a backend
    if (password.length >= 6) {
        simulateLogin(email);
        const modal = document.getElementById('login-modal');
        modal.classList.remove('show');
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        const modalBackdrop = document.querySelector('.modal-backdrop');
        if (modalBackdrop) {
            modalBackdrop.remove();
        }
        alert('Login successful!');
    } else {
        alert('Invalid credentials. Please try again.');
    }
}

function handleRegistration(name, email, password, role) {
    console.log('Registration attempt:', name, email, role);
    // This is a mock registration - in a real app, you would send this to a backend
    if (name && email && password.length >= 6) {
        simulateRegistration(name, email, password, role);
        const modal = document.getElementById('register-modal');
        modal.classList.remove('show');
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        const modalBackdrop = document.querySelector('.modal-backdrop');
        if (modalBackdrop) {
            modalBackdrop.remove();
        }
    } else {
        alert('Please fill all fields. Password must be at least 6 characters.');
    }
}

function handleLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    showUnauthenticatedUI();
    alert('You have been logged out successfully.');
}

function handleCreateRecord(title, type, provider, notes) {
    console.log('Creating record:', title, type, provider, notes);
    // This is a mock record creation - in a real app, you would send this to a backend
    alert('Record created successfully!');
    const modal = document.getElementById('create-record-modal');
    modal.classList.remove('show');
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    const modalBackdrop = document.querySelector('.modal-backdrop');
    if (modalBackdrop) {
        modalBackdrop.remove();
    }
    
    // Add the record to the table
    const table = document.getElementById('health-records-table');
    const newRow = document.createElement('tr');
    const date = new Date().toISOString().split('T')[0];
    
    newRow.innerHTML = `
        <td>${date}</td>
        <td>${title}</td>
        <td><span class="badge bg-${getBadgeColor(type)}">${type}</span></td>
        <td>${provider}</td>
        <td><span class="badge bg-success">Completed</span></td>
        <td>
            <button class="btn btn-sm btn-outline-primary me-1" onclick="alert('View record details feature will be available soon!');"><i class="bi bi-eye"></i></button>
            <button class="btn btn-sm btn-outline-secondary me-1" onclick="alert('Download record feature will be available soon!');"><i class="bi bi-download"></i></button>
            <button class="btn btn-sm btn-outline-info" onclick="alert('Share record feature will be available soon!');"><i class="bi bi-share"></i></button>
        </td>
    `;
    
    table.prepend(newRow);
}

// Helper function to get badge color based on record type
function getBadgeColor(type) {
    switch(type) {
        case 'Consultation':
            return 'info';
        case 'Lab Result':
            return 'primary';
        case 'Prescription':
            return 'success';
        case 'Immunization':
            return 'warning';
        case 'Surgery':
            return 'danger';
        default:
            return 'secondary';
    }
}

// Show authenticated UI
function showAuthenticatedUI(user) {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
    document.getElementById('user-name').textContent = user.name;
    document.getElementById('user-role').textContent = user.role;
    
    // Update navigation based on user role
    updateNavigation(user.role);
    
    // Show dashboard by default
    showSection('dashboard-section');
    updateDashboard(user);
}

// Show unauthenticated UI
function showUnauthenticatedUI() {
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('main-content').style.display = 'none';
}

// Update navigation based on user role
function updateNavigation(role) {
    // Hide all role-specific elements first
    document.querySelectorAll('.role-patient, .role-doctor, .role-admin').forEach(el => {
        el.style.display = 'none';
    });
    
    // Show elements specific to the user's role
    document.querySelectorAll(`.role-${role.toLowerCase()}`).forEach(el => {
        el.style.display = 'block';
    });
}

// Update dashboard based on user role
function updateDashboard(user) {
    const dashboardContent = document.getElementById('dashboard-content');
    const role = user.role.toLowerCase();
    
    let content = '';
    
    if (role === 'patient') {
        content = `
            <div class="row">
                <div class="col-md-6 mb-4">
                    <div class="card h-100">
                        <div class="card-header">
                            <h5 class="mb-0">Quick Actions</h5>
                        </div>
                        <div class="card-body">
                            <div class="d-grid gap-2">
                                <button class="btn btn-primary" onclick="showSection('records-section')"><i class="bi bi-file-medical me-2"></i>View My Records</button>
                                <button class="btn btn-outline-primary" onclick="showSection('access-section')"><i class="bi bi-person-lock me-2"></i>Manage Access</button>
                                <button class="btn btn-outline-primary" onclick="alert('Feature coming soon!')"><i class="bi bi-calendar-event me-2"></i>Schedule Appointment</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 mb-4">
                    <div class="card h-100">
                        <div class="card-header">
                            <h5 class="mb-0">Recent Activity</h5>
                        </div>
                        <div class="card-body">
                            <ul class="list-group list-group-flush">
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    <div>
                                        <span class="badge bg-info me-2">Record</span>
                                        Annual Physical Examination
                                    </div>
                                    <small class="text-muted">2 days ago</small>
                                </li>
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    <div>
                                        <span class="badge bg-success me-2">Access</span>
                                        Dr. Smith granted access
                                    </div>
                                    <small class="text-muted">1 week ago</small>
                                </li>
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    <div>
                                        <span class="badge bg-primary me-2">Record</span>
                                        Blood Test Results
                                    </div>
                                    <small class="text-muted">2 weeks ago</small>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else if (role === 'doctor') {
        content = `
            <div class="row">
                <div class="col-md-6 mb-4">
                    <div class="card h-100">
                        <div class="card-header">
                            <h5 class="mb-0">Quick Actions</h5>
                        </div>
                        <div class="card-body">
                            <div class="d-grid gap-2">
                                <button class="btn btn-primary" onclick="showSection('patients-section')"><i class="bi bi-people me-2"></i>View Patients</button>
                                <button class="btn btn-outline-primary" onclick="document.getElementById('create-record-modal').classList.add('show'); document.getElementById('create-record-modal').style.display = 'block'; document.getElementById('create-record-modal').setAttribute('aria-modal', 'true'); document.getElementById('create-record-modal').setAttribute('role', 'dialog');"><i class="bi bi-file-earmark-plus me-2"></i>Create Record</button>
                                <button class="btn btn-outline-primary" onclick="alert('Feature coming soon!')"><i class="bi bi-calendar-event me-2"></i>View Schedule</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 mb-4">
                    <div class="card h-100">
                        <div class="card-header">
                            <h5 class="mb-0">Upcoming Appointments</h5>
                        </div>
                        <div class="card-body">
                            <ul class="list-group list-group-flush">
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>John Doe</strong> - Annual Check-up
                                    </div>
                                    <small class="text-muted">Tomorrow, 10:00 AM</small>
                                </li>
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>Jane Smith</strong> - Follow-up
                                    </div>
                                    <small class="text-muted">May 15, 2:30 PM</small>
                                </li>
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>Robert Johnson</strong> - Consultation
                                    </div>
                                    <small class="text-muted">May 17, 11:15 AM</small>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else if (role === 'admin') {
        content = `
            <div class="row">
                <div class="col-md-6 mb-4">
                    <div class="card h-100">
                        <div class="card-header">
                            <h5 class="mb-0">Quick Actions</h5>
                        </div>
                        <div class="card-body">
                            <div class="d-grid gap-2">
                                <button class="btn btn-primary" onclick="showSection('users-section')"><i class="bi bi-people me-2"></i>Manage Users</button>
                                <button class="btn btn-outline-primary" onclick="showSection('blockchain-section')"><i class="bi bi-box me-2"></i>View Blockchain</button>
                                <button class="btn btn-outline-primary" onclick="runSystemCheck()"><i class="bi bi-gear me-2"></i>System Check</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 mb-4">
                    <div class="card h-100">
                        <div class="card-header">
                            <h5 class="mb-0">System Status</h5>
                        </div>
                        <div class="card-body">
                            <ul class="list-group list-group-flush">
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    <div>
                                        <i class="bi bi-check-circle-fill text-success me-2"></i>
                                        Blockchain Integrity
                                    </div>
                                    <span class="badge bg-success">Verified</span>
                                </li>
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    <div>
                                        <i class="bi bi-check-circle-fill text-success me-2"></i>
                                        Database Connection
                                    </div>
                                    <span class="badge bg-success">Connected</span>
                                </li>
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    <div>
                                        <i class="bi bi-check-circle-fill text-success me-2"></i>
                                        API Services
                                    </div>
                                    <span class="badge bg-success">Running</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    dashboardContent.innerHTML = content;
}

// Simulate login
function simulateLogin(email) {
    let role = 'Patient';
    if (email.startsWith('doctor')) {
        role = 'Doctor';
    } else if (email.startsWith('admin')) {
        role = 'Admin';
    }
    const authToken = 'mock-jwt-token-' + Date.now();
    const currentUser = { id: 'user-' + Date.now(), email: email, name: email.split('@')[0], role: role };
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    showAuthenticatedUI(currentUser);
}

// Simulate registration
function simulateRegistration(name, email, password, role) {
    // Hide the modal and show success message
    alert('Registration successful as ' + role + '. Please login.');
    document.getElementById('login-email').value = email;
}

// Run system check
function runSystemCheck() {
    console.log('Running system check...');
    const systemCheckResult = document.getElementById('system-check-result');
    
    systemCheckResult.innerHTML = `
        <div class="alert alert-info">
            <i class="bi bi-hourglass-split me-2"></i> Running system check...
        </div>
    `;
    
    // Simulate a system check
    setTimeout(function() {
        systemCheckResult.innerHTML = `
            <div class="alert alert-success">
                <i class="bi bi-check-circle-fill me-2"></i> All systems operational!
                <ul class="mt-2 mb-0">
                    <li>Blockchain integrity: <strong>Verified</strong></li>
                    <li>Database connection: <strong>Connected</strong></li>
                    <li>API services: <strong>Running</strong></li>
                    <li>Security checks: <strong>Passed</strong></li>
                </ul>
            </div>
        `;
    }, 2000);
}

function showSection(sectionId) {
    console.log('Showing section:', sectionId);
    
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });
    
    // Show the selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.add('active');
        selectedSection.style.display = 'block';
        
        // Update active state in navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.id === sectionId.replace('-section', '-link')) {
                link.classList.add('active');
            }
        });
    } else {
        console.error('Section not found:', sectionId);
    }
}

function initApp() {
    // Create content for all sections
    createSectionContent();
    
    // Add event listeners for logout
    document.getElementById('logout-btn').addEventListener('click', function() {
        logout();
    });
    
    // Initialize dashboard counters with mock data
    initMockData();
}

function createSectionContent() {
    // Create content for Health Records section
    createHealthRecordsSection();
    
    // Create content for Access Control section
    createAccessControlSection();
    
    // Create content for Patients section
    createPatientsSection();
    
    // Create content for Users section
    createUsersSection();
    
    // Create content for Blockchain section
    createBlockchainSection();
}

function createHealthRecordsSection() {
    const recordsSection = document.getElementById('records-section');
    if (!recordsSection) {
        console.error('Records section not found');
        return;
    }
    
    recordsSection.innerHTML = `
        <h2 class="mb-4"><i class="bi bi-file-medical me-2"></i>Health Records</h2>
        
        <div class="card shadow-sm mb-4">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">All Health Records</h5>
                <div>
                    <button class="btn btn-sm btn-outline-primary me-2" onclick="alert('Filter records feature will be available soon!');"><i class="bi bi-funnel me-1"></i>Filter</button>
                    <button class="btn btn-sm btn-primary" onclick="document.getElementById('create-record-modal').classList.add('show'); document.getElementById('create-record-modal').style.display = 'block'; document.getElementById('create-record-modal').setAttribute('aria-modal', 'true'); document.getElementById('create-record-modal').setAttribute('role', 'dialog');"><i class="bi bi-plus-lg me-1"></i>New Record</button>
                </div>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Title</th>
                                <th>Type</th>
                                <th>Provider</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="health-records-table">
                            <tr>
                                <td>2023-05-10</td>
                                <td>Annual Physical Examination</td>
                                <td><span class="badge bg-info">Consultation</span></td>
                                <td>Dr. Smith</td>
                                <td><span class="badge bg-success">Completed</span></td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary me-1" onclick="alert('View record details feature will be available soon!');"><i class="bi bi-eye"></i></button>
                                    <button class="btn btn-sm btn-outline-secondary me-1" onclick="alert('Download record feature will be available soon!');"><i class="bi bi-download"></i></button>
                                    <button class="btn btn-sm btn-outline-info" onclick="alert('Share record feature will be available soon!');"><i class="bi bi-share"></i></button>
                                </td>
                            </tr>
                            <tr>
                                <td>2023-04-15</td>
                                <td>Blood Test Results</td>
                                <td><span class="badge bg-primary">Lab Result</span></td>
                                <td>City Medical Lab</td>
                                <td><span class="badge bg-success">Completed</span></td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary me-1" onclick="alert('View record details feature will be available soon!');"><i class="bi bi-eye"></i></button>
                                    <button class="btn btn-sm btn-outline-secondary me-1" onclick="alert('Download record feature will be available soon!');"><i class="bi bi-download"></i></button>
                                    <button class="btn btn-sm btn-outline-info" onclick="alert('Share record feature will be available soon!');"><i class="bi bi-share"></i></button>
                                </td>
                            </tr>
                            <tr>
                                <td>2023-03-22</td>
                                <td>Flu Vaccination</td>
                                <td><span class="badge bg-warning">Immunization</span></td>
                                <td>Community Health Clinic</td>
                                <td><span class="badge bg-success">Completed</span></td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary me-1" onclick="alert('View record details feature will be available soon!');"><i class="bi bi-eye"></i></button>
                                    <button class="btn btn-sm btn-outline-secondary me-1" onclick="alert('Download record feature will be available soon!');"><i class="bi bi-download"></i></button>
                                    <button class="btn btn-sm btn-outline-info" onclick="alert('Share record feature will be available soon!');"><i class="bi bi-share"></i></button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function createAccessControlSection() {
    const accessSection = document.getElementById('access-section');
    if (!accessSection) {
        console.error('Access section not found');
        return;
    }
    
    accessSection.innerHTML = `
        <h2 class="mb-4"><i class="bi bi-person-lock me-2"></i>Access Control</h2>
        
        <div class="card shadow-sm mb-4">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Active Access Grants</h5>
                <button class="btn btn-sm btn-primary" onclick="alert('Grant access feature will be available soon!');"><i class="bi bi-plus-lg me-1"></i>Grant Access</button>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Provider</th>
                                <th>Access Level</th>
                                <th>Granted On</th>
                                <th>Expires On</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Dr. Smith</td>
                                <td>Full Access</td>
                                <td>2023-04-10</td>
                                <td>2023-10-10</td>
                                <td><span class="badge bg-success">Active</span></td>
                                <td>
                                    <button class="btn btn-sm btn-outline-warning me-1" onclick="alert('Edit access feature will be available soon!');"><i class="bi bi-pencil"></i></button>
                                    <button class="btn btn-sm btn-outline-danger" onclick="alert('Revoke access feature will be available soon!');"><i class="bi bi-x-circle"></i></button>
                                </td>
                            </tr>
                            <tr>
                                <td>Dr. Johnson</td>
                                <td>Read Only</td>
                                <td>2023-03-15</td>
                                <td>2023-09-15</td>
                                <td><span class="badge bg-success">Active</span></td>
                                <td>
                                    <button class="btn btn-sm btn-outline-warning me-1" onclick="alert('Edit access feature will be available soon!');"><i class="bi bi-pencil"></i></button>
                                    <button class="btn btn-sm btn-outline-danger" onclick="alert('Revoke access feature will be available soon!');"><i class="bi bi-x-circle"></i></button>
                                </td>
                            </tr>
                            <tr>
                                <td>City Medical Lab</td>
                                <td>Limited Access</td>
                                <td>2023-02-20</td>
                                <td>2023-05-20</td>
                                <td><span class="badge bg-warning">Expiring Soon</span></td>
                                <td>
                                    <button class="btn btn-sm btn-outline-warning me-1" onclick="alert('Edit access feature will be available soon!');"><i class="bi bi-pencil"></i></button>
                                    <button class="btn btn-sm btn-outline-danger" onclick="alert('Revoke access feature will be available soon!');"><i class="bi bi-x-circle"></i></button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function initMockData() {
    // Initialize dashboard counters with mock data
    const mockData = {
        patient: {
            records: 5,
            access: 3,
            activities: [
                { date: '2023-05-10', action: 'Added new health record', type: 'Record' },
                { date: '2023-05-08', action: 'Granted access to Dr. Smith', type: 'Access' },
                { date: '2023-05-05', action: 'Updated personal information', type: 'Profile' }
            ],
            appointments: [
                { date: '2023-05-15', doctor: 'Dr. Smith', type: 'Check-up' },
                { date: '2023-05-22', doctor: 'Dr. Johnson', type: 'Consultation' }
            ]
        },
        doctor: {
            patients: 12,
            records: 45,
            appointments: [
                { time: '09:00', patient: 'John Doe', type: 'Check-up', status: 'Confirmed' },
                { time: '10:30', patient: 'Jane Smith', type: 'Follow-up', status: 'Confirmed' },
                { time: '13:00', patient: 'Robert Brown', type: 'New Patient', status: 'Pending' }
            ],
            notifications: [
                { time: '08:15', message: 'New access request from patient Jane Smith' },
                { time: 'Yesterday', message: 'New lab results available for patient John Doe' },
                { time: '2 days ago', message: 'Appointment rescheduled with Robert Brown' }
            ]
        },
        admin: {
            users: 45,
            records: 156,
            blocks: 28,
            audits: 320,
            alerts: [
                { time: '1 hour ago', message: 'New user registered', type: 'info' },
                { time: '3 hours ago', message: 'Blockchain validation completed', type: 'success' },
                { time: 'Yesterday', message: 'Failed login attempt detected', type: 'warning' }
            ]
        }
    };
    
    // Update patient dashboard
    if (document.getElementById('patient-record-count')) {
        document.getElementById('patient-record-count').textContent = mockData.patient.records;
        document.getElementById('patient-access-count').textContent = mockData.patient.access;
        
        const activityList = document.getElementById('patient-activity-list');
        if (activityList) {
            activityList.innerHTML = '';
            mockData.patient.activities.forEach(activity => {
                activityList.innerHTML += `
                    <div class="list-group-item">
                        <div class="d-flex w-100 justify-content-between">
                            <h6 class="mb-1">${activity.action}</h6>
                            <small>${activity.date}</small>
                        </div>
                        <small class="text-muted">Type: ${activity.type}</small>
                    </div>
                `;
            });
        }
        
        const appointmentsList = document.getElementById('patient-appointments-list');
        if (appointmentsList) {
            appointmentsList.innerHTML = '';
            mockData.patient.appointments.forEach(appointment => {
                appointmentsList.innerHTML += `
                    <div class="list-group-item">
                        <div class="d-flex w-100 justify-content-between">
                            <h6 class="mb-1">${appointment.type} with ${appointment.doctor}</h6>
                            <small>${appointment.date}</small>
                        </div>
                        <small class="text-muted">Upcoming appointment</small>
                    </div>
                `;
            });
        }
    }
    
    // Update doctor dashboard
    if (document.getElementById('doctor-patient-count')) {
        document.getElementById('doctor-patient-count').textContent = mockData.doctor.patients;
        document.getElementById('doctor-record-count').textContent = mockData.doctor.records;
        
        const appointmentsTable = document.getElementById('doctor-appointments-table');
        if (appointmentsTable) {
            appointmentsTable.innerHTML = '';
            mockData.doctor.appointments.forEach(appointment => {
                appointmentsTable.innerHTML += `
                    <tr>
                        <td>${appointment.time}</td>
                        <td>${appointment.patient}</td>
                        <td><span class="badge bg-info">${appointment.type}</span></td>
                        <td><span class="badge bg-${appointment.status === 'Confirmed' ? 'success' : 'warning'}">${appointment.status}</span></td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary" onclick="alert('View patient details feature will be available soon!');">View</button>
                        </td>
                    </tr>
                `;
            });
        }
        
        const notificationsList = document.getElementById('doctor-notifications-list');
        if (notificationsList) {
            notificationsList.innerHTML = '';
            mockData.doctor.notifications.forEach(notification => {
                notificationsList.innerHTML += `
                    <div class="list-group-item">
                        <div class="d-flex w-100 justify-content-between">
                            <h6 class="mb-1">${notification.message}</h6>
                            <small>${notification.time}</small>
                        </div>
                    </div>
                `;
            });
        }
    }
    
    // Update admin dashboard
    if (document.getElementById('admin-user-count')) {
        document.getElementById('admin-user-count').textContent = mockData.admin.users;
        document.getElementById('admin-record-count').textContent = mockData.admin.records;
        document.getElementById('admin-block-count').textContent = mockData.admin.blocks;
        document.getElementById('admin-audit-count').textContent = mockData.admin.audits;
        
        const alertsList = document.getElementById('admin-alerts-list');
        if (alertsList) {
            alertsList.innerHTML = '';
            mockData.admin.alerts.forEach(alert => {
                const alertType = alert.type === 'info' ? 'primary' : 
                                 alert.type === 'success' ? 'success' : 
                                 alert.type === 'warning' ? 'warning' : 'danger';
                alertsList.innerHTML += `
                    <div class="list-group-item">
                        <div class="d-flex w-100 justify-content-between">
                            <h6 class="mb-1">
                                <span class="badge bg-${alertType} me-2">${alert.type.toUpperCase()}</span>
                                ${alert.message}
                            </h6>
                            <small>${alert.time}</small>
                        </div>
                    </div>
                `;
            });
        }
    }
}

function checkAuthStatus() {
    const authToken = localStorage.getItem('authToken');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    if (authToken && currentUser) {
        // User is logged in
        console.log('User is logged in:', currentUser);
        
        // Update UI for logged in user
        document.querySelector('.user-info').style.display = 'block';
        document.getElementById('username-display').textContent = currentUser.name;
        document.getElementById('login-btn').style.display = 'none';
        document.getElementById('register-btn').style.display = 'none';
        document.getElementById('logout-btn').style.display = 'inline-block';
        
        // Show role-specific elements
        showRoleSpecificElements(currentUser.role);
        
        // Show dashboard for the user's role
        showDashboardForRole(currentUser.role);
    } else {
        // User is not logged in
        console.log('User is not logged in');
        
        // Update UI for guest user
        document.querySelector('.user-info').style.display = 'none';
        document.getElementById('login-btn').style.display = 'inline-block';
        document.getElementById('register-btn').style.display = 'inline-block';
        document.getElementById('logout-btn').style.display = 'none';
        
        // Show guest dashboard
        showGuestDashboard();
    }
}

function showRoleSpecificElements(role) {
    // Hide all role-specific elements first
    document.querySelectorAll('.patient-only, .doctor-only, .admin-only').forEach(el => {
        el.style.display = 'none';
    });
    
    // Show elements specific to the user's role
    if (role === 'Patient') {
        document.querySelectorAll('.patient-only').forEach(el => {
            el.style.display = 'block';
        });
    } else if (role === 'Doctor') {
        document.querySelectorAll('.doctor-only').forEach(el => {
            el.style.display = 'block';
        });
    } else if (role === 'Admin') {
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'block';
        });
    }
    
    // For nav items, we need to use flex instead of block
    document.querySelectorAll('.nav-item.' + role.toLowerCase() + '-only').forEach(el => {
        el.style.display = 'flex';
    });
}

function showDashboardForRole(role) {
    // Hide all dashboards first
    document.querySelectorAll('.role-dashboard').forEach(dashboard => {
        dashboard.style.display = 'none';
    });
    
    // Show dashboard for the user's role
    if (role === 'Patient') {
        document.getElementById('patient-dashboard').style.display = 'block';
    } else if (role === 'Doctor') {
        document.getElementById('doctor-dashboard').style.display = 'block';
    } else if (role === 'Admin') {
        document.getElementById('admin-dashboard').style.display = 'block';
    }
    
    // Show the dashboard section
    showSection('dashboard-section');
}

function showGuestDashboard() {
    // Hide all dashboards first
    document.querySelectorAll('.role-dashboard').forEach(dashboard => {
        dashboard.style.display = 'none';
    });
    
    // Show guest dashboard
    document.getElementById('guest-dashboard').style.display = 'block';
    
    // Show the dashboard section
    showSection('dashboard-section');
}

function simulateLogin(email, password) {
    // Determine role based on email prefix
    let role = 'Patient';
    if (email.startsWith('doctor')) {
        role = 'Doctor';
    } else if (email.startsWith('admin')) {
        role = 'Admin';
    }
    
    // Create mock user and auth token
    const authToken = 'mock-jwt-token-' + Date.now();
    const currentUser = { 
        id: 'user-' + Date.now(), 
        email: email, 
        name: email.split('@')[0], 
        role: role 
    };
    
    // Store in localStorage
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    console.log('User logged in:', currentUser);
    
    // Update UI for logged in user
    checkAuthStatus();
    
    return true;
}

function simulateRegistration(name, email, password, role) {
    console.log('User registered:', { name, email, role });
    
    // Pre-fill login form with registered email
    document.getElementById('login-email').value = email;
    
    return true;
}

function logout() {
    // Clear auth data from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    
    console.log('User logged out');
    
    // Update UI for guest user
    checkAuthStatus();
}

// Function to run a system check (for admin dashboard)
function runSystemCheck() {
    console.log('Running system check...');
    
    // Simulate system check
    setTimeout(() => {
        console.log('System check completed');
        alert('System check completed successfully. All systems operational.');
    }, 2000);
}

// Setup navigation event listeners
function setupNavigation() {
    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = this.getAttribute('data-section');
            if (targetSection) {
                showSection(targetSection);
            }
        });
    });
    
    // Dashboard buttons
    document.querySelectorAll('.dashboard-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');
            if (targetSection) {
                showSection(targetSection);
            }
        });
    });
    
    // Action buttons
    document.getElementById('create-record-btn')?.addEventListener('click', () => createRecordModal.show());
    document.getElementById('grant-access-btn')?.addEventListener('click', () => grantAccessModal.show());
    document.getElementById('view-patients-btn')?.addEventListener('click', loadPatients);
    document.getElementById('run-check-btn')?.addEventListener('click', runSystemCheck);
    document.getElementById('view-audit-btn')?.addEventListener('click', loadAuditLogs);
    document.getElementById('view-users-btn')?.addEventListener('click', loadUsers);
}

// Setup auth buttons
function setupAuthButtons() {
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    
    // Set initial state
    if (authToken) {
        loginBtn.innerHTML = '<i class="bi bi-box-arrow-right me-1"></i> Logout';
        loginBtn.addEventListener('click', logout);
        registerBtn.style.display = 'none';
    } else {
        loginBtn.innerHTML = '<i class="bi bi-box-arrow-in-right me-1"></i> Login';
        loginBtn.addEventListener('click', () => loginModal.show());
        registerBtn.style.display = 'block';
    }
}

// Setup form submissions
function setupForms() {
    // Login form
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        // For demo purposes, simulate a successful login
        simulateLogin(email, password);
    });
    
    // Register form
    document.getElementById('register-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const role = document.getElementById('register-role').value;
        
        // For demo purposes, simulate a successful registration
        simulateRegistration(name, email, password, role);
    });
    
    // Create record form
    document.getElementById('create-record-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const patientId = document.getElementById('record-patient-id').value;
        const recordType = document.getElementById('record-type').value;
        const recordData = document.getElementById('record-data').value;
        
        // For demo purposes, simulate a successful record creation
        createRecordModal.hide();
        showMessage('Health record created successfully', 'success');
        
        // Refresh the dashboard data
        loadDashboardData();
    });
    
    // Grant access form
    document.getElementById('grant-access-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const doctorId = document.getElementById('access-doctor-id').value;
        const recordId = document.getElementById('access-record-id').value;
        const expiryDate = document.getElementById('access-expiry-date').value;
        
        // For demo purposes, simulate a successful access grant
        grantAccessModal.hide();
        showMessage('Access granted successfully', 'success');
        
        // Refresh the dashboard data
        loadDashboardData();
    });
}

// Setup action buttons
function setupActionButtons() {
    // Create record buttons
    document.getElementById('create-record-btn').addEventListener('click', () => {
        if (!authToken) {
            showMessage('Please login first', 'warning');
            loginModal.show();
            return;
        }
        createRecordModal.show();
    });
    
    document.getElementById('new-record-btn').addEventListener('click', () => {
        if (!authToken) {
            showMessage('Please login first', 'warning');
            loginModal.show();
            return;
        }
        createRecordModal.show();
    });
    
    // Blockchain verification
    document.getElementById('verify-btn').addEventListener('click', () => {
        if (!authToken) {
            showMessage('Please login first', 'warning');
            loginModal.show();
            return;
        }
        simulateVerifyBlockchain();
    });
    
    document.getElementById('validate-chain-btn').addEventListener('click', () => {
        if (!authToken) {
            showMessage('Please login first', 'warning');
            loginModal.show();
            return;
        }
        simulateVerifyBlockchain();
    });
    
    // View latest block
    document.getElementById('view-last-block-btn').addEventListener('click', () => {
        if (!authToken) {
            showMessage('Please login first', 'warning');
            loginModal.show();
            return;
        }
        showSection('blockchain-section');
        loadBlockchainInfo();
    });
    
    // Manage access
    document.getElementById('manage-access-btn').addEventListener('click', () => {
        if (!authToken) {
            showMessage('Please login first', 'warning');
            loginModal.show();
            return;
        }
        showSection('access-section');
        loadAccessGrants();
    });
}

// Setup dashboard buttons
function setupDashboardButtons() {
    // Guest dashboard buttons
    document.getElementById('dashboard-login-btn').addEventListener('click', () => {
        loginModal.show();
    });
    
    document.getElementById('dashboard-register-btn').addEventListener('click', () => {
        registerModal.show();
    });
    
    // Patient dashboard buttons
    document.getElementById('view-my-records-btn').addEventListener('click', () => {
        showSection('records-section');
        loadHealthRecords();
    });
    
    document.getElementById('manage-my-access-btn').addEventListener('click', () => {
        showSection('access-section');
        loadAccessGrants();
    });
    
    document.getElementById('patient-add-record-btn').addEventListener('click', () => {
        createRecordModal.show();
    });
    
    // Doctor dashboard buttons
    document.getElementById('view-my-patients-btn').addEventListener('click', () => {
        showSection('patients-section');
        loadPatients();
    });
    
    document.getElementById('view-created-records-btn').addEventListener('click', () => {
        showSection('records-section');
        loadHealthRecords();
    });
    
    document.getElementById('doctor-add-record-btn').addEventListener('click', () => {
        createRecordModal.show();
    });
    
    // Admin dashboard buttons
    document.getElementById('view-all-users-btn').addEventListener('click', () => {
        showSection('users-section');
        loadUsers();
    });
    
    document.getElementById('view-all-records-btn').addEventListener('click', () => {
        showSection('records-section');
        loadHealthRecords();
    });
    
    document.getElementById('view-blockchain-btn').addEventListener('click', () => {
        showSection('blockchain-section');
        loadBlockchainInfo();
    });
    
    document.getElementById('view-audit-logs-btn').addEventListener('click', () => {
        showSection('audit-section');
        loadAuditLogs();
    });
    
    document.getElementById('run-system-check-btn').addEventListener('click', () => {
        runSystemCheck();
    });
}

// Simulated authentication functions for demo purposes
function simulateLogin(email, password) {
    // Determine role based on email prefix for demo purposes
    let role = 'Patient';
    if (email.startsWith('doctor')) {
        role = 'Doctor';
    } else if (email.startsWith('admin')) {
        role = 'Admin';
    }
    
    // Create a mock user and token
    authToken = 'mock-jwt-token-' + Date.now();
    currentUser = {
        id: 'user-' + Date.now(),
        email: email,
        name: email.split('@')[0],
        role: role
    };
    
    // Save to localStorage
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Update UI
    updateAuthUI();
    loginModal.hide();
    
    // Load data
    loadDashboardData();
    
    showMessage(`Login successful as ${role}`, 'success');
}

function simulateRegistration(name, email, password, role) {
    registerModal.hide();
    showMessage(`Registration successful as ${role}. Please login.`, 'success');
    
    // Pre-fill the login form
    document.getElementById('login-email').value = email;
    loginModal.show();
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    updateAuthUI();
    showSection('dashboard-section');
    showMessage('You have been logged out', 'info');
}

function updateAuthUI() {
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const userInfo = document.querySelector('.user-info');
    const usernameDisplay = document.getElementById('username-display');
    
    // Get references to role-specific dashboards
    const roleDashboards = [
        document.getElementById('guest-dashboard'),
        document.getElementById('patient-dashboard'),
        document.getElementById('doctor-dashboard'),
        document.getElementById('admin-dashboard')
    ];
    
    // Hide all role-specific elements
    document.querySelectorAll('.patient-only, .doctor-only, .admin-only').forEach(el => {
        el.style.display = 'none';
    });
    
    // Hide all role dashboards
    roleDashboards.forEach(dashboard => {
        if (dashboard) dashboard.style.display = 'none';
    });
    
    if (authToken) {
        // User is logged in
        loginBtn.textContent = 'Logout';
        loginBtn.innerHTML = '<i class="bi bi-box-arrow-right me-1"></i> Logout';
        loginBtn.onclick = logout;
        registerBtn.style.display = 'none';
        
        // Show user info
        userInfo.style.display = 'inline-block';
        usernameDisplay.textContent = currentUser.name;
        
        // Hide guest dashboard
        const guestDashboard = document.getElementById('guest-dashboard');
        if (guestDashboard) guestDashboard.style.display = 'none';
        
        // Show role-specific elements and dashboard
        if (currentUser.role === 'Patient') {
            document.querySelectorAll('.patient-only').forEach(el => {
                el.style.display = 'block';
            });
            const patientDashboard = document.getElementById('patient-dashboard');
            if (patientDashboard) patientDashboard.style.display = 'block';
            
            // Update patient dashboard data
            document.getElementById('patient-record-count').textContent = '3';
            document.getElementById('patient-access-count').textContent = '2';
            
            // Load patient activity
            loadPatientActivity();
            loadPatientAppointments();
            
        } else if (currentUser.role === 'Doctor') {
            document.querySelectorAll('.doctor-only').forEach(el => {
                el.style.display = 'block';
            });
            const doctorDashboard = document.getElementById('doctor-dashboard');
            if (doctorDashboard) doctorDashboard.style.display = 'block';
            
            // Update doctor dashboard data
            document.getElementById('doctor-patient-count').textContent = '12';
            document.getElementById('doctor-record-count').textContent = '47';
            
            // Load doctor appointments and notifications
            loadDoctorAppointments();
            loadDoctorNotifications();
            
        } else if (currentUser.role === 'Admin') {
            document.querySelectorAll('.admin-only').forEach(el => {
                el.style.display = 'block';
            });
            const adminDashboard = document.getElementById('admin-dashboard');
            if (adminDashboard) adminDashboard.style.display = 'block';
            
            // Update admin dashboard data
            document.getElementById('admin-user-count').textContent = '156';
            document.getElementById('admin-record-count').textContent = '423';
            document.getElementById('admin-block-count').textContent = '42';
            document.getElementById('admin-audit-count').textContent = '1,205';
            
            // Load admin alerts
            loadAdminAlerts();
        }
    } else {
        // User is logged out
        loginBtn.textContent = 'Login';
        loginBtn.innerHTML = '<i class="bi bi-box-arrow-in-right me-1"></i> Login';
        loginBtn.onclick = function() {
            loginModal.show();
        };
        registerBtn.style.display = 'block';
        
        // Hide user info
        userInfo.style.display = 'none';
        
        // Show guest dashboard
        const guestDashboard = document.getElementById('guest-dashboard');
        if (guestDashboard) guestDashboard.style.display = 'block';
    }
}

// Simulated Health Records functions
function loadHealthRecords() {
    if (!authToken) return;
    
    // Mock data for demonstration
    const mockRecords = [
        {
            id: 'rec-' + Math.random().toString(36).substring(2, 10),
            record_type: 'Consultation',
            timestamp: new Date().toISOString(),
            provider_id: 'prov-' + Math.random().toString(36).substring(2, 10),
            title: 'Annual Checkup'
        },
        {
            id: 'rec-' + Math.random().toString(36).substring(2, 10),
            record_type: 'LabResult',
            timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            provider_id: 'prov-' + Math.random().toString(36).substring(2, 10),
            title: 'Blood Test Results'
        },
        {
            id: 'rec-' + Math.random().toString(36).substring(2, 10),
            record_type: 'Prescription',
            timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            provider_id: 'prov-' + Math.random().toString(36).substring(2, 10),
            title: 'Antibiotic Prescription'
        }
    ];
    
    displayHealthRecords(mockRecords);
}

function displayHealthRecords(records) {
    const tableBody = document.getElementById('records-table-body');
    tableBody.innerHTML = '';
    
    if (records.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center">No records found</td></tr>`;
        return;
    }
    
    records.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.id.substring(0, 8)}...</td>
            <td>${record.record_type}</td>
            <td>${new Date(record.timestamp).toLocaleString()}</td>
            <td>${record.provider_id.substring(0, 8)}...</td>
            <td>
                <button class="btn btn-sm btn-primary view-record" data-id="${record.id}">View</button>
                <button class="btn btn-sm btn-secondary share-record" data-id="${record.id}">Share</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // Add event listeners to buttons
    document.querySelectorAll('.view-record').forEach(button => {
        button.addEventListener('click', () => simulateViewRecord(button.dataset.id));
    });
    
    document.querySelectorAll('.share-record').forEach(button => {
        button.addEventListener('click', () => {
            document.getElementById('record-id').value = button.dataset.id;
            showSection('access-section');
        });
    });
}

function simulateCreateHealthRecord(recordType, patientId, title) {
    createRecordModal.hide();
    showMessage('Health record created successfully', 'success');
    loadHealthRecords();
}

function simulateViewRecord(recordId) {
    // Display record details in a modal or alert for simplicity
    alert(`Record Details:\n\nRecord ID: ${recordId}\nTitle: Sample Record\nType: Consultation\nContent: This is a sample record content for demonstration purposes.\nCreated: ${new Date().toLocaleString()}`);
}

// Simulated Access Control functions
function loadAccessGrants() {
    if (!authToken) return;
    
    // Mock data for demonstration
    const mockGrants = [
        {
            id: 'grant-' + Math.random().toString(36).substring(2, 10),
            provider_id: 'prov-' + Math.random().toString(36).substring(2, 10),
            record_id: 'rec-' + Math.random().toString(36).substring(2, 10),
            access_level: 'Full',
            expires_at: new Date(Date.now() + 2592000000).toISOString() // 30 days from now
        },
        {
            id: 'grant-' + Math.random().toString(36).substring(2, 10),
            provider_id: 'prov-' + Math.random().toString(36).substring(2, 10),
            record_id: 'rec-' + Math.random().toString(36).substring(2, 10),
            access_level: 'Limited',
            expires_at: new Date(Date.now() + 604800000).toISOString() // 7 days from now
        }
    ];
    
    displayAccessGrants(mockGrants);
}

function displayAccessGrants(grants) {
    const tableBody = document.getElementById('access-table-body');
    tableBody.innerHTML = '';
    
    if (!grants || grants.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center">No access grants found</td></tr>`;
        return;
    }
    
    grants.forEach(grant => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${grant.provider_id.substring(0, 8)}...</td>
            <td>${grant.record_id.substring(0, 8)}...</td>
            <td>${grant.access_level}</td>
            <td>${new Date(grant.expires_at).toLocaleString()}</td>
            <td>
                <button class="btn btn-sm btn-danger revoke-access" data-id="${grant.id}">Revoke</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // Add event listeners to revoke buttons
    document.querySelectorAll('.revoke-access').forEach(button => {
        button.addEventListener('click', () => simulateRevokeAccess(button.dataset.id));
    });
}

function simulateGrantAccess(providerId, recordId, accessLevel) {
    showMessage('Access granted successfully', 'success');
    loadAccessGrants();
}

function simulateRevokeAccess(grantId) {
    if (!confirm('Are you sure you want to revoke this access?')) {
        return;
    }
    
    showMessage('Access revoked successfully', 'success');
    loadAccessGrants();
}

// Simulated Blockchain functions
function loadBlockchainInfo() {
    if (!authToken) return;
    
    // Mock data for demonstration
    const mockInfo = {
        total_blocks: 42,
        total_transactions: 156,
        last_block_time: new Date().toISOString(),
        is_valid: true
    };
    
    displayBlockchainInfo(mockInfo);
    loadRecentBlocks();
}

function displayBlockchainInfo(info) {
    document.getElementById('total-blocks').textContent = info.total_blocks;
    document.getElementById('total-transactions').textContent = info.total_transactions;
    document.getElementById('last-block-time').textContent = new Date(info.last_block_time).toLocaleString();
    
    const statusElement = document.getElementById('chain-status');
    statusElement.textContent = info.is_valid ? 'Valid' : 'Invalid';
    statusElement.className = info.is_valid ? 'status-valid' : 'status-invalid';
}

function loadRecentBlocks() {
    if (!authToken) return;
    
    // Mock data for demonstration
    const mockBlocks = [
        {
            index: 42,
            hash: '0x' + Math.random().toString(36).substring(2, 34),
            timestamp: new Date().toISOString(),
            transactions: [{ id: 'tx-1' }, { id: 'tx-2' }]
        },
        {
            index: 41,
            hash: '0x' + Math.random().toString(36).substring(2, 34),
            timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
            transactions: [{ id: 'tx-3' }]
        },
        {
            index: 40,
            hash: '0x' + Math.random().toString(36).substring(2, 34),
            timestamp: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
            transactions: [{ id: 'tx-4' }, { id: 'tx-5' }, { id: 'tx-6' }]
        }
    ];
    
    displayRecentBlocks(mockBlocks);
}

function displayRecentBlocks(blocks) {
    const tableBody = document.getElementById('blocks-table-body');
    tableBody.innerHTML = '';
    
    if (!blocks || blocks.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center">No blocks found</td></tr>`;
        return;
    }
    
    blocks.forEach(block => {
        const row = document.createElement('tr');
        
        let statusBadge = '';
        if (block.transactions.length > 0) {
            statusBadge = '<span class="badge bg-success">Valid</span>';
        } else {
            statusBadge = '<span class="badge bg-danger">Invalid</span>';
        }
        
        row.innerHTML = `
            <td>${block.index}</td>
            <td><span class="hash-display" title="${block.hash}">${block.hash}</span></td>
            <td>${new Date(block.timestamp).toLocaleString()}</td>
            <td>${block.transactions.length}</td>
            <td>
                <button class="btn btn-sm btn-info view-block" data-hash="${block.hash}">Details</button>
                ${statusBadge}
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to view block buttons
    document.querySelectorAll('.view-block').forEach(button => {
        button.addEventListener('click', () => simulateViewBlockDetails(button.dataset.hash));
    });
}

function simulateVerifyBlockchain() {
    // Simulate blockchain verification
    const isValid = true; // Always valid for demo
    
    const statusElement = document.getElementById('chain-status');
    statusElement.textContent = isValid ? 'Valid' : 'Invalid';
    statusElement.className = isValid ? 'status-valid' : 'status-invalid';
    
    showMessage(`Blockchain validation: ${isValid ? 'Valid' : 'Invalid'}`, isValid ? 'success' : 'danger');
}

function simulateViewBlockDetails(blockHash) {
    // Display block details in a modal or alert for simplicity
    alert(`Block Details:\n\nHash: ${blockHash}\nIndex: 42\nPrevious Hash: 0x${Math.random().toString(36).substring(2, 34)}\nTimestamp: ${new Date().toLocaleString()}\nNonce: ${Math.floor(Math.random() * 1000000)}\n\nTransactions:\n- CreateRecord: tx-${Math.floor(Math.random() * 1000)}\n- AccessGrant: tx-${Math.floor(Math.random() * 1000)}`);
}

// Dashboard functions
function loadDashboardData() {
    if (!authToken) {
        // Guest dashboard - show general information
        return;
    }
    
    // Role-specific data loading
    if (currentUser.role === 'Patient') {
        // Load patient-specific data
        loadPatientActivity();
        loadPatientAppointments();
    } else if (currentUser.role === 'Doctor') {
        // Load doctor-specific data
        loadDoctorAppointments();
        loadDoctorNotifications();
    } else if (currentUser.role === 'Admin') {
        // Load admin-specific data
        loadAdminAlerts();
    }
    
    console.log('Dashboard data loaded for role:', currentUser.role);
}

// Patient-specific functions
function loadPatientActivity() {
    if (!authToken) return;
    
    // Mock data for patient activity
    const activities = [
        {
            id: 'act-' + Math.random().toString(36).substring(2, 10),
            type: 'Record Access',
            description: 'Dr. Sarah Johnson accessed your blood test results',
            timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
        },
        {
            id: 'act-' + Math.random().toString(36).substring(2, 10),
            type: 'Record Created',
            description: 'New prescription added by Dr. Michael Chen',
            timestamp: new Date(Date.now() - 86400000).toISOString() // 1 day ago
        },
        {
            id: 'act-' + Math.random().toString(36).substring(2, 10),
            type: 'Access Granted',
            description: 'You granted access to Dr. Emily Wilson',
            timestamp: new Date(Date.now() - 172800000).toISOString() // 2 days ago
        }
    ];
    
    displayPatientActivity(activities);
}

function displayPatientActivity(activities) {
    const activityList = document.getElementById('patient-activity-list');
    activityList.innerHTML = '';
    
    if (activities.length === 0) {
        activityList.innerHTML = `<div class="list-group-item text-center">No recent activity</div>`;
        return;
    }
    
    activities.forEach(activity => {
        const activityTime = new Date(activity.timestamp);
        const timeAgo = getTimeAgo(activityTime);
        
        const item = document.createElement('a');
        item.href = '#';
        item.className = 'list-group-item list-group-item-action';
        
        let icon = '';
        if (activity.type === 'Record Access') {
            icon = '<i class="bi bi-eye text-info me-2"></i>';
        } else if (activity.type === 'Record Created') {
            icon = '<i class="bi bi-file-earmark-plus text-success me-2"></i>';
        } else if (activity.type === 'Access Granted') {
            icon = '<i class="bi bi-shield-check text-primary me-2"></i>';
        }
        
        item.innerHTML = `
            <div class="d-flex w-100 justify-content-between">
                <h6 class="mb-1">${icon}${activity.type}</h6>
                <small class="text-muted">${timeAgo}</small>
            </div>
            <p class="mb-1">${activity.description}</p>
        `;
        
        activityList.appendChild(item);
    });
}

function loadPatientAppointments() {
    if (!authToken) return;
    
    // Mock data for patient appointments
    const appointments = [
        {
            id: 'apt-' + Math.random().toString(36).substring(2, 10),
            doctor: 'Dr. Sarah Johnson',
            type: 'Annual Checkup',
            date: new Date(Date.now() + 172800000).toISOString(), // 2 days from now
            status: 'Confirmed'
        },
        {
            id: 'apt-' + Math.random().toString(36).substring(2, 10),
            doctor: 'Dr. Michael Chen',
            type: 'Follow-up',
            date: new Date(Date.now() + 604800000).toISOString(), // 7 days from now
            status: 'Pending'
        }
    ];
    
    displayPatientAppointments(appointments);
}

function displayPatientAppointments(appointments) {
    const appointmentsList = document.getElementById('patient-appointments-list');
    appointmentsList.innerHTML = '';
    
    if (appointments.length === 0) {
        appointmentsList.innerHTML = `<div class="list-group-item text-center">No upcoming appointments</div>`;
        return;
    }
    
    appointments.forEach(appointment => {
        const appointmentDate = new Date(appointment.date);
        const formattedDate = appointmentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const formattedTime = appointmentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        
        const item = document.createElement('a');
        item.href = '#';
        item.className = 'list-group-item list-group-item-action';
        
        let statusBadge = '';
        if (appointment.status === 'Confirmed') {
            statusBadge = '<span class="badge bg-success float-end">Confirmed</span>';
        } else if (appointment.status === 'Pending') {
            statusBadge = '<span class="badge bg-warning text-dark float-end">Pending</span>';
        }
        
        item.innerHTML = `
            <div class="d-flex w-100 justify-content-between">
                <h6 class="mb-1">${appointment.doctor}</h6>
                ${statusBadge}
            </div>
            <p class="mb-1">${appointment.type}</p>
            <small class="text-muted"><i class="bi bi-calendar me-1"></i>${formattedDate} at ${formattedTime}</small>
        `;
        
        appointmentsList.appendChild(item);
    });
}

// Doctor-specific functions
function loadPatients() {
    if (!authToken || currentUser.role !== 'Doctor') return;
    
    // Mock data for doctor's patients
    const patients = [
        {
            id: 'pat-' + Math.random().toString(36).substring(2, 10),
            name: 'John Smith',
            age: 42,
            lastVisit: new Date(Date.now() - 604800000).toISOString(), // 7 days ago
            condition: 'Hypertension'
        },
        {
            id: 'pat-' + Math.random().toString(36).substring(2, 10),
            name: 'Emma Johnson',
            age: 35,
            lastVisit: new Date(Date.now() - 1209600000).toISOString(), // 14 days ago
            condition: 'Diabetes Type 2'
        },
        {
            id: 'pat-' + Math.random().toString(36).substring(2, 10),
            name: 'Michael Brown',
            age: 28,
            lastVisit: new Date(Date.now() - 2592000000).toISOString(), // 30 days ago
            condition: 'Asthma'
        }
    ];
    
    // Display patients in a section that would be created for this purpose
    showMessage('Patients loaded successfully', 'success');
}

function loadDoctorAppointments() {
    if (!authToken || currentUser.role !== 'Doctor') return;
    
    // Mock data for doctor's appointments
    const appointments = [
        {
            id: 'apt-' + Math.random().toString(36).substring(2, 10),
            patient: 'John Smith',
            type: 'Follow-up',
            time: '09:00 AM',
            status: 'Scheduled'
        },
        {
            id: 'apt-' + Math.random().toString(36).substring(2, 10),
            patient: 'Emma Johnson',
            type: 'Consultation',
            time: '10:30 AM',
            status: 'Checked In'
        },
        {
            id: 'apt-' + Math.random().toString(36).substring(2, 10),
            patient: 'Robert Brown',
            type: 'Annual Checkup',
            time: '02:15 PM',
            status: 'Scheduled'
        }
    ];
    
    displayDoctorAppointments(appointments);
}

function displayDoctorAppointments(appointments) {
    const appointmentsTable = document.getElementById('doctor-appointments-table');
    appointmentsTable.innerHTML = '';
    
    if (appointments.length === 0) {
        appointmentsTable.innerHTML = `<tr><td colspan="5" class="text-center">No appointments scheduled for today</td></tr>`;
        return;
    }
    
    appointments.forEach(appointment => {
        const row = document.createElement('tr');
        
        let statusBadge = '';
        if (appointment.status === 'Scheduled') {
            statusBadge = '<span class="badge bg-primary">Scheduled</span>';
        } else if (appointment.status === 'Checked In') {
            statusBadge = '<span class="badge bg-success">Checked In</span>';
        } else if (appointment.status === 'Completed') {
            statusBadge = '<span class="badge bg-secondary">Completed</span>';
        }
        
        row.innerHTML = `
            <td>${appointment.time}</td>
            <td>${appointment.patient}</td>
            <td>${appointment.type}</td>
            <td>${statusBadge}</td>
            <td>
                <button class="btn btn-sm btn-primary view-patient" data-id="${appointment.id}">View</button>
                <button class="btn btn-sm btn-success start-appointment" data-id="${appointment.id}">Start</button>
            </td>
        `;
        
        appointmentsTable.appendChild(row);
    });
    
    // Add event listeners to buttons
    document.querySelectorAll('.view-patient').forEach(button => {
        button.addEventListener('click', () => viewPatient(button.dataset.id));
    });
    
    document.querySelectorAll('.start-appointment').forEach(button => {
        button.addEventListener('click', () => startAppointment(button.dataset.id));
    });
}

function loadDoctorNotifications() {
    if (!authToken || currentUser.role !== 'Doctor') return;
    
    // Mock data for doctor's notifications
    const notifications = [
        {
            id: 'not-' + Math.random().toString(36).substring(2, 10),
            type: 'Access Request',
            message: 'Emma Johnson requested access to her lab results',
            timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
        },
        {
            id: 'not-' + Math.random().toString(36).substring(2, 10),
            type: 'Appointment',
            message: 'New appointment scheduled with John Smith',
            timestamp: new Date(Date.now() - 86400000).toISOString() // 1 day ago
        },
        {
            id: 'not-' + Math.random().toString(36).substring(2, 10),
            type: 'System',
            message: 'Your prescription for Michael Brown was approved',
            timestamp: new Date(Date.now() - 172800000).toISOString() // 2 days ago
        }
    ];
    
    displayDoctorNotifications(notifications);
}

function displayDoctorNotifications(notifications) {
    const notificationsList = document.getElementById('doctor-notifications-list');
    notificationsList.innerHTML = '';
    
    if (notifications.length === 0) {
        notificationsList.innerHTML = `<div class="list-group-item text-center">No notifications</div>`;
        return;
    }
    
    notifications.forEach(notification => {
        const notificationTime = new Date(notification.timestamp);
        const timeAgo = getTimeAgo(notificationTime);
        
        const item = document.createElement('a');
        item.href = '#';
        item.className = 'list-group-item list-group-item-action';
        
        let icon = '';
        if (notification.type === 'Access Request') {
            icon = '<i class="bi bi-shield-lock text-primary me-2"></i>';
        } else if (notification.type === 'Appointment') {
            icon = '<i class="bi bi-calendar-event text-success me-2"></i>';
        } else if (notification.type === 'System') {
            icon = '<i class="bi bi-info-circle text-info me-2"></i>';
        }
        
        item.innerHTML = `
            <div class="d-flex w-100 justify-content-between">
                <h6 class="mb-1">${icon}${notification.type}</h6>
                <small class="text-muted">${timeAgo}</small>
            </div>
            <p class="mb-1">${notification.message}</p>
        `;
        
        notificationsList.appendChild(item);
    });
}

// Admin-specific functions
function loadUsers() {
    if (!authToken || currentUser.role !== 'Admin') return;
    
    // Mock data for users
    const users = [
        {
            id: 'usr-' + Math.random().toString(36).substring(2, 10),
            name: 'John Smith',
            email: 'john.smith@example.com',
            role: 'Patient',
            status: 'Active'
        },
        {
            id: 'usr-' + Math.random().toString(36).substring(2, 10),
            name: 'Dr. Sarah Johnson',
            email: 'sarah.johnson@example.com',
            role: 'Doctor',
            status: 'Active'
        },
        {
            id: 'usr-' + Math.random().toString(36).substring(2, 10),
            name: 'Emma Davis',
            email: 'emma.davis@example.com',
            role: 'Patient',
            status: 'Inactive'
        }
    ];
    
    // Display users in a section that would be created for this purpose
    showMessage('Users loaded successfully', 'success');
}

function loadAuditLogs() {
    if (!authToken || currentUser.role !== 'Admin') return;
    
    // Mock data for audit logs
    const logs = [
        {
            id: 'log-' + Math.random().toString(36).substring(2, 10),
            action: 'Record Access',
            user: 'Dr. Sarah Johnson',
            target: 'Patient: John Smith',
            timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
        },
        {
            id: 'log-' + Math.random().toString(36).substring(2, 10),
            action: 'Record Created',
            user: 'Dr. Michael Chen',
            target: 'Patient: Emma Davis',
            timestamp: new Date(Date.now() - 86400000).toISOString() // 1 day ago
        },
        {
            id: 'log-' + Math.random().toString(36).substring(2, 10),
            action: 'User Login',
            user: 'Admin: David Wilson',
            target: 'System',
            timestamp: new Date(Date.now() - 172800000).toISOString() // 2 days ago
        }
    ];
    
    // Display audit logs in a section that would be created for this purpose
    showMessage('Audit logs loaded successfully', 'success');
}

function loadAdminAlerts() {
    if (!authToken || currentUser.role !== 'Admin') return;
    
    // Mock data for admin alerts
    const alerts = [
        {
            id: 'alt-' + Math.random().toString(36).substring(2, 10),
            type: 'Security',
            message: 'Multiple failed login attempts detected for user john.smith@example.com',
            timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            severity: 'High'
        },
        {
            id: 'alt-' + Math.random().toString(36).substring(2, 10),
            type: 'System',
            message: 'Database backup completed successfully',
            timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            severity: 'Info'
        },
        {
            id: 'alt-' + Math.random().toString(36).substring(2, 10),
            type: 'Performance',
            message: 'API response time exceeded threshold (500ms)',
            timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            severity: 'Medium'
        }
    ];
    
    displayAdminAlerts(alerts);
}

function displayAdminAlerts(alerts) {
    const alertsList = document.getElementById('admin-alerts-list');
    alertsList.innerHTML = '';
    
    if (alerts.length === 0) {
        alertsList.innerHTML = `<div class="list-group-item text-center">No alerts</div>`;
        return;
    }
    
    alerts.forEach(alert => {
        const alertTime = new Date(alert.timestamp);
        const timeAgo = getTimeAgo(alertTime);
        
        const item = document.createElement('a');
        item.href = '#';
        item.className = 'list-group-item list-group-item-action';
        
        let icon = '';
        let severityClass = '';
        
        if (alert.severity === 'High') {
            icon = '<i class="bi bi-exclamation-triangle-fill text-danger me-2"></i>';
            severityClass = 'text-danger';
        } else if (alert.severity === 'Medium') {
            icon = '<i class="bi bi-exclamation-triangle text-warning me-2"></i>';
            severityClass = 'text-warning';
        } else if (alert.severity === 'Info') {
            icon = '<i class="bi bi-info-circle text-info me-2"></i>';
            severityClass = 'text-info';
        }
        
        item.innerHTML = `
            <div class="d-flex w-100 justify-content-between">
                <h6 class="mb-1 ${severityClass}">${icon}${alert.type}</h6>
                <small class="text-muted">${timeAgo}</small>
            </div>
            <p class="mb-1">${alert.message}</p>
        `;
        
        alertsList.appendChild(item);
    });
}

function runSystemCheck() {
    showMessage('System check initiated. Results will be available shortly.', 'info');
    
    // Simulate system check completion after 2 seconds
    setTimeout(() => {
        showMessage('System check completed. All systems operational.', 'success');
    }, 2000);
}

// Utility functions
function showSection(sectionId) {
    console.log('Showing section:', sectionId);
    
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });
    
    // Show the selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.add('active');
        selectedSection.style.display = 'block';
        
        // Update active state in navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.id === sectionId.replace('-section', '-link')) {
                link.classList.add('active');
            }
        });
    } else {
        console.error('Section not found:', sectionId);
    }
}

function showMessage(message, type = 'info') {
    // Create a Bootstrap alert
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Add to the top of the container
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        const bsAlert = new bootstrap.Alert(alertDiv);
        bsAlert.close();
    }, 5000);
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
        return interval + ' year' + (interval === 1 ? '' : 's') + ' ago';
    }
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
        return interval + ' month' + (interval === 1 ? '' : 's') + ' ago';
    }
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
        return interval + ' day' + (interval === 1 ? '' : 's') + ' ago';
    }
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
        return interval + ' hour' + (interval === 1 ? '' : 's') + ' ago';
    }
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
        return interval + ' minute' + (interval === 1 ? '' : 's') + ' ago';
    }
    
    return Math.floor(seconds) + ' second' + (seconds === 1 ? '' : 's') + ' ago';
}
