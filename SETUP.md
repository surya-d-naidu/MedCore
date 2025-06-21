# MED-Client Backend-Frontend Connection Setup

## Overview
This document explains how the backend and frontend are now properly connected and what needs to be configured to run the application.

## Environment Variables Required

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
# Replace with your actual database URL (e.g., Neon, Supabase, or local PostgreSQL)
DATABASE_URL=postgresql://username:password@localhost:5432/med_client_db

# Session Configuration
# Generate a random secret for session management
SESSION_SECRET=your-super-secret-session-key-here

# Environment
NODE_ENV=development
```

## Backend API Endpoints Added/Fixed

### Authentication Endpoints
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Get current user

### User Management
- `GET /api/users` - Get all users (admin only)

### Doctor Management
- `GET /api/doctors` - Get all doctors with user info
- `GET /api/doctors/:id` - Get doctor by ID with user info
- `POST /api/doctors` - Create new doctor
- `PUT /api/doctors/:id` - Update doctor
- `DELETE /api/doctors/:id` - Deactivate doctor

### Patient Management
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get patient by ID
- `POST /api/patients` - Create new patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Discharge patient

### Patient Dashboard Endpoints
- `GET /api/patient-profile/:userId` - Get patient profile
- `GET /api/patient-appointments/:patientId` - Get patient appointments
- `GET /api/patient-medical-records/:patientId` - Get patient medical records
- `GET /api/patient-prescriptions/:patientId` - Get patient prescriptions

### Appointment Management
- `GET /api/appointments` - Get all appointments
- `GET /api/appointments/:id` - Get appointment by ID
- `GET /api/appointments/patient/:patientId` - Get appointments by patient
- `GET /api/appointments/doctor/:doctorId` - Get appointments by doctor
- `GET /api/appointments/date/:date` - Get appointments by date
- `POST /api/appointments` - Create new appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

### Medical Records
- `GET /api/medical-records` - Get all medical records
- `GET /api/medical-records/:id` - Get medical record by ID
- `GET /api/medical-records/patient/:patientId` - Get records by patient
- `POST /api/medical-records` - Create new medical record
- `PUT /api/medical-records/:id` - Update medical record
- `DELETE /api/medical-records/:id` - Archive medical record

### Prescriptions
- `GET /api/prescriptions` - Get all prescriptions
- `GET /api/prescriptions/:id` - Get prescription by ID
- `GET /api/prescriptions/patient/:patientId` - Get prescriptions by patient
- `GET /api/prescriptions/doctor/:doctorId` - Get prescriptions by doctor
- `POST /api/prescriptions` - Create new prescription
- `PUT /api/prescriptions/:id` - Update prescription
- `DELETE /api/prescriptions/:id` - Cancel prescription

### Wards and Rooms
- `GET /api/wards` - Get all wards
- `GET /api/wards/:id` - Get ward by ID
- `POST /api/wards` - Create new ward
- `PUT /api/wards/:id` - Update ward
- `DELETE /api/wards/:id` - Deactivate ward
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/:id` - Get room by ID
- `GET /api/rooms/ward/:wardId` - Get rooms by ward
- `POST /api/rooms` - Create new room
- `PUT /api/rooms/:id` - Update room
- `DELETE /api/rooms/:id` - Deactivate room

### Billing
- `GET /api/bills` - Get all bills
- `GET /api/bills/:id` - Get bill by ID
- `GET /api/bills/patient/:patientId` - Get bills by patient
- `POST /api/bills` - Create new bill
- `PUT /api/bills/:id` - Update bill
- `DELETE /api/bills/:id` - Cancel bill

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Specializations
- `GET /api/specializations` - Get all doctor specializations

## Database Schema

The application uses the following main tables:
- `users` - User accounts and authentication
- `doctors` - Doctor profiles linked to users
- `patients` - Patient information
- `appointments` - Appointment scheduling
- `medical_records` - Patient medical history
- `prescriptions` - Medication prescriptions
- `wards` - Hospital ward management
- `rooms` - Room management within wards
- `bills` - Billing and payment tracking

## Authentication System

- Uses Passport.js with local strategy
- Session-based authentication with PostgreSQL session store
- Password hashing with bcrypt (10 salt rounds)
- Role-based access control (admin, doctor, staff, patient)

## Frontend Integration

The frontend is configured to:
- Make API requests to relative URLs (works with Vite dev server)
- Include credentials for session management
- Handle authentication errors appropriately
- Use React Query for data fetching and caching

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up Environment Variables**
   Create a `.env` file with the required variables (see above)

3. **Set up Database**
   ```bash
   # Run migrations
   npm run db:migrate
   
   # Seed the database with initial data
   npm run db:seed
   ```

4. **Start the Development Server**
   ```bash
   npm run dev
   ```

## Default Login Credentials

After seeding the database, you can use these credentials:

- **Admin**: username: `admin`, password: `admin123`
- **Doctor**: username: `doctor`, password: `doctor123`
- **Patient**: username: `patient`, password: `patient123`
- **Staff**: username: `staff`, password: `staff123`

## Key Features Implemented

1. **Complete CRUD Operations** for all entities
2. **Role-based Access Control** with proper authorization
3. **Patient Dashboard** with appointment booking and medical history
4. **Doctor Management** with user account integration
5. **Appointment Scheduling** with patient-doctor relationships
6. **Medical Records Management** with patient history
7. **Prescription Management** with medication tracking
8. **Ward and Room Management** for hospital administration
9. **Billing System** with payment tracking
10. **Dashboard Statistics** for overview data

## Security Features

- Password hashing with bcrypt
- Session-based authentication
- Role-based authorization
- Input validation with Zod schemas
- SQL injection prevention with Drizzle ORM
- CSRF protection with session management

## Error Handling

- Comprehensive error handling for all API endpoints
- Proper HTTP status codes
- User-friendly error messages
- Validation error handling with detailed feedback 