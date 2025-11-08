import express from "express";
import protect from "../middlewares/authMiddleware.js";
import { uploadAnnexe, listAnnexes, getAnnexe, deleteAnnexe } from "../controllers/annexeController.js";
import upload from "../configs/multer.js";

const annexeRouter = express.Router();

annexeRouter.post('/upload', upload.single('annexe'), protect, uploadAnnexe);
annexeRouter.get('/list', protect, listAnnexes);
annexeRouter.get('/:annexeId', protect, getAnnexe);
annexeRouter.delete('/delete/:annexeId', protect, deleteAnnexe);

export default annexeRouter;
