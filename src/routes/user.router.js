import { Router } from 'express'
import { login, register, logout, refreshaccessToken, updateUserPassword, updateavtar, getUserchannelsProfile, watchHistory } from '../controllers/user.controller.js';
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJwt } from '../middlewares/auth.middleware.js';

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avtar",
            maxCount: 1
        }
    ]),
    register
)
router.route('/login').post(login)
router.route('/logout').post(verifyJwt, logout) // logout controller
router.route('/refresh-token').post(refreshaccessToken)
router.route('/updatepassword').post(verifyJwt, updateUserPassword)
router.route('/updateavtar').post(
    upload.fields([
        {
            name: "avtar",
            maxCount: 1
        }
    ]), verifyJwt, updateavtar)
router.route('/channel/:username').get(verifyJwt, getUserchannelsProfile);
router.route('/watch-history').get(verifyJwt, watchHistory);

export default router;