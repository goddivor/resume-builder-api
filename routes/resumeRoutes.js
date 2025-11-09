import express from "express";
import protect from "../middlewares/authMiddleware.js";
import { createResume, deleteResume, getPublicResumeById, getResumeById, updateResume, assignAnnexesToResume, getResumeWithAnnexes, cloneResume, getPublicResumeWithAnnexes } from "../controllers/resumeController.js";
import { generateResumePDF } from "../controllers/pdfController.js";
import upload from "../configs/multer.js";

const resumeRouter = express.Router();

resumeRouter.post('/create', protect, createResume);
resumeRouter.put('/update', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'signature', maxCount: 1 }]), protect, updateResume);
resumeRouter.delete('/delete/:resumeId', protect, deleteResume);
resumeRouter.get('/get/:resumeId', protect, getResumeById);
resumeRouter.get('/public/:resumeId/with-annexes', getPublicResumeWithAnnexes);
resumeRouter.get('/public/:resumeId', getPublicResumeById);
resumeRouter.put('/:resumeId/annexes', protect, assignAnnexesToResume);
resumeRouter.get('/:resumeId/with-annexes', protect, getResumeWithAnnexes);
resumeRouter.post('/:resumeId/generate-pdf', protect, generateResumePDF);
resumeRouter.post('/:resumeId/clone', protect, cloneResume);

// Test endpoint
resumeRouter.get('/test-pdf', (req, res) => {
    res.json({ message: 'PDF endpoint is working' });
});

export default resumeRouter