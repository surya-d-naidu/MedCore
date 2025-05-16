import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, requireRole } from "./auth";
import { ValidationError } from "zod-validation-error";
import { 
  insertDoctorSchema, 
  insertPatientSchema, 
  insertAppointmentSchema,
  insertMedicalRecordSchema,
  insertPrescriptionSchema,
  insertWardSchema,
  insertRoomSchema,
  insertBillSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes (/api/register, /api/login, /api/logout, /api/user)
  setupAuth(app);

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res, next) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  });

  // Doctor routes
  app.get("/api/doctors", async (req, res, next) => {
    try {
      const doctors = await storage.getAllDoctors();
      res.json(doctors);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/doctors/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const doctor = await storage.getDoctor(id);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      res.json(doctor);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/doctors", requireRole(["admin"]), async (req, res, next) => {
    try {
      const doctorData = insertDoctorSchema.parse(req.body);
      const doctor = await storage.createDoctor(doctorData);
      res.status(201).json(doctor);
    } catch (err) {
      if (err instanceof ValidationError) {
        return res.status(400).json({ message: err.message });
      }
      next(err);
    }
  });

  app.put("/api/doctors/:id", requireRole(["admin"]), async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const doctorData = insertDoctorSchema.partial().parse(req.body);
      const doctor = await storage.updateDoctor(id, doctorData);
      res.json(doctor);
    } catch (err) {
      if (err instanceof ValidationError) {
        return res.status(400).json({ message: err.message });
      }
      next(err);
    }
  });

  // Patient routes
  app.get("/api/patients", async (req, res, next) => {
    try {
      const patients = await storage.getAllPatients();
      res.json(patients);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/patients/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const patient = await storage.getPatient(id);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      res.json(patient);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/patients", requireRole(["admin", "doctor"]), async (req, res, next) => {
    try {
      const patientData = insertPatientSchema.parse(req.body);
      const patient = await storage.createPatient(patientData);
      res.status(201).json(patient);
    } catch (err) {
      if (err instanceof ValidationError) {
        return res.status(400).json({ message: err.message });
      }
      next(err);
    }
  });

  app.put("/api/patients/:id", requireRole(["admin", "doctor"]), async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const patientData = insertPatientSchema.partial().parse(req.body);
      const patient = await storage.updatePatient(id, patientData);
      res.json(patient);
    } catch (err) {
      if (err instanceof ValidationError) {
        return res.status(400).json({ message: err.message });
      }
      next(err);
    }
  });

  // Appointment routes
  app.get("/api/appointments", async (req, res, next) => {
    try {
      const appointments = await storage.getAllAppointments();
      res.json(appointments);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/appointments/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const appointment = await storage.getAppointment(id);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.json(appointment);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/appointments/patient/:patientId", async (req, res, next) => {
    try {
      const patientId = parseInt(req.params.patientId);
      const appointments = await storage.getAppointmentsByPatient(patientId);
      res.json(appointments);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/appointments/doctor/:doctorId", async (req, res, next) => {
    try {
      const doctorId = parseInt(req.params.doctorId);
      const appointments = await storage.getAppointmentsByDoctor(doctorId);
      res.json(appointments);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/appointments/date/:date", async (req, res, next) => {
    try {
      const date = new Date(req.params.date);
      const appointments = await storage.getAppointmentsByDate(date);
      res.json(appointments);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/appointments", requireRole(["admin", "doctor", "staff"]), async (req, res, next) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(appointmentData);
      res.status(201).json(appointment);
    } catch (err) {
      if (err instanceof ValidationError) {
        return res.status(400).json({ message: err.message });
      }
      next(err);
    }
  });

  app.put("/api/appointments/:id", requireRole(["admin", "doctor", "staff"]), async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const appointmentData = insertAppointmentSchema.partial().parse(req.body);
      const appointment = await storage.updateAppointment(id, appointmentData);
      res.json(appointment);
    } catch (err) {
      if (err instanceof ValidationError) {
        return res.status(400).json({ message: err.message });
      }
      next(err);
    }
  });

  // Medical Records routes
  app.get("/api/medical-records", requireRole(["admin", "doctor"]), async (req, res, next) => {
    try {
      const records = await storage.getAllMedicalRecords();
      res.json(records);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/medical-records/:id", requireRole(["admin", "doctor"]), async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const record = await storage.getMedicalRecord(id);
      if (!record) {
        return res.status(404).json({ message: "Medical record not found" });
      }
      res.json(record);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/medical-records/patient/:patientId", requireRole(["admin", "doctor"]), async (req, res, next) => {
    try {
      const patientId = parseInt(req.params.patientId);
      const records = await storage.getMedicalRecordsByPatient(patientId);
      res.json(records);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/medical-records", requireRole(["admin", "doctor"]), async (req, res, next) => {
    try {
      const recordData = insertMedicalRecordSchema.parse(req.body);
      const record = await storage.createMedicalRecord(recordData);
      res.status(201).json(record);
    } catch (err) {
      if (err instanceof ValidationError) {
        return res.status(400).json({ message: err.message });
      }
      next(err);
    }
  });

  app.put("/api/medical-records/:id", requireRole(["admin", "doctor"]), async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const recordData = insertMedicalRecordSchema.partial().parse(req.body);
      const record = await storage.updateMedicalRecord(id, recordData);
      res.json(record);
    } catch (err) {
      if (err instanceof ValidationError) {
        return res.status(400).json({ message: err.message });
      }
      next(err);
    }
  });

  // Prescription routes
  app.get("/api/prescriptions", requireRole(["admin", "doctor"]), async (req, res, next) => {
    try {
      const prescriptions = await storage.getAllPrescriptions();
      res.json(prescriptions);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/prescriptions/:id", requireRole(["admin", "doctor"]), async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const prescription = await storage.getPrescription(id);
      if (!prescription) {
        return res.status(404).json({ message: "Prescription not found" });
      }
      res.json(prescription);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/prescriptions/patient/:patientId", requireRole(["admin", "doctor"]), async (req, res, next) => {
    try {
      const patientId = parseInt(req.params.patientId);
      const prescriptions = await storage.getPrescriptionsByPatient(patientId);
      res.json(prescriptions);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/prescriptions/doctor/:doctorId", requireRole(["admin", "doctor"]), async (req, res, next) => {
    try {
      const doctorId = parseInt(req.params.doctorId);
      const prescriptions = await storage.getPrescriptionsByDoctor(doctorId);
      res.json(prescriptions);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/prescriptions", requireRole(["admin", "doctor"]), async (req, res, next) => {
    try {
      const prescriptionData = insertPrescriptionSchema.parse(req.body);
      const prescription = await storage.createPrescription(prescriptionData);
      res.status(201).json(prescription);
    } catch (err) {
      if (err instanceof ValidationError) {
        return res.status(400).json({ message: err.message });
      }
      next(err);
    }
  });

  app.put("/api/prescriptions/:id", requireRole(["admin", "doctor"]), async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const prescriptionData = insertPrescriptionSchema.partial().parse(req.body);
      const prescription = await storage.updatePrescription(id, prescriptionData);
      res.json(prescription);
    } catch (err) {
      if (err instanceof ValidationError) {
        return res.status(400).json({ message: err.message });
      }
      next(err);
    }
  });

  // Ward routes
  app.get("/api/wards", async (req, res, next) => {
    try {
      const wards = await storage.getAllWards();
      res.json(wards);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/wards/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const ward = await storage.getWard(id);
      if (!ward) {
        return res.status(404).json({ message: "Ward not found" });
      }
      res.json(ward);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/wards", requireRole(["admin"]), async (req, res, next) => {
    try {
      const wardData = insertWardSchema.parse(req.body);
      const ward = await storage.createWard(wardData);
      res.status(201).json(ward);
    } catch (err) {
      if (err instanceof ValidationError) {
        return res.status(400).json({ message: err.message });
      }
      next(err);
    }
  });

  app.put("/api/wards/:id", requireRole(["admin"]), async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const wardData = insertWardSchema.partial().parse(req.body);
      const ward = await storage.updateWard(id, wardData);
      res.json(ward);
    } catch (err) {
      if (err instanceof ValidationError) {
        return res.status(400).json({ message: err.message });
      }
      next(err);
    }
  });

  // Room routes
  app.get("/api/rooms", async (req, res, next) => {
    try {
      const rooms = await storage.getAllRooms();
      res.json(rooms);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/rooms/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const room = await storage.getRoom(id);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      res.json(room);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/rooms/ward/:wardId", async (req, res, next) => {
    try {
      const wardId = parseInt(req.params.wardId);
      const rooms = await storage.getRoomsByWard(wardId);
      res.json(rooms);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/rooms", requireRole(["admin"]), async (req, res, next) => {
    try {
      const roomData = insertRoomSchema.parse(req.body);
      const room = await storage.createRoom(roomData);
      res.status(201).json(room);
    } catch (err) {
      if (err instanceof ValidationError) {
        return res.status(400).json({ message: err.message });
      }
      next(err);
    }
  });

  app.put("/api/rooms/:id", requireRole(["admin"]), async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const roomData = insertRoomSchema.partial().parse(req.body);
      const room = await storage.updateRoom(id, roomData);
      res.json(room);
    } catch (err) {
      if (err instanceof ValidationError) {
        return res.status(400).json({ message: err.message });
      }
      next(err);
    }
  });

  // Billing routes
  app.get("/api/bills", requireRole(["admin", "staff"]), async (req, res, next) => {
    try {
      const bills = await storage.getAllBills();
      res.json(bills);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/bills/:id", requireRole(["admin", "staff"]), async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const bill = await storage.getBill(id);
      if (!bill) {
        return res.status(404).json({ message: "Bill not found" });
      }
      res.json(bill);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/bills/patient/:patientId", requireRole(["admin", "staff"]), async (req, res, next) => {
    try {
      const patientId = parseInt(req.params.patientId);
      const bills = await storage.getBillsByPatient(patientId);
      res.json(bills);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/bills", requireRole(["admin", "staff"]), async (req, res, next) => {
    try {
      const billData = insertBillSchema.parse(req.body);
      const bill = await storage.createBill(billData);
      res.status(201).json(bill);
    } catch (err) {
      if (err instanceof ValidationError) {
        return res.status(400).json({ message: err.message });
      }
      next(err);
    }
  });

  app.put("/api/bills/:id", requireRole(["admin", "staff"]), async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const billData = insertBillSchema.partial().parse(req.body);
      const bill = await storage.updateBill(id, billData);
      res.json(bill);
    } catch (err) {
      if (err instanceof ValidationError) {
        return res.status(400).json({ message: err.message });
      }
      next(err);
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
