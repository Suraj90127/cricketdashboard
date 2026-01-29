import mongoose from "mongoose";

const betHistorySchema = new mongoose.Schema(
    {
        userId: {
            // type: mongoose.Schema.Types.ObjectId,
            type: String,
            required: true,
            // ref: "User",
        },
        gameId: {
            type: String,
            // type: mongoose.Schema.Types.ObjectId,
            required: true,
            // ref: "Game",
        },
        userName: {
            type: String,
            required: true,
        },
        sid: {
            type: String,
            required: true,
        },
        otype: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        xValue: {
            type: Number,
            required: true,
        },
        resultAmount: {
            type: Number,
            default: 0,
        },
        betAmount: {
            type: Number,
            default: 0,
        },
        status: {
            type: Number,
            required: true,
            default: 0,
        },
        eventName: {
            type: String,
            required: true,
        },
        marketName: {
            type: String,
            required: true,
        },
        fancyScore: {
            type: String,
            default: 0,
        },
        gameType: {
            type: String,
            required: true,
        },
        gameName: {
            type: String,
            required: true,
        },
        teamName: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

const betHistoryModel = mongoose.model("BetHistory", betHistorySchema);

export default betHistoryModel;
