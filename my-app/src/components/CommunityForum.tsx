import { ArrowLeft, MessageSquare, Heart, MessageCircle, Send, Home, Calendar, BookOpen, User, Plus, ThumbsUp } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

interface CommunityForumProps {
  onNavigate: (screen: any) => void;
}

interface Post {
  id: number;
  author: string;
  avatar: string;
  title: string;
  content: string;
  category: 'recipe' | 'health' | 'tips' | 'question';
  likes: number;
  comments: number;
  timestamp: string;
  isLiked: boolean;
}

export function CommunityForum({ onNavigate }: CommunityForumProps) {
  const { user } = useApp();
  const [activeCategory, setActiveCategory] = useState<'all' | 'recipe' | 'health' | 'tips' | 'question'>('all');
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<'recipe' | 'health' | 'tips' | 'question'>('recipe');
  
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      author: 'Sarah M.',
      avatar: '👩‍🍳',
      title: 'My favorite protein smoothie recipe!',
      content: 'Just tried this amazing combo: banana, spinach, protein powder, and almond butter. Game changer for breakfast!',
      category: 'recipe',
      likes: 24,
      comments: 8,
      timestamp: '2 hours ago',
      isLiked: false
    },
    {
      id: 2,
      author: 'Mike J.',
      avatar: '🏋️',
      title: 'Tips for staying consistent with meal prep',
      content: 'I prep all my meals on Sunday and it has completely changed my week. Here are my top 5 tips...',
      category: 'tips',
      likes: 42,
      comments: 15,
      timestamp: '5 hours ago',
      isLiked: false
    },
    {
      id: 3,
      author: 'Emma K.',
      avatar: '🌱',
      title: 'Best vegetables for weight loss?',
      content: 'Looking for recommendations on vegetables that are filling but low in calories. What works for you?',
      category: 'question',
      likes: 18,
      comments: 12,
      timestamp: '1 day ago',
      isLiked: false
    },
    {
      id: 4,
      author: 'David L.',
      avatar: '🥗',
      title: 'The importance of hydration',
      content: 'Reminder: Drinking enough water is crucial for your metabolism and overall health. Aim for 8 glasses a day!',
      category: 'health',
      likes: 56,
      comments: 6,
      timestamp: '1 day ago',
      isLiked: false
    },
    {
      id: 5,
      author: 'Lisa R.',
      avatar: '🍳',
      title: 'Quick 5-minute breakfast ideas',
      content: 'For those busy mornings: overnight oats, Greek yogurt parfait, or avocado toast. Share yours!',
      category: 'recipe',
      likes: 35,
      comments: 20,
      timestamp: '2 days ago',
      isLiked: false
    }
  ]);

  const handleLike = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked }
        : post
    ));
  };

  const handleCreatePost = () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast.error('Please fill in both title and content');
      return;
    }

    const newPost: Post = {
      id: posts.length + 1,
      author: user?.firstName ? `${user.firstName} ${user.lastName?.charAt(0)}.` : 'You',
      avatar: '👤',
      title: newPostTitle,
      content: newPostContent,
      category: newPostCategory,
      likes: 0,
      comments: 0,
      timestamp: 'Just now',
      isLiked: false
    };

    setPosts([newPost, ...posts]);
    setNewPostTitle('');
    setNewPostContent('');
    setShowNewPost(false);
    toast.success('Post created successfully!');
  };

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'recipe': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'health': return 'bg-green-100 text-green-700 border-green-200';
      case 'tips': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'question': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredPosts = activeCategory === 'all' 
    ? posts 
    : posts.filter(post => post.category === activeCategory);

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-500 p-6 text-white">
        <button 
          onClick={() => onNavigate('home')}
          className="mb-4 flex items-center text-white/90 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-white mb-1">Community Forum</h2>
              <p className="text-purple-100 text-sm">Share & learn together</p>
            </div>
          </div>
          <button 
            onClick={() => setShowNewPost(!showNewPost)}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
        {/* New Post Form */}
        {showNewPost && (
          <Card className="p-4 border-2 border-purple-200 bg-purple-50">
            <p className="text-gray-700 mb-4">Create New Post</p>
            <div className="space-y-3">
              <Input
                placeholder="Post title"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                className="h-10"
              />
              <Textarea
                placeholder="What's on your mind?"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={4}
              />
              <div className="flex gap-2">
                <select
                  value={newPostCategory}
                  onChange={(e) => setNewPostCategory(e.target.value as any)}
                  className="flex-1 h-10 rounded-lg border border-gray-300 px-3 text-sm"
                >
                  <option value="recipe">Recipe</option>
                  <option value="health">Health</option>
                  <option value="tips">Tips</option>
                  <option value="question">Question</option>
                </select>
                <Button
                  onClick={handleCreatePost}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Post
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
              activeCategory === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Posts
          </button>
          <button
            onClick={() => setActiveCategory('recipe')}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
              activeCategory === 'recipe'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Recipes
          </button>
          <button
            onClick={() => setActiveCategory('health')}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
              activeCategory === 'health'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Health
          </button>
          <button
            onClick={() => setActiveCategory('tips')}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
              activeCategory === 'tips'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tips
          </button>
          <button
            onClick={() => setActiveCategory('question')}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
              activeCategory === 'question'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Questions
          </button>
        </div>

        {/* Posts */}
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="p-4 border-2 border-gray-200 hover:border-purple-200 transition-colors">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center text-xl">
                  {post.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm text-gray-900">{post.author}</p>
                    <span className="text-xs text-gray-400">• {post.timestamp}</span>
                  </div>
                  <div className={`inline-block px-2 py-1 rounded text-xs border ${getCategoryColor(post.category)}`}>
                    {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-gray-900 mb-2">{post.title}</p>
                <p className="text-sm text-gray-600">{post.content}</p>
              </div>

              <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                <button 
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-1 text-sm transition-colors ${
                    post.isLiked ? 'text-purple-600' : 'text-gray-500 hover:text-purple-600'
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                  {post.likes}
                </button>
                <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-purple-600 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  {post.comments}
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="border-t border-gray-200 bg-white px-6 py-4">
        <div className="flex justify-around">
          <button 
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600"
            onClick={() => onNavigate('home')}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </button>
          <button 
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600"
            onClick={() => onNavigate('track-meals')}
          >
            <Calendar className="w-6 h-6" />
            <span className="text-xs">Track</span>
          </button>
          <button 
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600"
            onClick={() => onNavigate('recipe')}
          >
            <BookOpen className="w-6 h-6" />
            <span className="text-xs">Recipes</span>
          </button>
          <button 
            className="flex flex-col items-center gap-1 text-purple-600"
            onClick={() => onNavigate('community')}
          >
            <MessageSquare className="w-6 h-6" />
            <span className="text-xs">Community</span>
          </button>
          <button 
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600"
            onClick={() => onNavigate('profile')}
          >
            <User className="w-6 h-6" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}