const Post = require("../models/Post");
const User = require("../models/User");

// Find nested posts (the replies)
exports.getPosts = async (req, res) => {
    try {
        const posts = await Post.find({ parentId: null }).sort({ createdAt: -1 }).lean();

        const attachReplies = async (post) => {
            const replies = await Post.find({ parentId: post._id }).sort({ createdAt: 1 }).lean();
            post.replies = await Promise.all(replies.map(attachReplies));
            return post;
        };

        const postsWithReplies = await Promise.all(posts.map(attachReplies));
        res.json(postsWithReplies);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch posts" });
    }
};

exports.createPost = async (req, res) => {
    try {
        const { title, content, category, parentId } = req.body;

        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        const post = await Post.create({
            authorId: req.userId,
            authorName: user.name || user.email,
            title,
            content,
            category,
            parentId: parentId || null
        });

        res.status(201).json(post);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create post" });
    }
};

exports.editPost = async (req, res) => {
    try {
        const { title, content } = req.body;
        const post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ error: "Post not found" });
        if (post.authorId.toString() !== req.userId) return res.status(403).json({ error: "Forbidden" });

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

exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Post not found" });
        if (post.authorId.toString() !== req.userId) return res.status(403).json({ error: "Forbidden" });

        await post.deleteOne();
        res.json({ message: "Post deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete post" });
    }
};

exports.toggleLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Post not found" });

        const index = post.likes.indexOf(req.userId);
        if (index === -1) post.likes.push(req.userId);
        else post.likes.splice(index, 1);

        await post.save();
        res.json({ likes: post.likes });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to toggle like" });
    }
};