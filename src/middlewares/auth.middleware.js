import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import jwt from "jsonwebtoken";


const verifyJwt = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.ACCESS_TOKEN || req.headers?.authorization?.split(" ")[1];
        if (!token) {
            throw new ApiError(401, "access denied, please login")

        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN);
        if (!decodedToken) {
            throw new ApiError(401, "invalid token, please login again")
        }
        req.user = decodedToken;

        next();
    } catch (error) {
        throw new ApiError(401, "invalid token, please login again")
    }
})
export { verifyJwt };