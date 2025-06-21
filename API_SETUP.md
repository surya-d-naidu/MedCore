# API Integration Setup Guide

## Environment Variables

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

# API URL for frontend (optional - defaults to http://localhost:5000)
VITE_API_URL=http://localhost:5000
```

## Fixed Issues

### 1. API Base URL Configuration
- Added proper base URL configuration in `client/src/lib/queryClient.ts`
- Frontend now correctly points to `http://localhost:5000` for API calls

### 2. CORS Configuration
- Added CORS headers in `server/index.ts` to allow frontend requests
- Configured to allow requests from `http://localhost:5173` (Vite dev server)

### 3. Health Endpoint
- Added `/api/health` endpoint for connectivity testing

### 4. Patient Profile Endpoint
- Fixed `/api/patient-profile/:userId` to work with current schema
- Now returns first active patient as demo data

### 5. Enhanced Data Queries
- Added `getAllAppointmentsWithDetails()` to include patient and doctor information
- Added `getAllRoomsWithPatient()` to include patient and ward information
- Updated routes to use these enhanced methods

### 6. Authentication
- Proper session-based authentication with Passport.js
- Default admin user created automatically (username: `admin`, password: `admin123`)

## Running the Application

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up the database:**
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

3. **Start the server:**
   ```bash
   npm run dev
   ```

4. **Test the integration:**
   ```bash
   node test-integration.js
   ```

## API Endpoints

All endpoints are prefixed with `/api` and run on port 5000:

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Get current user

### Health Check
- `GET /api/health` - Server health check

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics

### Doctors
- `GET /api/doctors` - Get all doctors with user info
- `GET /api/doctors/:id` - Get doctor by ID
- `POST /api/doctors` - Create doctor (admin only)
- `PUT /api/doctors/:id` - Update doctor (admin only)
- `DELETE /api/doctors/:id` - Deactivate doctor (admin only)

### Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get patient by ID
- `POST /api/patients` - Create patient (admin/doctor only)
- `PUT /api/patients/:id` - Update patient (admin/doctor only)
- `DELETE /api/patients/:id` - Discharge patient (admin/doctor only)

### Patient Dashboard
- `GET /api/patient-profile/:userId` - Get patient profile
- `GET /api/patient-appointments/:patientId` - Get patient appointments
- `GET /api/patient-medical-records/:patientId` - Get patient medical records
- `GET /api/patient-prescriptions/:patientId` - Get patient prescriptions

### Appointments
- `GET /api/appointments` - Get all appointments with details
- `GET /api/appointments/:id` - Get appointment by ID
- `POST /api/appointments` - Create appointment (admin/doctor/staff only)
- `PUT /api/appointments/:id` - Update appointment (admin/doctor/staff only)
- `DELETE /api/appointments/:id` - Cancel appointment

### Medical Records
- `GET /api/medical-records` - Get all medical records (admin/doctor only)
- `GET /api/medical-records/:id` - Get medical record by ID
- `POST /api/medical-records` - Create medical record (admin/doctor only)
- `PUT /api/medical-records/:id` - Update medical record (admin/doctor only)
- `DELETE /api/medical-records/:id` - Archive medical record (admin/doctor only)

### Prescriptions
- `GET /api/prescriptions` - Get all prescriptions (admin/doctor only)
- `GET /api/prescriptions/:id` - Get prescription by ID
- `POST /api/prescriptions` - Create prescription (admin/doctor only)
- `PUT /api/prescriptions/:id` - Update prescription (admin/doctor only)
- `DELETE /api/prescriptions/:id` - Cancel prescription (admin/doctor only)

### Wards & Rooms
- `GET /api/wards` - Get all wards
- `GET /api/wards/:id` - Get ward by ID
- `POST /api/wards` - Create ward (admin only)
- `PUT /api/wards/:id` - Update ward (admin only)
- `DELETE /api/wards/:id` - Deactivate ward (admin only)

- `GET /api/rooms` - Get all rooms with patient details
- `GET /api/rooms/:id` - Get room by ID
- `POST /api/rooms` - Create room (admin only)
- `PUT /api/rooms/:id` - Update room (admin only)
- `DELETE /api/rooms/:id` - Deactivate room (admin only)

### Billing
- `GET /api/bills` - Get all bills (admin/staff only)
- `GET /api/bills/:id` - Get bill by ID
- `POST /api/bills` - Create bill (admin/staff only)
- `PUT /api/bills/:id` - Update bill (admin/staff only)
- `DELETE /api/bills/:id` - Cancel bill (admin/staff only)

## Troubleshooting

### Common Issues

1. **CORS errors**: Make sure the server is running on port 5000 and the frontend is on port 5173
2. **Database connection errors**: Check your DATABASE_URL in the .env file
3. **Authentication errors**: Make sure SESSION_SECRET is set in the .env file
4. **404 errors**: Ensure all routes are properly registered in server/routes.ts

### Testing

Run the integration test to verify all endpoints are working:

```bash
node test-integration.js
```

This will test all major endpoints and report any issues found. 