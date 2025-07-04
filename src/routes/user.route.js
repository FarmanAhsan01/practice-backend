import { Router } from "express";
import { loginUser, logoutUser, registerUser ,refrehAccessToken, changeCurrentPassword, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChennalProfile, getWatchHistory} from "../controllers/user.controller.js";
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
router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/current-user").get(verifyJWT,updateAccountDetails)
router.route("/update-account").patch(verifyJWT,updateAccountDetails)
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)
router.route("/c/:username").get(verifyJWT,getUserChennalProfile)
router.route("/history").get(verifyJWT,getWatchHistory)

export default router;