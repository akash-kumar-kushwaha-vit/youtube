import { User } from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js"
import uploadCloudinary from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";


const generateAccessTokenAndrefreshToken = async (userId) => {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.REFRESH_TOKEN = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
}


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

    if (incomingrefreshToken !== user.REFRESH_TOKEN) {
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

const updateUserPassword = asyncHandler(async (req, res) => {
    // find user 
    // change password
    // save it
    const { newpassword, oldpassword } = req.body;
    const upadteuser = await User.findById(req.user?._id);
    if (!upadteuser) {
        throw new ApiError(500, "something went wrong during updating the password");
    }
    const iscorrectpassword = await upadteuser.isPasswordCorrect(oldpassword);
    if (!iscorrectpassword) {
        throw new ApiError(404, "invalid password");
    }
    upadteuser.password = newpassword;
    await upadteuser.save({ validateBeforeSave: false });
    res.status(201).json(
        new ApiResponse(200, {}, "upadate password successfully!")
    )

})

const updateavtar = asyncHandler(async (req, res) => {
    const avtarlocalpath = req.files?.avtar[0]?.path
    if (!avtarlocalpath) throw new ApiError(403, "file upload are faild registration localpath missing")
    console.log(avtarlocalpath)
    const avtar = await uploadCloudinary(avtarlocalpath);
    if (!avtar) throw new ApiError(403, "file upload are faild registration")
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { avtar: avtar.url }
    )

    res.status(200).json(
        new ApiResponse(200, { avtar }, "avtar updated successfully")
    )

})


const getUserchannelsProfile = asyncHandler(async (req, res) => {
    //get user
    const user = req.params.username;
    if (!user) {
        throw new ApiError(404, "user not found")
    }
    const channels = await User.aggregate([
        {
            $match: { username: req.params.username }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribersofchannel"

            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedchannels"

            }
        },
        {
            $addFields: {
                totalSubscribers: { $size: "$subscribersofchannel" },
                totalSubscribedChannels: { $size: "$subscribedchannels" },
                issubscribed: { $cond: { if: { $in: [new mongoose.Types.ObjectId(req.user._id), "$subscribersofchannel.subscriber"] }, then: true, else: false } }
            }
        }, {
            $project: {
                totalSubscribers: 1,
                totalSubscribedChannels: 1,
                issubscribed: 1,
                username: 1,
                fullName: 1,
                avtar: 1,
                createdAt: 1,
            }
        }
    ])
    if (!channels?.length) {
        throw new ApiError(404, "channels not found")
    }

    return res.status(200).json(
        new ApiResponse(200, channels[0], "channels profile fetched successfully")
    )

})

const watchHistory = asyncHandler(async (req, res) => {
    //get user watch history
    const history = await User.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(req.user._id) }
        },
        {
            $lookup: {
                from: "videos",
                localField: "history",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                        }
                    },
                    {
                        $addFields: {
                            owner: { $arrayElemAt: ["$owner", 0] },
                        }
                    }, {
                        $project: {
                            _id: 1,
                            username: 1,
                            owner: 1,
                            fullName: 1,
                            avtar: 1,

                        }
                    }
                ]
            },
        }, {
            $project: {
                watchHistory: 1,


            }
        }



    ])
    return res.status(200).json(
        new ApiResponse(200, history[0], "watch history fetched successfully")
    )
})
export { register, login, logout, refreshaccessToken, updateUserPassword, updateavtar, getUserchannelsProfile, watchHistory }