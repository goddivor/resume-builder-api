import express from "express";
import { proxyPDF } from "../controllers/proxyController.js";

const proxyRouter = express.Router();

proxyRouter.get('/pdf', proxyPDF);

export default proxyRouter;
