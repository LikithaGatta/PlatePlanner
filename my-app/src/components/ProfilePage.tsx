import { ArrowLeft, User, Mail, Ruler, Weight, Target, LogOut, Edit2, Home, Calendar, BookOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useState } from 'react';

interface ProfilePageProps {
  onNavigate: (screen: any) => void;
}

export function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { user, setUser, logout } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    height: user?.height?.toString() || '',
    weight: user?.weight?.toString() || ''
  });

  const handleSave = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem("token");
      if (token) {
        const response = await fetch("http://localhost:5050/api/auth/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            firstName: editData.firstName,
            lastName: editData.lastName,
            email: editData.email,
            height: editData.height ? parseFloat(editData.height) : undefined,
            weight: editData.weight ? parseFloat(editData.weight) : undefined
          })
        });

        const data = await response.json();
        
        if (response.ok && data.user) {
          // Update localStorage
          localStorage.setItem("user", JSON.stringify(data.user));
          
          // Update context
          setUser(data.user);
          setIsEditing(false);
          alert("Profile updated successfully!");
          return;
        } else {
          alert(data.error || "Failed to update profile");
        }
      }
    } catch (error) {
      console.error("Profile update error:", error);
      alert("Cannot connect to server.");
    }
  };

  const handleLogout = () => {
    logout();
    onNavigate('welcome');
  };

  const goalTypeLabels = {
    'lose': 'Lose Weight',
    'gain': 'Gain Weight',
    'maintain': 'Maintain Weight'
  };

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
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <User className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-white">{user?.firstName} {user?.lastName}</h2>
            <p className="text-purple-100 text-sm">@{user?.username}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
        {/* Edit Toggle */}
        <div className="flex items-center justify-between">
          <h3 className="text-gray-900">Personal Information</h3>
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            {isEditing ? 'Save' : 'Edit'}
          </button>
        </div>

        {/* Profile Information */}
        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="block text-sm text-gray-700">First Name</label>
                <input
                  id="firstName"
                  value={editData.firstName}
                  onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                  className="w-full h-10 rounded-lg border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="block text-sm text-gray-700">Last Name</label>
                <input
                  id="lastName"
                  value={editData.lastName}
                  onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                  className="w-full h-10 rounded-lg border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm text-gray-700">Email</label>
              <input
                id="email"
                type="email"
                value={editData.email}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                className="w-full h-10 rounded-lg border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="height" className="block text-sm text-gray-700">Height (cm)</label>
                <input
                  id="height"
                  type="number"
                  value={editData.height}
                  onChange={(e) => setEditData({ ...editData, height: e.target.value })}
                  className="w-full h-10 rounded-lg border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="weight" className="block text-sm text-gray-700">Weight (kg)</label>
                <input
                  id="weight"
                  type="number"
                  value={editData.weight}
                  onChange={(e) => setEditData({ ...editData, weight: e.target.value })}
                  className="w-full h-10 rounded-lg border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-4 border-2 border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="text-sm text-gray-900">{user?.firstName} {user?.lastName}</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-2 border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm text-gray-900">{user?.email}</p>
                </div>
              </div>
            </div>

            {user?.height && (
              <div className="p-4 border-2 border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Ruler className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Height</p>
                    <p className="text-sm text-gray-900">{user.height} cm</p>
                  </div>
                </div>
              </div>
            )}

            {user?.weight && (
              <div className="p-4 border-2 border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Weight className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Weight</p>
                    <p className="text-sm text-gray-900">{user.weight} kg</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Goals & Preferences */}
        {user?.goalType && (
          <div className="space-y-3">
            <h3 className="text-gray-900">Goals & Preferences</h3>
            
            <div className="p-4 border-2 border-purple-200 bg-purple-50/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-purple-700">Goal</p>
                  <p className="text-sm text-purple-900">{goalTypeLabels[user.goalType]}</p>
                </div>
              </div>
            </div>

            {user?.calorieGoal && (
              <div className="p-4 border-2 border-purple-200 bg-purple-50/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-purple-700">Daily Calorie Goal</p>
                    <p className="text-purple-900">{user.calorieGoal} calories</p>
                  </div>
                </div>
              </div>
            )}

            {user?.allergies && user.allergies.length > 0 && (
              <div className="p-4 border-2 border-gray-200 rounded-lg">
                <p className="text-xs text-gray-500 mb-2">Dietary Restrictions</p>
                <div className="flex flex-wrap gap-2">
                  {user.allergies.map((allergy, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                    >
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full h-12 rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
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
