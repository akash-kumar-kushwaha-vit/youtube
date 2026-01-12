import { User } from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js"
import uploadCloudinary from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"


const generateAccessTokenAndrefreshToken = asyncHandler(async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.REFRESH_TOKEN = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "something wrong during genreting tokens")
    }

})


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
    // take a user input
    // check in mongodb 
    //check password
    // insert refreshToken and accessToken
    // login
    const { email, password } = req.body;

    const existUser = await User.findOne({ email: email })
    if (!existUser) throw new ApiError(402, "user are not found")

    const isPasswordValid = await existUser.isPasswordCorrect(password)
    if (!isPasswordValid) throw new ApiError(401, "Invalid password")

    const { accessToken, refreshToken } = await generateAccessTokenAndrefreshToken(existUser._id);
    const option = {
        httpOnly: true,
        secure: true
    }

    res.cookie("ACCESS_TOKEN", accessToken, option);
    res.cookie("REFRESH_TOKEN", refreshToken, option);

    return res.status(200).json(
        new ApiResponse(200, { accessToken, refreshToken }, "userlogin successfully")
    )
})
const logout = asyncHandler(async (req, res) => {
    //find user id  using a cokkies
    // remove refresh token
    await User.findByIdAndUpdate(
        req.user._id,
        {
            REFRESH_TOKEN: undefined
        }
    )
    res.status(200)
        .clearCookie("ACCESS_TOKEN")
        .clearCookie("REFRESH_TOKEN")
        .json(
            new ApiResponse(200, null, "user logout successfully")
        )


})

const refreshaccessToken = asyncHandler(async (req, res) => {
    const incomingrefreshToken = req.cookies.REFRESH_TOKEN;
    if (!incomingrefreshToken) {
        throw new ApiError(400, "invalid refresh token")
    }
    const decodedrefreshtoken = jwt.verify(incomingrefreshToken, process.env.REFRESS_TOKEN_SECRET);

    const user = await User.findById(decodedrefreshtoken?._id)
    if (!user) {
        throw new ApiError(401, "invalid accesstoken")
    }

    const decodedrefreshToken = jwt.verify(incomingrefreshToken, user.REFRESH_TOKEN);
    if (decodedrefreshToken !== user.REFRESH_TOKEN) {
        throw new ApiError(401, "invalid accesstoken check again")
    }

    const option = {
        httpOnly: true,
        secure: true
    }
    const { accessToken, refreshToken } = await generateAccessTokenAndrefreshToken(user._id);
    res.status(201)
        .cookie("ACCESS_TOKEN", accessToken, option)
        .cookie("REFRESH_TOKEN", refreshToken, option)
        .json(
            new ApiResponse(200, { accessToken, refreshToken }, "regenerate accresstoken and refreshtoken")
        )



})
export { register, login, logout, refreshaccessToken }