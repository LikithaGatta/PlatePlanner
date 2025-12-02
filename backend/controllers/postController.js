const Post = require("../models/Post");
const User = require("../models/User");

// get all forum posts with their replies nested inside
exports.getPosts = async (req, res) => {
    try {
        // first get all top-level posts (no parent)
        const posts = await Post.find({ parentId: null }).sort({ createdAt: -1 }).lean();

        // helper function to attach replies to each post
        const attachReplies = async (post) => {
            const replies = await Post.find({ parentId: post._id }).sort({ createdAt: 1 }).lean();
            post.replies = await Promise.all(replies.map(attachReplies));
            return post;
        };

        // add replies to all posts
        const postsWithReplies = await Promise.all(posts.map(attachReplies));
        res.json(postsWithReplies);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch posts" });
    }
};

// create a new post or reply
exports.createPost = async (req, res) => {
    try {
        const { title, content, category, parentId } = req.body;

        // find who's posting
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        // make the post
        const post = await Post.create({
            authorId: req.userId,
            authorName: user.name || user.email,
            title,
            content,
            category,
            parentId: parentId || null // if parentId exists, this is a reply
        });

        res.status(201).json(post);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create post" });
    }
};

// edit your own post
exports.editPost = async (req, res) => {
    try {
        const { title, content } = req.body;
        const post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ error: "Post not found" });
        // make sure you own this post
        if (post.authorId.toString() !== req.userId) return res.status(403).json({ error: "Forbidden" });

        // update the fields
        post.title = title ?? post.title;
        post.content = content ?? post.content;
        post.updatedAt = Date.now();
        await post.save();

        res.json(post);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to edit post" });
    }
};

// delete your own post
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Post not found" });
        // make sure you own this post
        if (post.authorId.toString() !== req.userId) return res.status(403).json({ error: "Forbidden" });

        await post.deleteOne();
        res.json({ message: "Post deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete post" });
    }
};

// like or unlike a post
exports.toggleLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Post not found" });

        // check if user already liked it
        const index = post.likes.indexOf(req.userId);
        if (index === -1) post.likes.push(req.userId); // add like
        else post.likes.splice(index, 1); // remove like

        await post.save();
        res.json({ likes: post.likes });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to toggle like" });
    }
};