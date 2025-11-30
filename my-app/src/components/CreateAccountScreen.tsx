import { ArrowLeft } from 'lucide-react';
import { Logo } from './Logo';
import { useState } from 'react';
import { useApp } from '../context/AppContext';

interface CreateAccountScreenProps {
  onNavigate: (screen: any) => void;
}

export function CreateAccountScreen({ onNavigate }: CreateAccountScreenProps) {
  const { setUser } = useApp();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: ''
  });

const handleCreateAccount = async () => {
  if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
    alert("Please fill all fields");
    return;
  }

  try {
    const response = await fetch("http://localhost:5050/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Account creation failed");
    }

    localStorage.clear();

    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.userId);

    setUser({
      username: formData.username,
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      allergies: [],
      dietaryRestrictions: []
    });

    onNavigate("onboarding");

  } catch (error: any) {
    console.error(error);
    alert(error.message || "Account creation failed");
  }
};


  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 md:p-12">
      <button 
        onClick={() => onNavigate('welcome')}
        className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back
      </button>
      
      <div className="flex flex-col items-center text-center space-y-6 mb-8">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
          <Logo size="md" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-gray-900">Create Account</h2>
          <p className="text-gray-500">Join Plate Planner today</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="firstName" className="block text-sm text-gray-700">First Name</label>
            <input 
              id="firstName"
              type="text" 
              placeholder="John"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              className="w-full h-12 rounded-xl border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="lastName" className="block text-sm text-gray-700">Last Name</label>
            <input 
              id="lastName"
              type="text" 
              placeholder="Doe"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              className="w-full h-12 rounded-xl border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm text-gray-700">Email</label>
          <input 
            id="email"
            type="email" 
            placeholder="your@email.com"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full h-12 rounded-xl border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="username" className="block text-sm text-gray-700">Username</label>
          <input 
            id="username"
            type="text" 
            placeholder="johndoe"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            className="w-full h-12 rounded-xl border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm text-gray-700">Password</label>
          <input 
            id="password"
            type="password" 
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full h-12 rounded-xl border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <button
        onClick={handleCreateAccount}
        className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white py-6 rounded-xl shadow-lg mt-6 transition-colors"
      >
        Create Account
      </button>
      
      <div className="text-center mt-6 text-sm text-gray-600">
        Already have an account?{' '}
        <button 
          onClick={() => onNavigate('login')}
          className="text-purple-600 hover:text-purple-700"
        >
          Sign in
        </button>
      </div>
    </div>
  );
}