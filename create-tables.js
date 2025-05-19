import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

console.log('Connecting to database URL:', process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createTables() {
  const client = await pool.connect();
  try {
    console.log('Creating tables...');
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" serial PRIMARY KEY NOT NULL,
        "username" text NOT NULL UNIQUE,
        "password" text NOT NULL,
        "email" text NOT NULL UNIQUE,
        "full_name" text NOT NULL,
        "role" text DEFAULT 'staff' NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    console.log('Users table created successfully');
    
    // Create doctors table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "doctors" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL,
        "specialization" text NOT NULL,
        "qualification" text NOT NULL,
        "experience" integer NOT NULL,
        "phone" text NOT NULL,
        "status" text DEFAULT 'available' NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT fk_user
          FOREIGN KEY("user_id") 
          REFERENCES "users"("id")
      );
    `);
    console.log('Doctors table created successfully');
    
    // Create patients table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "patients" (
        "id" serial PRIMARY KEY NOT NULL,
        "first_name" text NOT NULL,
        "last_name" text NOT NULL,
        "date_of_birth" date NOT NULL,
        "gender" text NOT NULL,
        "phone" text NOT NULL,
        "email" text,
        "address" text NOT NULL,
        "emergency_contact" text,
        "blood_group" text,
        "status" text DEFAULT 'active' NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    console.log('Patients table created successfully');
    
    // Create appointments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "appointments" (
        "id" serial PRIMARY KEY NOT NULL,
        "patient_id" integer NOT NULL,
        "doctor_id" integer NOT NULL,
        "date" date NOT NULL,
        "time" time NOT NULL,
        "status" text DEFAULT 'scheduled' NOT NULL,
        "reason" text NOT NULL,
        "notes" text,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT fk_patient
          FOREIGN KEY("patient_id") 
          REFERENCES "patients"("id"),
        CONSTRAINT fk_doctor
          FOREIGN KEY("doctor_id") 
          REFERENCES "doctors"("id")
      );
    `);
    console.log('Appointments table created successfully');
    
    // Create medical_records table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "medical_records" (
        "id" serial PRIMARY KEY NOT NULL,
        "patient_id" integer NOT NULL,
        "diagnosis" text NOT NULL,
        "treatment" text NOT NULL,
        "visit_date" date NOT NULL,
        "notes" text,
        "attachments" json,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT fk_patient
          FOREIGN KEY("patient_id") 
          REFERENCES "patients"("id")
      );
    `);
    console.log('Medical records table created successfully');
    
    // Create prescriptions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "prescriptions" (
        "id" serial PRIMARY KEY NOT NULL,
        "patient_id" integer NOT NULL,
        "doctor_id" integer NOT NULL,
        "prescription_date" date NOT NULL,
        "medicines" json NOT NULL,
        "dosage" json NOT NULL,
        "duration" json NOT NULL,
        "notes" text,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT fk_patient
          FOREIGN KEY("patient_id") 
          REFERENCES "patients"("id"),
        CONSTRAINT fk_doctor
          FOREIGN KEY("doctor_id") 
          REFERENCES "doctors"("id")
      );
    `);
    console.log('Prescriptions table created successfully');
    
    // Create wards table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "wards" (
        "id" serial PRIMARY KEY NOT NULL,
        "ward_number" text NOT NULL UNIQUE,
        "ward_type" text NOT NULL,
        "capacity" integer NOT NULL,
        "occupied_beds" integer DEFAULT 0 NOT NULL,
        "floor" integer NOT NULL,
        "status" text DEFAULT 'available' NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    console.log('Wards table created successfully');
    
    // Create rooms table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "rooms" (
        "id" serial PRIMARY KEY NOT NULL,
        "ward_id" integer NOT NULL,
        "room_number" text NOT NULL UNIQUE,
        "room_type" text NOT NULL,
        "occupied" boolean DEFAULT false NOT NULL,
        "patient_id" integer,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT fk_ward
          FOREIGN KEY("ward_id") 
          REFERENCES "wards"("id"),
        CONSTRAINT fk_patient
          FOREIGN KEY("patient_id") 
          REFERENCES "patients"("id")
      );
    `);
    console.log('Rooms table created successfully');
    
    // Create bills table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "bills" (
        "id" serial PRIMARY KEY NOT NULL,
        "patient_id" integer NOT NULL,
        "bill_date" date NOT NULL,
        "due_date" date NOT NULL,
        "services" json NOT NULL,
        "total_amount" numeric(10, 2) NOT NULL,
        "paid_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
        "status" text DEFAULT 'pending' NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT fk_patient
          FOREIGN KEY("patient_id") 
          REFERENCES "patients"("id")
      );
    `);
    console.log('Bills table created successfully');
    
    // Drop session table if it exists
    await client.query(`DROP TABLE IF EXISTS "session" CASCADE;`);
    console.log('Dropped existing session table');

    // Create session table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL PRIMARY KEY,
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL
      ) WITH (OIDS=FALSE);

      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
    `);
    console.log('Session table created successfully');
    
  } catch (err) {
    console.error('Error creating tables:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

createTables();
