import { User } from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import bcrypt from "bcrypt";

const register = asyncHandler(async (req, res) => {
    res.status(200).json({ message: "User registered successfully" })
})

const login = asyncHandler(async (req, res) => {
    res.status(200).json({ message: "User logged in successfully" })
})

export { register, login }