import mongoose from "mongoose";

const AnnexeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    fileId: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    pageCount: {
        type: Number,
        default: 1
    }
}, { timestamps: true });

const Annexe = mongoose.model('Annexe', AnnexeSchema);

export default Annexe;
