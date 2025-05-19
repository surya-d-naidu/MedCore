# MedCore - Hospital Management System

A comprehensive hospital management system built with modern web technologies. MedCore streamlines patient care, appointment scheduling, medical records management, and administrative tasks for healthcare facilities.

## Features

- **Patient Management**: Register, update, and track patient information
- **Appointment Scheduling**: Book, reschedule, and cancel appointments
- **Medical Records**: Maintain comprehensive patient medical histories
- **Prescriptions Management**: Create and track patient prescriptions
- **Billing System**: Generate and manage patient bills
- **User Authentication**: Secure role-based access control
- **Dashboard Analytics**: Visualize healthcare data for better decision making

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Node.js, Express
- **Database**: PostgreSQL (with Drizzle ORM)
- **Authentication**: JWT-based authentication

## Getting Started

### Prerequisites

- Node.js (v16+)
- PostgreSQL

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/MedCore.git
cd MedCore
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. Set up the database
```bash
npm run db:migrate
npm run db:seed
```

5. Start the development server
```bash
npm run dev
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
