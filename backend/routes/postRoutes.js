const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const postController = require("../controllers/postController");

router.get("/", auth, postController.getPosts);
router.post("/", auth, postController.createPost);
router.put("/:id", auth, postController.editPost);
router.delete("/:id", auth, postController.deletePost);
router.post("/:id/like", auth, postController.toggleLike);

module.exports = router;