import { Router } from 'express';
import { databaseConnection } from '../connections/DatabaseConnection';

const router = Router();

// GET all BMI records
router.get("/", (req, res) => {
  const query = "SELECT * FROM bmi_records";

  databaseConnection.query(query, (err, data) => {
    if (err) return res.json(err);
    return res.json(data); 
  });
});

// GET a specific BMI record by ID
router.get("/:id", (req, res) => {
  const query = "SELECT * FROM bmi_records WHERE patient_id = ? ORDER BY created_at DESC LIMIT 1";
  const id = req.params.id;

  databaseConnection.query(query, id, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

// CREATE a new BMI record
router.post("/create", (req, res) => {
  const query = `
    INSERT INTO bmi_records (bmi_id, patient_id, bmi, created_at) 
    VALUES (?, ?, ?, ?)
  `;

  const values = [
    null,
    req.body.patient_id,
    req.body.bmi,
    new Date()
  ];

  databaseConnection.query(query, values, (err, data) => {
    if (err) {
      console.error('SQL Error:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    return res.json({
      ...data,
      message: "Successfully added BMI record",
      status: "success",
    });
  });
});

// UPDATE an existing BMI record by ID
router.put("/update/:id", (req, res) => {
  const query = `
    UPDATE bmi_records 
    SET 
        bmi = ?
    WHERE bmi_id = ?
  `;

  const values = [
    req.body.bmi,
    req.params.id
  ];

  databaseConnection.query(query, values, (err, data) => {
    if (err) {
      console.error('SQL Error:', err);
      return res.status(500).json({ error: 'Database update failed' });
    }

    if (data.affectedRows === 0) {
      return res.status(404).json({ message: "BMI record not found" });
    }

    return res.json({
      message: "Successfully updated BMI record",
      status: "success"
    });
  });
});

// DELETE a BMI record by ID
router.delete("/delete/:id", (req, res) => {
  const query = "DELETE FROM bmi_records WHERE bmi_id = ?";
  const id = req.params.id;

  databaseConnection.query(query, id, (err, data) => {
    if (err) return res.json(err);
    return res.json({
      ...data,
      message: "Successfully deleted BMI record",
      status: "success",
    });
  });
});

export const bmiRecordsRouter = router;
