import { Router } from "express";
import { loginUser, logoutUser, registerUser ,refrehAccessToken} from "../controllers/user.controller.js";
import { upload }from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/autho.middleware.js";

const router=Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),

    registerUser
)
router.route("/login").post(loginUser)

//secure router
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh-token").post(refrehAccessToken)


export default router;