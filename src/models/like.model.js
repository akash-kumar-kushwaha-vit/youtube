import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({
    likedby: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    vedio: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    },
    like: {
        type: Boolean,
        default: false
    },
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }
}, { timestamps: true })


export const Like = mongoose.model("Like", likeSchema)