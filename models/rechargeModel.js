import mongoose from 'mongoose';

const rechargeSchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: 'User'
  },
  id_order: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  money: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    // required: true
    default: 'zilpay'
    },
  status: {
    type: String,
    default: "pending", // pending, rejected, completed
    enum: ['pending', 'rejected', 'completed'],
  },
  code: { type: String, required: true },
  invite: { type: String },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

rechargeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Recharge = mongoose.model('Recharge', rechargeSchema);
export default Recharge;