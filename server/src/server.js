import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import api from './routes.js';
import { Admin } from './models.js';
import bcrypt from 'bcryptjs';
import dns from "node:dns";

dns.setServers(["8.8.8.8"]);
dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.resolve(__dirname, '../../client/public/static/uploads')));
app.get('/api/health', (_req,res)=>res.json({ok:true,service:'trekking-management-api'}));
app.use('/api', api);
const port = process.env.PORT || 5000;
try {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/trekking_management');
  const existing = await Admin.findOne({email:'admin@trek.com'});
  if (!existing) await Admin.create({name:'Super Admin',email:'admin@trek.com',passwordHash:await bcrypt.hash('admin123',12),role:'Admin'});
  app.listen(port, ()=>console.log(`Trekking API listening on http://localhost:${port}`));
} catch (err) {
  console.error('Could not connect to MongoDB. Start MongoDB and check MONGODB_URI.', err.message);
  process.exit(1);
}
