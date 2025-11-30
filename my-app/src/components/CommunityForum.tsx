import React, { useState, useEffect } from "react";
import { ArrowLeft, MessageSquare, Send, Plus, ThumbsUp, MessageCircle, Edit, Trash } from "lucide-react";
import { useApp } from "../context/AppContext";
interface Post {
    _id: string;
    authorId: string;
    authorName: string;
    title: string;
    content: string;
    category: "recipe" | "health" | "tips" | "question";
    likes: string[];
    parentId?: string | null;
    createdAt: string;
    updatedAt: string;
    replies?: Post[];
}

interface Props {
    onNavigate: (screen: string) => void;
}


export function CommunityForum({ onNavigate }: Props) {
    const { user } = useApp();
    const token = user?.token;

    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeCategory, setActiveCategory] = useState<"all" | "recipe" | "health" | "tips" | "question">("all");
    const [showNewPost, setShowNewPost] = useState<string | null>(null);
    const [newPostTitle, setNewPostTitle] = useState("");
    const [newPostContent, setNewPostContent] = useState("");
    const [newPostCategory, setNewPostCategory] = useState<"recipe" | "health" | "tips" | "question">("recipe");
    const [editingPost, setEditingPost] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editContent, setEditContent] = useState("");
    const [replyForms, setReplyForms] = useState<Record<string, { title: string; content: string }>>({});

    useEffect(() => {
        if (user) {
            fetchPosts();
        }
    }, [user]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await fetch("http://localhost:5050/api/forum", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to fetch");
            const data: Post[] = await res.json();
            setPosts(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const createPost = async (parentId: string | null = null) => {
        const title = parentId ? (replyForms[parentId]?.title || "") : newPostTitle;
        const content = parentId ? (replyForms[parentId]?.content || "") : newPostContent;

        if (!title.trim() || !content.trim()) {
            alert("Please fill in both title and content");
            return;
        }

        try {
            const res = await fetch("http://localhost:5050/api/forum", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    content,
                    category: newPostCategory,
                    parentId: parentId || null,
                }),
            });

            if (!res.ok) throw new Error("Failed to create post");
            const data: Post = await res.json();

            if (parentId) {
                setPosts((prev) => addReply(prev, parentId, data));
                setReplyForms(prev => {
                    const updated = { ...prev };
                    delete updated[parentId];
                    return updated;
                });
            } else {
                setPosts((prev) => [data, ...prev]);
                setNewPostTitle("");
                setNewPostContent("");
                setNewPostCategory("recipe");
            }

            setShowNewPost(null);
        } catch (err) {
            console.error(err);
            alert("Failed to create post");
        }
    };

    const addReply = (postsArray: Post[], parentId: string, reply: Post): Post[] => {
        return postsArray.map((p) => {
            if (p._id === parentId) {
                const replies = p.replies ? [...p.replies, reply] : [reply];
                return { ...p, replies };
            } else if (p.replies) {
                return { ...p, replies: addReply(p.replies, parentId, reply) };
            }
            return p;
        });
    };

    const toggleLike = async (postId: string) => {
        try {
            const res = await fetch(`http://localhost:5050/api/forum/${postId}/like`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to like");
            const data = await res.json();
            setPosts((prev) => updateLikes(prev, postId, data.likes));
        } catch (err) {
            console.error(err);
        }
    };

    const updateLikes = (postsArray: Post[], postId: string, likes: string[]): Post[] => {
        return postsArray.map((p) => {
            if (p._id === postId) return { ...p, likes };
            if (p.replies) return { ...p, replies: updateLikes(p.replies, postId, likes) };
            return p;
        });
    };

    const startEdit = (post: Post) => {
        setEditingPost(post._id);
        setEditTitle(post.title);
        setEditContent(post.content);
    };

    const saveEdit = async (postId: string) => {
        try {
            const res = await fetch(`http://localhost:5050/api/forum/${postId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ title: editTitle, content: editContent }),
            });
            if (!res.ok) throw new Error("Failed to edit");
            const data: Post = await res.json();
            setPosts((prev) => updatePost(prev, postId, data));
            setEditingPost(null);
        } catch (err) {
            console.error(err);
            alert("Failed to edit post");
        }
    };

    const deletePost = async (postId: string) => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        try {
            const res = await fetch(`http://localhost:5050/api/forum/${postId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to delete");
            setPosts((prev) => removePost(prev, postId));
        } catch (err) {
            console.error(err);
            alert("Failed to delete post");
        }
    };

    const updatePost = (postsArray: Post[], postId: string, updatedPost: Post): Post[] => {
        return postsArray.map((p) => {
            if (p._id === postId) return updatedPost;
            if (p.replies) return { ...p, replies: updatePost(p.replies, postId, updatedPost) };
            return p;
        });
    };

    const removePost = (postsArray: Post[], postId: string): Post[] => {
        return postsArray
            .filter((p) => p._id !== postId)
            .map((p) => (p.replies ? { ...p, replies: removePost(p.replies, postId) } : p));
    };

    const getCategoryColor = (category: string): string => {
        const colors: Record<string, string> = {
            recipe: "bg-purple-100 text-purple-700 border-purple-200",
            health: "bg-green-100 text-green-700 border-green-200",
            tips: "bg-blue-100 text-blue-700 border-blue-200",
            question: "bg-orange-100 text-orange-700 border-orange-200"
        };
        return colors[category] || "bg-gray-100 text-gray-700 border-gray-200";
    };

    const PostCard: React.FC<{ post: Post; depth?: number }> = ({ post, depth = 0 }) => {
        const isOwner = user?._id === post.authorId;
        const isLiked = post.likes.includes(user?._id || "");
        const isEditing = editingPost === post._id;

        return (
            <div style={{ marginLeft: depth * 20 }} className="mb-3">
                <div className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-200 transition-colors bg-white">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="text-sm font-semibold text-gray-800">{post.authorName}</p>
                            <span className="text-xs text-gray-400">
                                {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString()}
                            </span>
                        </div>
                        {isOwner && !isEditing && (
                            <div className="flex gap-2">
                                <button onClick={() => startEdit(post)} className="text-gray-500 hover:text-blue-600">
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => deletePost(post._id)} className="text-gray-500 hover:text-red-600">
                                    <Trash className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className={`inline-block px-2 py-1 rounded text-xs border mb-2 ${getCategoryColor(post.category)}`}>
                        {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
                    </div>

                    {isEditing ? (
                        <div className="space-y-2">
                            <input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="Title"
                            />
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                rows={3}
                                placeholder="Content"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => saveEdit(post._id)}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => setEditingPost(null)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h3 className="mt-2 font-semibold text-gray-900">{post.title}</h3>
                            <p className="text-gray-600 mt-1">{post.content}</p>

                            <div className="flex items-center gap-4 mt-3">
                                <button
                                    onClick={() => toggleLike(post._id)}
                                    className={`flex items-center gap-1 ${isLiked ? "text-purple-600" : "text-gray-500 hover:text-purple-600"}`}
                                >
                                    <ThumbsUp className="w-4 h-4" /> {post.likes.length}
                                </button>
                                <button
                                    onClick={() => setShowNewPost(showNewPost === post._id ? null : post._id)}
                                    className="flex items-center gap-1 text-gray-500 hover:text-purple-600"
                                >
                                    <MessageCircle className="w-4 h-4" /> Reply
                                </button>
                            </div>
                        </>
                    )}

                    {showNewPost === post._id && (
                        <div className="mt-3 space-y-2 p-3 bg-gray-50 rounded-lg">
                            <input
                                value={replyForms[post._id]?.title || ""}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setReplyForms(prev => ({
                                        ...prev,
                                        [post._id]: {
                                            title: value,
                                            content: prev[post._id]?.content || ""
                                        }
                                    }));
                                }}
                                placeholder="Reply title"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                            <textarea
                                value={replyForms[post._id]?.content || ""}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setReplyForms(prev => ({
                                        ...prev,
                                        [post._id]: {
                                            title: prev[post._id]?.title || "",
                                            content: value
                                        }
                                    }));
                                }}
                                placeholder="Your reply..."
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                            <button
                                onClick={() => createPost(post._id)}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                            >
                                <Send className="w-4 h-4" /> Reply
                            </button>
                        </div>
                    )}

                    {post.replies && post.replies.map((reply) => (
                        <PostCard key={reply._id} post={reply} depth={depth + 1} />
                    ))}
                </div>
            </div>
        );
    };

    const filteredPosts = activeCategory === "all" ? posts : posts.filter((p) => p.category === activeCategory);

    if (!user) {
        return (
            <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden p-8">
                <p className="text-center text-gray-600">Please log in to view the forum</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-500 p-6 text-white">
                <button
                    onClick={() => onNavigate("home")}
                    className="mb-4 flex items-center text-white/90 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back to Home
                </button>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Community Forum</h2>
                            <p className="text-purple-100 text-sm">Share & learn together</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowNewPost(showNewPost === "new" ? null : "new")}
                        className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* New Post Form */}
            {showNewPost === "new" && (
                <div className="p-4 border-2 border-purple-200 bg-purple-50 m-4 rounded-lg">
                    <input
                        value={newPostTitle}
                        onChange={(e) => setNewPostTitle(e.target.value)}
                        placeholder="Post title"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                    />
                    <textarea
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        placeholder="What's on your mind?"
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                    />
                    <select
                        value={newPostCategory}
                        onChange={(e) => setNewPostCategory(e.target.value as "recipe" | "health" | "tips" | "question")}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                    >
                        <option value="recipe">Recipe</option>
                        <option value="health">Health</option>
                        <option value="tips">Tips</option>
                        <option value="question">Question</option>
                    </select>
                    <button
                        onClick={() => createPost()}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                    >
                        <Send className="w-4 h-4" /> Post
                    </button>
                </div>
            )}

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 p-4">
                {(["all", "recipe", "health", "tips", "question"] as const).map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${activeCategory === cat
                                ? "bg-purple-600 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                    >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                ))}
            </div>

            {/* Posts */}
            <div className="p-6 max-h-[600px] overflow-y-auto">
                {loading ? (
                    <p className="text-center text-gray-500">Loading posts...</p>
                ) : filteredPosts.length === 0 ? (
                    <p className="text-center text-gray-500">No posts yet. Be the first to post!</p>
                ) : (
                    filteredPosts.map((post) => <PostCard key={post._id} post={post} />)
                )}
            </div>
        </div>
    );
}