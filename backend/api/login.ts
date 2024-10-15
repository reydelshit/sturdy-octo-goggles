import { Router } from 'express';
import { databaseConnection } from '../connections/DatabaseConnection';

const router = Router();


// login account
router.post("/", (req, res) => {
  const query = `
    SELECT *  FROM credentials WHERE username = ? AND password = ? 

  `;

  const values = [
    req.body.username,
    req.body.password
  ];

  databaseConnection.query(query, values, (err, data) => {
    if (err) {
      console.error('SQL Error:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    return res.json({
      ...data,
      message: "Successfully added login",
      status: "success",
    });
  });
});



export const loginRouter = router;
