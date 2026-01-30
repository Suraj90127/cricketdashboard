import mongoose from "mongoose";


const adminSchema = new mongoose.Schema(
    {
        admin: {
            // type: mongoose.Schema.Types.ObjectId,
            type: String,

            // ref: "User",
        },
        gameId: {
            type: String,

        },
        type: {
            type: Number,
            default: 1,

        },

        activeUser: {
            type: String,

        },
        wnumber: {
            type: Number,
            default: 0,
        },  
    },
    {
        timestamps: true,
    }
);

const adminModel = mongoose.model("admin", adminSchema);

export default adminModel;
