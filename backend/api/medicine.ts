import { Router } from 'express';
import { databaseConnection } from '../connections/DatabaseConnection';

const router = Router();

// GET all medicine records
router.get("/", (req, res) => {
  const query = "SELECT * FROM medicines";

  databaseConnection.query(query, (err, data) => {
    if (err) return res.json(err);
    return res.json(data); 
  });
});

// GET a specific medicine record by ID
router.get("/:id", (req, res) => {
  const query = "SELECT * FROM medicines WHERE patient_id = ?";
  const id = req.params.id;

  databaseConnection.query(query, id, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

// CREATE a new medicine record
router.post("/create", (req, res) => {
  const query = `
    INSERT INTO medicines (medicine_id, medicine_name, time, size, status, patient_id, created_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const created_at = new Date();

  const values = [
    req.body.medicine_id,
    req.body.medicine_name,
    req.body.time,
    req.body.size,
    req.body.status,
    req.body.patient_id,
    created_at
  ];

  databaseConnection.query(query, values, (err, data) => {
    if (err) {
      console.error('SQL Error:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    return res.json({
      ...data,
      message: "Successfully added medicine record",
      status: "success",
    });
  });
});

// UPDATE an existing medicine record by ID
router.put("/update/:id", (req, res) => {
  const query = `
    UPDATE medicines 
    SET
        status = ?
    WHERE medicine_id = ?
  `;

  const values = [
    req.body.status,
    req.params.id
  ];

  databaseConnection.query(query, values, (err, data) => {
    if (err) {
      console.error('SQL Error:', err);
      return res.status(500).json({ error: 'Database update failed' });
    }

    if (data.affectedRows === 0) {
      return res.status(404).json({ message: "Medicine record not found" });
    }

    return res.json({
      message: "Successfully updated medicine record",
      status: "success"
    });
  });
});

// DELETE a medicine record by ID
router.delete("/delete/:id", (req, res) => {
  const query = "DELETE FROM medicines WHERE medicine_id = ?";
  const id = req.params.id;

  databaseConnection.query(query, id, (err, data) => {
    if (err) return res.json(err);
    return res.json({
      ...data,
      message: "Successfully deleted medicine record",
      status: "success",
    });
  });
});

export const medicinesRouter = router;
