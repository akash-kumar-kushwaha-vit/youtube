import { User } from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js"
import uploadCloudinary from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";

const register = asyncHandler(async (req, res) => {
    // take input from user 
    // validation
    // avtar cover 
    // upload on cloudnary
    // create user 
    // return response



    // validation

    const { username, email, fullName, password } = req.body;  // user input

    console.log(email) // check email

    if (username == "" || fullName == "" || email == "" || password == "") {// basic validation
        throw new ApiError(400, "all fields are required!");
    }
    //  check existenace of user
    const userexisted = await User.findOne({ email: email })
    if (userexisted) throw new ApiError(409, "user already existed!")


    // upload file on cloudnary
    const avtarlocalpath = req.files?.avtar[0]?.path
    if (!avtarlocalpath) throw new ApiError(403, "file upload are faild registration")

    const avtar = await uploadCloudinary(avtarlocalpath);
    console.log(avtar)
    if (!avtar) throw new ApiError(403, "file upload are faild registration")

    const user = await User.create({
        username,
        fullName,
        email,
        password,
        avtar: avtar.url,

    })

    const usercreated = await User.findById(user._id).select(
        "-password"
    )
    if (!usercreated) throw new ApiError(500, "registrion failed! something went wrong")

    return res.status(201).json(
        new ApiResponse(200, usercreated, "user created succsessfully")
    )



})

const login = asyncHandler(async (req, res) => {
    res.status(200).json({ message: "User logged in successfully" })
})

export { register, login }