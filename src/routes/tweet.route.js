import { Router } from "express";
import { createTweet, deleteTweet, getUserTweets, upadateTweet } from "../controllers/tweet.controller";
import { verifyJWT } from "../middlewares/autho.middleware";

const router=Router()
router.use(verifyJWT)

router.route("/").post(createTweet)
router.route("/user/:userId").get(getUserTweets)
router.route("/:TweetId").patch(upadateTweet).delete(deleteTweet)

export default router