const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, enum: ["recipe", "health", "tips", "question"], required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Post", postSchema);