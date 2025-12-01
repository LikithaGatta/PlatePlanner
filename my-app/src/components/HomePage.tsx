import { Home, Calendar, BookOpen, User, Plus, MessageSquare } from 'lucide-react';
import { Logo } from './Logo';
import { useApp } from '../context/AppContext';

interface HomePageProps {
  onNavigate: (screen: any) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { user, mealPlans, recipes, recentActivity } = useApp();
  
  // Calculate this week's meal count
  const thisWeekMeals = mealPlans.reduce((count, plan) => {
    let meals = 0;
    if (plan.breakfast) meals++;
    if (plan.lunch) meals++;
    if (plan.dinner) meals++;
    if (plan.snacks) meals++;
    return count + meals;
  }, 0);

  // Count favorite/saved recipes
  const savedRecipes = recipes.filter(r => r.isFavorite).length;

  // Format time ago
  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    const days = Math.floor(hours / 24);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-500 p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <User className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-white">Hey, {user?.firstName || 'there'}! 👋</h3>
            <p className="text-purple-100 text-sm">Let's plan something delicious</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border-2 border-purple-100 bg-purple-50/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-purple-600" />
              <p className="text-xs text-purple-700">This Week</p>
            </div>
            <p className="text-purple-900">{thisWeekMeals} Meals</p>
          </div>
          <div className="p-4 border-2 border-blue-100 bg-blue-50/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <p className="text-xs text-blue-700">Recipes</p>
            </div>
            <p className="text-blue-900">{recipes.length} Total</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <p className="text-gray-700">Quick Actions</p>
          
          <button
            onClick={() => onNavigate('plate-planner')}
            className="w-full h-14 rounded-xl border-2 border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-between px-6 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Plan New Meals
            </span>
            <span className="text-2xl">🍽️</span>
          </button>
          
          <button
            onClick={() => onNavigate('track-meals')}
            className="w-full h-14 rounded-xl border-2 border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-between px-6 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Track Today's Meals
            </span>
            <span className="text-2xl">📅</span>
          </button>
          
          <button
            onClick={() => onNavigate('recipe')}
            className="w-full h-14 rounded-xl border-2 border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-between px-6 transition-colors"
          >
            <span className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Browse Recipes
            </span>
            <span className="text-2xl">📖</span>
          </button>
          
          <button
            onClick={() => onNavigate('weekly-summary')}
            className="w-full h-14 rounded-xl border-2 border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-between px-6 transition-colors"
          >
            <span className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Weekly Summary
            </span>
            <span className="text-2xl">📊</span>
          </button>
          
          <button
            onClick={() => onNavigate('community')}
            className="w-full h-14 rounded-xl border-2 border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-between px-6 transition-colors"
          >
            <span className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Community Forum
            </span>
            <span className="text-2xl">💬</span>
          </button>
        </div>

        {/* Recent Activity */}
        <div className="space-y-3">
          <p className="text-gray-700">Recent Activity</p>
          {recentActivity.slice(0, 3).map((activity) => (
            <div key={activity.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                  <Logo size="sm" />
                </div>
                <div>
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="border-t border-gray-200 bg-white px-6 py-4">
        <div className="flex justify-around">
          <button 
            className="flex flex-col items-center gap-1 text-purple-600"
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