import User from "../models/User.js";
import Resume from "../models/Resume.js";
import Annexe from "../models/Annexe.js";
import jwt from 'jsonwebtoken';

const generateToken = (userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return token;
};

// Admin login
// POST: /api/admin/login
export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Check if user is admin
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        // Check if password is correct
        if (!user.comparePassword(password)) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Return success message
        const token = generateToken(user._id);
        user.password = undefined;

        return res.status(200).json({ message: 'Login successful', token, user });

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// Get dashboard statistics
// GET: /api/admin/stats
export const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalResumes = await Resume.countDocuments();
        const totalAnnexes = await Annexe.countDocuments();
        const publicResumes = await Resume.countDocuments({ public: true });

        // Get recent users (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentUsers = await User.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });

        // Get recent resumes (last 7 days)
        const recentResumes = await Resume.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });

        return res.status(200).json({
            stats: {
                totalUsers,
                totalResumes,
                totalAnnexes,
                publicResumes,
                recentUsers,
                recentResumes
            }
        });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// Get all users with pagination
// GET: /api/admin/users
export const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments();

        return res.status(200).json({
            users,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// Get all resumes with pagination
// GET: /api/admin/resumes
export const getAllResumes = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const resumes = await Resume.find()
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Resume.countDocuments();

        return res.status(200).json({
            resumes,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// Delete a user and all their resumes
// DELETE: /api/admin/users/:userId
export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Delete all user's resumes and annexes
        await Resume.deleteMany({ userId });
        await Annexe.deleteMany({ userId });

        // Delete the user
        await User.findByIdAndDelete(userId);

        return res.status(200).json({ message: 'User and all associated data deleted successfully' });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// Delete a resume
// DELETE: /api/admin/resumes/:resumeId
export const deleteResume = async (req, res) => {
    try {
        const { resumeId } = req.params;

        await Resume.findByIdAndDelete(resumeId);

        return res.status(200).json({ message: 'Resume deleted successfully' });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// Get user details with their resumes
// GET: /api/admin/users/:userId
export const getUserDetails = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const resumes = await Resume.find({ userId }).sort({ createdAt: -1 });
        const annexes = await Annexe.find({ userId }).sort({ createdAt: -1 });

        return res.status(200).json({
            user,
            resumes,
            annexes
        });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};
