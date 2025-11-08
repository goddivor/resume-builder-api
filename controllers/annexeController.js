import imagekit from "../configs/imageKit.js";
import Annexe from "../models/Annexe.js";
import fs from 'fs';

// controller for uploading an annexe
// POST: /api/annexes/upload
export const uploadAnnexe = async (req, res) => {
    try {
        const userId = req.userId;
        const { title } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Validate file type
        if (file.mimetype !== 'application/pdf') {
            return res.status(400).json({ message: 'Only PDF files are allowed' });
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            return res.status(400).json({ message: 'File size must be less than 10MB' });
        }

        // Upload to ImageKit
        const fileBufferData = fs.createReadStream(file.path);

        const response = await imagekit.files.upload({
            file: fileBufferData,
            fileName: file.originalname,
            folder: 'annexes',
        });

        // Create annexe record
        const newAnnexe = await Annexe.create({
            userId,
            title,
            fileUrl: response.url,
            fileId: response.fileId,
            fileName: file.originalname,
            fileSize: file.size
        });

        // Clean up temporary file
        if (file.path) {
            fs.unlinkSync(file.path);
        }

        return res.status(201).json({
            message: 'Annexe uploaded successfully',
            annexe: newAnnexe
        });

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// controller for listing all annexes of a user
// GET: /api/annexes/list
export const listAnnexes = async (req, res) => {
    try {
        const userId = req.userId;

        const annexes = await Annexe.find({ userId }).sort({ createdAt: -1 });

        return res.status(200).json({ annexes });

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// controller for getting a single annexe
// GET: /api/annexes/:annexeId
export const getAnnexe = async (req, res) => {
    try {
        const userId = req.userId;
        const { annexeId } = req.params;

        const annexe = await Annexe.findOne({ userId, _id: annexeId });

        if (!annexe) {
            return res.status(404).json({ message: 'Annexe not found' });
        }

        return res.status(200).json({ annexe });

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// controller for deleting an annexe
// DELETE: /api/annexes/delete/:annexeId
export const deleteAnnexe = async (req, res) => {
    try {
        const userId = req.userId;
        const { annexeId } = req.params;

        const annexe = await Annexe.findOne({ userId, _id: annexeId });

        if (!annexe) {
            return res.status(404).json({ message: 'Annexe not found' });
        }

        // Delete from ImageKit
        try {
            await imagekit.files.delete(annexe.fileId);
        } catch (error) {
            console.error('Error deleting file from ImageKit:', error);
        }

        // Delete from database
        await Annexe.findByIdAndDelete(annexeId);

        return res.status(200).json({ message: 'Annexe deleted successfully' });

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};
