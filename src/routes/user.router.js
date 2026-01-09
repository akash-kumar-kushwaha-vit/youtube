import { Router } from 'express'
import { login, register } from '../controllers/user.controller.js';
import { upload } from "../middlewares/multer.middleware.js"


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
router.route('/login').get(login)

export default router;