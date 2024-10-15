import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Express, Request, Response } from 'express';
import path from 'path';
import { patientsRouter } from './api/patients';
import { appointmentsRouter } from './api/appointments';
import { loginRouter } from './api/login';
import { medicinesRouter } from './api/medicine';
import { bmiRecordsRouter } from './api/bmi';


dotenv.config();
const app: Express = express();
const PORT = process.env.PORT || 8800;

app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

console.log('Serving static files from:', path.join(__dirname, 'uploads'));



app.use("/test", (req: Request, res: Response) => {

    console.log('Test route hit');
    res.send('Hello World');
})



app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});




app.use("/patients", patientsRouter) 
app.use("/appointments", appointmentsRouter)
app.use("/login", loginRouter)
app.use("/medicine", medicinesRouter)
app.use("/bmi", bmiRecordsRouter)




