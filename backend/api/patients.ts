import { Router } from 'express';
import { databaseConnection } from '../connections/DatabaseConnection';
import { getCurrentDateInManila } from '../connections/timezone';


const router = Router();



// GET all patient records
router.get("/", (req, res) => {
  const query = `SELECT p.patient_id,
    p.fullname,
    p.age,
    p.status,
    last_appointments.last_visit,
    next_appointments.next_appointment
FROM 
    patients p
LEFT JOIN (
    SELECT 
        a.patient_id, 
        MAX(a.appointment_date) AS last_visit
    FROM 
        appointments a
    WHERE 
        a.appointment_date < CURRENT_DATE()
    GROUP BY 
        a.patient_id
) AS last_appointments ON p.patient_id = last_appointments.patient_id
LEFT JOIN (
    SELECT 
        a.patient_id, 
        MIN(a.appointment_date) AS next_appointment
    FROM 
        appointments a
    WHERE 
        a.appointment_date >= CURRENT_DATE()
    GROUP BY 
        a.patient_id
) AS next_appointments ON p.patient_id = next_appointments.patient_id;
`;

  databaseConnection.query(query, (err, data) => {
    if (err) return res.json(err);
    return res.json(data); 
  });
});

router.get("/:id", (req, res) => {
  const query = "SELECT * FROM patients WHERE patient_id = ?";
  const id = req.params.id;

  databaseConnection.query(query, id, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

router.post("/create", (req, res) => {
  const created_at = getCurrentDateInManila();

  const patientQuery = `
    INSERT INTO patients (patient_id, fullname, age, phone, status, created_at) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const patientValues = [
    req.body.patient_id,
    req.body.fullname,
    req.body.age,
    req.body.phone,
    req.body.status,
    created_at
  ];

  databaseConnection.query(patientQuery, patientValues, (err, patientData) => {
    if (err) {
      console.error('SQL Error (Patients):', err);
      return res.status(500).json({ error: 'Failed to add patient record' });
    }

    const credentialsQuery = `
      INSERT INTO credentials (credentials_id, username, password, patient_id) 
      VALUES (?, ?, ?, ?)
    `;
    
    const credentialsValues = [
      null, 
      req.body.username,
      req.body.password, 
      patientData.insertId
    ];

    databaseConnection.query(credentialsQuery, credentialsValues, (err, credentialsData) => {
      if (err) {
        console.error('SQL Error (Credentials):', err);
        return res.status(500).json({ error: 'Failed to add credentials' });
      }

      return res.json({
        patientData,
        credentialsData,
        message: "Successfully added patient record and credentials",
        status: "success",
      });
    });
  });
});


// UPDATE an existing patient record by ID
router.put("/update/:id", (req, res) => {
  const query = `
    UPDATE patients 
    SET fullname = ?, 
        age = ?, 
        phone = ?, 
        status = ?, 
        created_at = ?
    WHERE patient_id = ?
  `;

  const values = [
    req.body.fullname,
    req.body.age,
    req.body.phone,
    req.body.status,
    req.body.created_at,
    req.params.id
  ];

  databaseConnection.query(query, values, (err, data) => {
    if (err) {
      console.error('SQL Error:', err);
      return res.status(500).json({ error: 'Database update failed' });
    }

    if (data.affectedRows === 0) {
      return res.status(404).json({ message: "Patient record not found" });
    }

    return res.json({
      message: "Successfully updated patient record",
      status: "success"
    });
  });
});

// DELETE a patient record by ID
router.delete("/delete/:id", (req, res) => {
  const query = "DELETE FROM patients WHERE patient_id = ?";
  const id = req.params.id;

  databaseConnection.query(query, id, (err, data) => {
    if (err) return res.json(err);
    return res.json({
      ...data,
      message: "Successfully deleted patient record",
      status: "success",
    });
  });
});

export const patientsRouter = router;
