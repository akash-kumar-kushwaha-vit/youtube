import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt, { hash } from "bcrypt"
import { use } from "react";
const userSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,

    },
    password: {
        type: String,
        required: true,
    },
    avtar: {
        type: String,//cloudnary 
    },
    videos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
    }],
    history: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
    }],


}, { timestamps: true })


userSchema.pre("save", function (next) {
    if (!this.isModified("password")) return next();
    this.password = hash(this.password, 10)
    next()
})

userSchema.method.AccessTokenGenerate = function () {
    const token = jwt.sign({
        _id: this._id,
        user: this.user,
        fullName: this.fullName,
    },
        process.env.ACCESS_TOKEN,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
    return token
}

userSchema.method.RefreshTokenGenerate = function () {
    const token = jwt.sign({
        _id: this._id,
    },
        process.env.REFRESS_TOKEN,
        {
            expiresIn: process.env.REFRESS_TOKEN_EXPIRY
        }
    )
    return token
}



export const User = mongoose.model("User", userSchema);