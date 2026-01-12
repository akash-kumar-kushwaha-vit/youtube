import { Router } from 'express'
import { login, register, logout, refreshaccessToken } from '../controllers/user.controller.js';
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

export default router;