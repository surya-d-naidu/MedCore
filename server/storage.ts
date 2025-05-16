import { and, eq, gte, lte, desc, like, or, sql } from "drizzle-orm";
import { db } from "./db";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { 
  users, type User, type InsertUser, 
  doctors, type Doctor, type InsertDoctor,
  patients, type Patient, type InsertPatient,
  appointments, type Appointment, type InsertAppointment,
  medicalRecords, type MedicalRecord, type InsertMedicalRecord,
  prescriptions, type Prescription, type InsertPrescription,
  wards, type Ward, type InsertWard,
  rooms, type Room, type InsertRoom,
  bills, type Bill, type InsertBill
} from "@shared/schema";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Doctor management
  createDoctor(doctor: InsertDoctor): Promise<Doctor>;
  getDoctor(id: number): Promise<Doctor | undefined>;
  getDoctorByUserId(userId: number): Promise<Doctor | undefined>;
  updateDoctor(id: number, data: Partial<InsertDoctor>): Promise<Doctor>;
  getAllDoctors(): Promise<Doctor[]>;
  searchDoctors(query: string): Promise<Doctor[]>;
  
  // Patient management
  createPatient(patient: InsertPatient): Promise<Patient>;
  getPatient(id: number): Promise<Patient | undefined>;
  updatePatient(id: number, data: Partial<InsertPatient>): Promise<Patient>;
  getAllPatients(): Promise<Patient[]>;
  searchPatients(query: string): Promise<Patient[]>;
  
  // Appointment management
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  updateAppointment(id: number, data: Partial<InsertAppointment>): Promise<Appointment>;
  getAppointmentsByPatient(patientId: number): Promise<Appointment[]>;
  getAppointmentsByDoctor(doctorId: number): Promise<Appointment[]>;
  getAppointmentsByDate(date: Date): Promise<Appointment[]>;
  getAllAppointments(): Promise<Appointment[]>;
  
  // Medical Records management
  createMedicalRecord(record: InsertMedicalRecord): Promise<MedicalRecord>;
  getMedicalRecord(id: number): Promise<MedicalRecord | undefined>;
  updateMedicalRecord(id: number, data: Partial<InsertMedicalRecord>): Promise<MedicalRecord>;
  getMedicalRecordsByPatient(patientId: number): Promise<MedicalRecord[]>;
  getAllMedicalRecords(): Promise<MedicalRecord[]>;
  
  // Prescription management
  createPrescription(prescription: InsertPrescription): Promise<Prescription>;
  getPrescription(id: number): Promise<Prescription | undefined>;
  updatePrescription(id: number, data: Partial<InsertPrescription>): Promise<Prescription>;
  getPrescriptionsByPatient(patientId: number): Promise<Prescription[]>;
  getPrescriptionsByDoctor(doctorId: number): Promise<Prescription[]>;
  getAllPrescriptions(): Promise<Prescription[]>;
  
  // Ward/Room management
  createWard(ward: InsertWard): Promise<Ward>;
  getWard(id: number): Promise<Ward | undefined>;
  updateWard(id: number, data: Partial<InsertWard>): Promise<Ward>;
  getAllWards(): Promise<Ward[]>;
  
  createRoom(room: InsertRoom): Promise<Room>;
  getRoom(id: number): Promise<Room | undefined>;
  updateRoom(id: number, data: Partial<InsertRoom>): Promise<Room>;
  getRoomsByWard(wardId: number): Promise<Room[]>;
  getAllRooms(): Promise<Room[]>;
  
  // Billing management
  createBill(bill: InsertBill): Promise<Bill>;
  getBill(id: number): Promise<Bill | undefined>;
  updateBill(id: number, data: Partial<InsertBill>): Promise<Bill>;
  getBillsByPatient(patientId: number): Promise<Bill[]>;
  getAllBills(): Promise<Bill[]>;
  
  // Dashboard data
  getDashboardStats(): Promise<{
    totalPatients: number;
    todayAppointments: number;
    availableDoctors: number;
    availableRooms: number;
  }>;
  
  // Session store for user authentication
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }

  // User management
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User> {
    const [updatedUser] = await db.update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Doctor management
  async createDoctor(doctor: InsertDoctor): Promise<Doctor> {
    const [newDoctor] = await db.insert(doctors).values(doctor).returning();
    return newDoctor;
  }

  async getDoctor(id: number): Promise<Doctor | undefined> {
    const [doctor] = await db.select().from(doctors).where(eq(doctors.id, id));
    return doctor;
  }

  async getDoctorByUserId(userId: number): Promise<Doctor | undefined> {
    const [doctor] = await db.select().from(doctors).where(eq(doctors.userId, userId));
    return doctor;
  }

  async updateDoctor(id: number, data: Partial<InsertDoctor>): Promise<Doctor> {
    const [updatedDoctor] = await db.update(doctors)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(doctors.id, id))
      .returning();
    return updatedDoctor;
  }

  async getAllDoctors(): Promise<Doctor[]> {
    return await db.select().from(doctors);
  }

  async searchDoctors(query: string): Promise<Doctor[]> {
    const doctorsData = await db.select()
      .from(doctors)
      .innerJoin(users, eq(doctors.userId, users.id))
      .where(
        or(
          like(users.fullName, `%${query}%`),
          like(doctors.specialization, `%${query}%`)
        )
      );
    
    return doctorsData.map(({ doctors }) => doctors);
  }

  // Patient management
  async createPatient(patient: InsertPatient): Promise<Patient> {
    const [newPatient] = await db.insert(patients).values(patient).returning();
    return newPatient;
  }

  async getPatient(id: number): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient;
  }

  async updatePatient(id: number, data: Partial<InsertPatient>): Promise<Patient> {
    const [updatedPatient] = await db.update(patients)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(patients.id, id))
      .returning();
    return updatedPatient;
  }

  async getAllPatients(): Promise<Patient[]> {
    return await db.select().from(patients);
  }

  async searchPatients(query: string): Promise<Patient[]> {
    return await db.select()
      .from(patients)
      .where(
        or(
          like(patients.firstName, `%${query}%`),
          like(patients.lastName, `%${query}%`),
          like(patients.email, `%${query}%`),
          like(patients.phone, `%${query}%`)
        )
      );
  }

  // Appointment management
  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [newAppointment] = await db.insert(appointments).values(appointment).returning();
    return newAppointment;
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment;
  }

  async updateAppointment(id: number, data: Partial<InsertAppointment>): Promise<Appointment> {
    const [updatedAppointment] = await db.update(appointments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(appointments.id, id))
      .returning();
    return updatedAppointment;
  }

  async getAppointmentsByPatient(patientId: number): Promise<Appointment[]> {
    return await db.select()
      .from(appointments)
      .where(eq(appointments.patientId, patientId));
  }

  async getAppointmentsByDoctor(doctorId: number): Promise<Appointment[]> {
    return await db.select()
      .from(appointments)
      .where(eq(appointments.doctorId, doctorId));
  }

  async getAppointmentsByDate(date: Date): Promise<Appointment[]> {
    const dateStr = date.toISOString().split('T')[0];
    return await db.select()
      .from(appointments)
      .where(eq(appointments.date, dateStr));
  }

  async getAllAppointments(): Promise<Appointment[]> {
    return await db.select().from(appointments);
  }

  // Medical Records management
  async createMedicalRecord(record: InsertMedicalRecord): Promise<MedicalRecord> {
    const [newRecord] = await db.insert(medicalRecords).values(record).returning();
    return newRecord;
  }

  async getMedicalRecord(id: number): Promise<MedicalRecord | undefined> {
    const [record] = await db.select().from(medicalRecords).where(eq(medicalRecords.id, id));
    return record;
  }

  async updateMedicalRecord(id: number, data: Partial<InsertMedicalRecord>): Promise<MedicalRecord> {
    const [updatedRecord] = await db.update(medicalRecords)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(medicalRecords.id, id))
      .returning();
    return updatedRecord;
  }

  async getMedicalRecordsByPatient(patientId: number): Promise<MedicalRecord[]> {
    return await db.select()
      .from(medicalRecords)
      .where(eq(medicalRecords.patientId, patientId));
  }

  async getAllMedicalRecords(): Promise<MedicalRecord[]> {
    return await db.select().from(medicalRecords);
  }

  // Prescription management
  async createPrescription(prescription: InsertPrescription): Promise<Prescription> {
    const [newPrescription] = await db.insert(prescriptions).values(prescription).returning();
    return newPrescription;
  }

  async getPrescription(id: number): Promise<Prescription | undefined> {
    const [prescription] = await db.select().from(prescriptions).where(eq(prescriptions.id, id));
    return prescription;
  }

  async updatePrescription(id: number, data: Partial<InsertPrescription>): Promise<Prescription> {
    const [updatedPrescription] = await db.update(prescriptions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(prescriptions.id, id))
      .returning();
    return updatedPrescription;
  }

  async getPrescriptionsByPatient(patientId: number): Promise<Prescription[]> {
    return await db.select()
      .from(prescriptions)
      .where(eq(prescriptions.patientId, patientId));
  }

  async getPrescriptionsByDoctor(doctorId: number): Promise<Prescription[]> {
    return await db.select()
      .from(prescriptions)
      .where(eq(prescriptions.doctorId, doctorId));
  }

  async getAllPrescriptions(): Promise<Prescription[]> {
    return await db.select().from(prescriptions);
  }

  // Ward/Room management
  async createWard(ward: InsertWard): Promise<Ward> {
    const [newWard] = await db.insert(wards).values(ward).returning();
    return newWard;
  }

  async getWard(id: number): Promise<Ward | undefined> {
    const [ward] = await db.select().from(wards).where(eq(wards.id, id));
    return ward;
  }

  async updateWard(id: number, data: Partial<InsertWard>): Promise<Ward> {
    const [updatedWard] = await db.update(wards)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(wards.id, id))
      .returning();
    return updatedWard;
  }

  async getAllWards(): Promise<Ward[]> {
    return await db.select().from(wards);
  }

  async createRoom(room: InsertRoom): Promise<Room> {
    const [newRoom] = await db.insert(rooms).values(room).returning();
    return newRoom;
  }

  async getRoom(id: number): Promise<Room | undefined> {
    const [room] = await db.select().from(rooms).where(eq(rooms.id, id));
    return room;
  }

  async updateRoom(id: number, data: Partial<InsertRoom>): Promise<Room> {
    const [updatedRoom] = await db.update(rooms)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(rooms.id, id))
      .returning();
    return updatedRoom;
  }

  async getRoomsByWard(wardId: number): Promise<Room[]> {
    return await db.select()
      .from(rooms)
      .where(eq(rooms.wardId, wardId));
  }

  async getAllRooms(): Promise<Room[]> {
    return await db.select().from(rooms);
  }

  // Billing management
  async createBill(bill: InsertBill): Promise<Bill> {
    const [newBill] = await db.insert(bills).values(bill).returning();
    return newBill;
  }

  async getBill(id: number): Promise<Bill | undefined> {
    const [bill] = await db.select().from(bills).where(eq(bills.id, id));
    return bill;
  }

  async updateBill(id: number, data: Partial<InsertBill>): Promise<Bill> {
    const [updatedBill] = await db.update(bills)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(bills.id, id))
      .returning();
    return updatedBill;
  }

  async getBillsByPatient(patientId: number): Promise<Bill[]> {
    return await db.select()
      .from(bills)
      .where(eq(bills.patientId, patientId));
  }

  async getAllBills(): Promise<Bill[]> {
    return await db.select().from(bills);
  }

  // Dashboard data
  async getDashboardStats(): Promise<{
    totalPatients: number;
    todayAppointments: number;
    availableDoctors: number;
    availableRooms: number;
  }> {
    const today = new Date().toISOString().split('T')[0];
    
    // Perform counts directly with the pool
    const patientCountResult = await pool.query('SELECT COUNT(*) as count FROM patients');
    const appointmentCountResult = await pool.query('SELECT COUNT(*) as count FROM appointments WHERE date = $1', [today]);
    const doctorCountResult = await pool.query('SELECT COUNT(*) as count FROM doctors WHERE status = $1', ['available']);
    const roomCountResult = await pool.query('SELECT COUNT(*) as count FROM rooms WHERE occupied = $1', [false]);
    
    return {
      totalPatients: parseInt(patientCountResult.rows[0].count, 10),
      todayAppointments: parseInt(appointmentCountResult.rows[0].count, 10),
      availableDoctors: parseInt(doctorCountResult.rows[0].count, 10),
      availableRooms: parseInt(roomCountResult.rows[0].count, 10)
    };
  }
}

export const storage = new DatabaseStorage();
