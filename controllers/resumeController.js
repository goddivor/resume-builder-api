import imagekit from "../configs/imageKit.js";
import Resume from "../models/Resume.js";
import Annexe from "../models/Annexe.js";
import fs from 'fs';


// controller for creating a new resume
// POST: /api/resumes/create
export const createResume = async (req, res) => {
    try {
        const userId = req.userId;
        const {title} = req.body;

        // create new resume
        const newResume = await Resume.create({userId, title})
        // return success message
        return res.status(201).json({message: 'Resume created successfully', resume: newResume})

    } catch (error) {
        return res.status(400).json({message: error.message})
    }
}

// controller for deleting a resume
// DELETE: /api/resumes/delete
export const deleteResume = async (req, res) => {
    try {
        const userId = req.userId;
        const {resumeId} = req.params;

       await Resume.findOneAndDelete({userId, _id: resumeId})

        // return success message
        return res.status(200).json({message: 'Resume deleted successfully'})

    } catch (error) {
        return res.status(400).json({message: error.message})
    }
}


// get user resume by id
// GET: /api/resumes/get
export const getResumeById = async (req, res) => {
    try {
        const userId = req.userId;
        const {resumeId} = req.params;

       const resume = await Resume.findOne({userId, _id: resumeId})

       if(!resume){
        return res.status(404).json({message: "Resume not found"})
       }

        resume.__v = undefined;
        resume.createdAt = undefined;
        resume.updatedAt = undefined;

        return res.status(200).json({resume})

    } catch (error) {
        return res.status(400).json({message: error.message})
    }
}

// get resume by id public
// GET: /api/resumes/public
export const getPublicResumeById = async (req, res) => {
    try {
        const { resumeId } = req.params;
        const resume = await Resume.findOne({public: true, _id: resumeId})

        if(!resume){
        return res.status(404).json({message: "Resume not found"})
       }

       return res.status(200).json({resume})
    } catch (error) {
         return res.status(400).json({message: error.message})
    }
}

// get public resume by id with annexes
// GET: /api/resumes/public/:resumeId/with-annexes
export const getPublicResumeWithAnnexes = async (req, res) => {
    try {
        const { resumeId } = req.params;
        const resume = await Resume.findOne({ public: true, _id: resumeId })
            .populate('annexes.annexeId');

        if (!resume) {
            return res.status(404).json({ message: 'Resume not found or not public' });
        }

        return res.status(200).json({ resume });

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

// controller for updating a resume
// PUT: /api/resumes/update
export const updateResume = async (req, res) =>{
    try {
        const userId = req.userId;
        const {resumeId, resumeData, removeBackground, removeSignatureBackground} = req.body
        const files = req.files;

        let resumeDataCopy;
        if(typeof resumeData === 'string'){
            resumeDataCopy = await JSON.parse(resumeData)
        }else{
            resumeDataCopy = structuredClone(resumeData)
        }

        if(files?.image && files.image[0]){
            const image = files.image[0];

            const imageBufferData = fs.createReadStream(image.path)

            const response = await imagekit.files.upload({
                            file: imageBufferData,
                            fileName: 'profile.png',
                            folder: 'user-resumes',
                             transformation: {
                                pre: 'w-300,h-300,fo-face,z-0.75' + (removeBackground ? ',e-bgremove' : '')
                             }
                            });

            resumeDataCopy.personal_info.image = response.url
        }

        if(files?.signature && files.signature[0]){
            const signature = files.signature[0];

            const signatureBufferData = fs.createReadStream(signature.path)

            const response = await imagekit.files.upload({
                            file: signatureBufferData,
                            fileName: 'signature.png',
                            folder: 'user-resumes',
                             transformation: {
                                pre: 'w-400,h-200' + (removeSignatureBackground ? ',e-bgremove' : '')
                             }
                            });

            if(!resumeDataCopy.signature){
                resumeDataCopy.signature = {}
            }
            resumeDataCopy.signature.image = response.url
        }

       const resume = await Resume.findByIdAndUpdate({userId, _id: resumeId}, resumeDataCopy, {new: true})

       return res.status(200).json({message: 'Saved successfully', resume})
    } catch (error) {
        return res.status(400).json({message: error.message})
    }
}

// controller for assigning annexes to a resume
// PUT: /api/resumes/:resumeId/annexes
export const assignAnnexesToResume = async (req, res) => {
    try {
        const userId = req.userId;
        const { resumeId } = req.params;
        const { annexes } = req.body; // [{annexeId, order}, ...]

        // Validate that the resume belongs to the user
        const resume = await Resume.findOne({ userId, _id: resumeId });
        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        // Validate that all annexes belong to the user
        if (annexes && annexes.length > 0) {
            const annexeIds = annexes.map(a => a.annexeId);
            const userAnnexes = await Annexe.find({ userId, _id: { $in: annexeIds } });

            if (userAnnexes.length !== annexeIds.length) {
                return res.status(403).json({ message: 'Some annexes do not belong to you' });
            }

            // Check maximum limit (15 annexes)
            if (annexes.length > 15) {
                return res.status(400).json({ message: 'Maximum 15 annexes allowed per resume' });
            }
        }

        // Update resume with annexes
        resume.annexes = annexes || [];
        await resume.save();

        return res.status(200).json({ message: 'Annexes assigned successfully', resume });

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// controller for getting resume with populated annexes
// GET: /api/resumes/:resumeId/with-annexes
export const getResumeWithAnnexes = async (req, res) => {
    try {
        const userId = req.userId;
        const { resumeId } = req.params;

        const resume = await Resume.findOne({ userId, _id: resumeId })
            .populate('annexes.annexeId');

        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        return res.status(200).json({ resume });

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// controller for cloning a resume
// POST: /api/resumes/:resumeId/clone
export const cloneResume = async (req, res) => {
    try {
        const userId = req.userId;
        const { resumeId } = req.params;

        // Find the original resume
        const originalResume = await Resume.findOne({ userId, _id: resumeId });

        if (!originalResume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        // Create a copy of the resume data
        const resumeData = originalResume.toObject();

        // Remove fields that should not be copied
        delete resumeData._id;
        delete resumeData.createdAt;
        delete resumeData.updatedAt;
        delete resumeData.__v;

        // Update title to indicate it's a copy
        resumeData.title = `Copy of ${resumeData.title}`;

        // Create new resume
        const clonedResume = await Resume.create(resumeData);

        return res.status(201).json({
            message: 'Resume cloned successfully',
            resume: clonedResume
        });

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};