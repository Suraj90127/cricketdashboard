import mongoose from "mongoose";

const bankSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            ref: 'User',
            required: true,
        },
        bankName: {
            type: String,
            required: true,
            trim: true,
        },
        accountNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        phone: {
        type: Number,
        required: true
        },
        ifscCode: {
            type: String,
            required: true,
            trim: true,
        },
        accountHolderName: {
            type: String,
            required: true,
            trim: true,
        },
        accountType: {
            type: String,
            enum: ['Savings', 'Current', 'Checking'],
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const Bank = mongoose.model('Bank', bankSchema);
export default Bank;