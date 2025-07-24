import { Router } from "express";

import { createPlayList, getUserPlayLists } from "../controllers/playlist.controller";
import { verifyJWT } from "../middlewares/autho.middleware";

const router=Router()
router.use(verifyJWT)

router.route("/").post(createPlayList)
router
    .route("/:playlistId")
    .get(getPlaylistById)
    .patch(updatePlaylist)
    .delete(deletePlaylist);

router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist);

router.route("/user/:userId").get(getUserPlaylists);

export default router