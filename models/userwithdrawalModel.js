import mongoose from 'mongoose';

const userWithdrawalSchema = new mongoose.Schema({
    userId: {
        type: String,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'completed'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        required: true
    },
    accountnumber: {
        type: String,
        required: true
    },
    ifsc: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    
}, { timestamps: true });

const UserWithdrawal = mongoose.model('UserWithdrawal', userWithdrawalSchema);

export default UserWithdrawal;