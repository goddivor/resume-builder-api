import express from 'express';
import { adminProtect } from '../middlewares/authMiddleware.js';
import {
    adminLogin,
    getAdminStats,
    getAllUsers,
    getAllResumes,
    deleteUser,
    deleteResume,
    getUserDetails
} from '../controllers/adminController.js';

const router = express.Router();

// Public route - Admin login
router.post('/login', adminLogin);

// All routes below require admin authentication
router.use(adminProtect);

// Dashboard stats
router.get('/stats', getAdminStats);

// Users management
router.get('/users', getAllUsers);
router.get('/users/:userId', getUserDetails);
router.delete('/users/:userId', deleteUser);

// Resumes management
router.get('/resumes', getAllResumes);
router.delete('/resumes/:resumeId', deleteResume);

export default router;
