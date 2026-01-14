import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema({
    video: {
        type: String,//cloudnary
        required: true,


    },
    title: {
        type: String,
        required: true,
    },
    thumbel: {
        type: String,//cloudnary
        required: true,

    },
    duration: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    },
    views: {
        type: Number,
        default: 0,
    },

    discription: {
        type: String,
        required: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    comment: {
        type: String,
    }

}, { timestamps: true })

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);