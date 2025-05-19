import { db, pool } from './server/db';
import { users, doctors, patients } from './shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

async function seedDatabase() {
  console.log('Starting database seeding...');

  try {
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await db.insert(users).values({
      username: 'admin',
      password: adminPassword,
      email: 'admin@hospital.com',
      fullName: 'Admin User',
      role: 'admin',
    }).returning();

    console.log('Admin user created:', adminUser[0].id);

    // Create doctor user
    const doctorPassword = await bcrypt.hash('doctor123', 10);
    const doctorUser = await db.insert(users).values({
      username: 'doctor',
      password: doctorPassword,
      email: 'doctor@hospital.com',
      fullName: 'Dr. John Smith',
      role: 'doctor',
    }).returning();

    console.log('Doctor user created:', doctorUser[0].id);

    // Create doctor profile
    const doctorProfile = await db.insert(doctors).values({
      userId: doctorUser[0].id,
      specialization: 'Cardiology',
      qualification: 'MD, PhD',
      experience: 10,
      phone: '555-123-4567',
      status: 'available',
    }).returning();

    console.log('Doctor profile created:', doctorProfile[0].id);

    // Create patient user
    const patientPassword = await bcrypt.hash('patient123', 10);
    const patientUser = await db.insert(users).values({
      username: 'patient',
      password: patientPassword,
      email: 'patient@example.com',
      fullName: 'Jane Doe',
      role: 'patient',
    }).returning();

    console.log('Patient user created:', patientUser[0].id);

    // Create patient profile
    const patientProfile = await db.insert(patients).values({
      firstName: 'Jane',
      lastName: 'Doe',
      dateOfBirth: '1990-01-15',
      gender: 'female',
      phone: '555-987-6543',
      email: 'patient@example.com',
      address: '123 Main St, Anytown, CA 12345',
      emergencyContact: '555-111-2222',
      bloodGroup: 'O+',
      status: 'active',
    }).returning();

    console.log('Patient profile created:', patientProfile[0].id);

    // Create staff user
    const staffPassword = await bcrypt.hash('staff123', 10);
    const staffUser = await db.insert(users).values({
      username: 'staff',
      password: staffPassword,
      email: 'staff@hospital.com',
      fullName: 'Staff Member',
      role: 'staff',
    }).returning();

    console.log('Staff user created:', staffUser[0].id);

    // Add more patients
    await db.insert(patients).values([
      {
        firstName: 'Robert',
        lastName: 'Johnson',
        dateOfBirth: '1985-05-20',
        gender: 'male',
        phone: '555-333-4444',
        email: 'robert@example.com',
        address: '456 Oak Ave, Somewhere, NY 67890',
        emergencyContact: '555-555-5555',
        bloodGroup: 'A+',
        status: 'active',
      },
      {
        firstName: 'Sarah',
        lastName: 'Williams',
        dateOfBirth: '1992-11-08',
        gender: 'female',
        phone: '555-777-8888',
        email: 'sarah@example.com',
        address: '789 Pine St, Nowhere, TX 54321',
        emergencyContact: '555-999-0000',
        bloodGroup: 'B-',
        status: 'active',
      }
    ]);

    console.log('Additional patients created');

    // Create additional patient users with their own accounts
    const patientUsers = [
      {
        username: 'robert',
        password: await bcrypt.hash('robert123', 10),
        email: 'robert@example.com',
        fullName: 'Robert Johnson',
        role: 'patient',
      },
      {
        username: 'sarah',
        password: await bcrypt.hash('sarah123', 10),
        email: 'sarah@example.com',
        fullName: 'Sarah Williams',
        role: 'patient',
      },
      {
        username: 'michael',
        password: await bcrypt.hash('michael123', 10),
        email: 'michael@example.com',
        fullName: 'Michael Brown',
        role: 'patient',
      }
    ];

    for (const userData of patientUsers) {
      const user = await db.insert(users).values(userData).returning();
      console.log(`Patient user created: ${userData.username} (ID: ${user[0].id})`);
    }

    // Create profile for Michael (since he doesn't have one yet)
    await db.insert(patients).values({
      firstName: 'Michael',
      lastName: 'Brown',
      dateOfBirth: '1978-03-12',
      gender: 'male',
      phone: '555-444-3333',
      email: 'michael@example.com',
      address: '101 Maple Dr, Anytown, CA 12345',
      emergencyContact: '555-222-1111',
      bloodGroup: 'AB+',
      status: 'active',
    });

    console.log('Michael patient profile created');

    console.log('Database seeding completed successfully!');
    console.log('\nLogin Credentials:');
    console.log('------------------');
    console.log('Admin User:');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    console.log('\nDoctor User:');
    console.log('  Username: doctor');
    console.log('  Password: doctor123');
    console.log('\nPatient Users:');
    console.log('  Username: patient');
    console.log('  Password: patient123');
    console.log('\n  Username: robert');
    console.log('  Password: robert123');
    console.log('\n  Username: sarah');
    console.log('  Password: sarah123');
    console.log('\n  Username: michael');
    console.log('  Password: michael123');
    console.log('\nStaff User:');
    console.log('  Username: staff');
    console.log('  Password: staff123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await pool.end();
  }
}

seedDatabase();
