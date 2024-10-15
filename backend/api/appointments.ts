import { Router } from 'express';
import { databaseConnection } from '../connections/DatabaseConnection';

const router = Router();

// GET all appointments
router.get("/", (req, res) => {
  const query = "SELECT * FROM appointments";

  databaseConnection.query(query, (err, data) => {
    if (err) return res.json(err);
    return res.json(data); 
  });
});

// GET a specific appointment by ID
router.get("/:id", (req, res) => {
  const query = "SELECT * FROM appointments WHERE patient_id = ?";
  const id = req.params.id;

  databaseConnection.query(query, id, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

// CREATE a new appointment
router.post("/create", (req, res) => {
  const query = `
    INSERT INTO appointments (appointment_id, title, appointment_date, patient_id) 
    VALUES (?, ?, ?, ?)
  `;

  const values = [
    req.body.appointment_id,
    req.body.title,
    req.body.appointment_date,
    req.body.patient_id
  ];

  databaseConnection.query(query, values, (err, data) => {
    if (err) {
      console.error('SQL Error:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    return res.json({
      ...data,
      message: "Successfully added appointment",
      status: "success",
    });
  });
});

// UPDATE an existing appointment by ID
router.put("/update/:id", (req, res) => {
  const query = `
    UPDATE appointments 
    SET appointment_date = ?, 
        patient_id = ?
    WHERE appointment_id = ?
  `;

  const values = [
    req.body.appointment_date,
    req.body.patient_id,
    req.params.id
  ];

  databaseConnection.query(query, values, (err, data) => {
    if (err) {
      console.error('SQL Error:', err);
      return res.status(500).json({ error: 'Database update failed' });
    }

    if (data.affectedRows === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    return res.json({
      message: "Successfully updated appointment",
      status: "success"
    });
  });
});

// DELETE an appointment by ID
router.delete("/delete/:id", (req, res) => {
  const query = "DELETE FROM appointments WHERE appointment_id = ?";
  const id = req.params.id;

  databaseConnection.query(query, id, (err, data) => {
    if (err) return res.json(err);
    return res.json({
      ...data,
      message: "Successfully deleted appointment",
      status: "success",
    });
  });
});

export const appointmentsRouter = router;
