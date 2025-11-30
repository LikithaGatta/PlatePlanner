import { ArrowLeft } from 'lucide-react';
import { Logo } from './Logo';
import { useApp } from '../context/AppContext';
import { useState } from 'react';

interface LoginScreenProps {
  onNavigate: (screen: any) => void;
}

export function LoginScreen({ onNavigate }: LoginScreenProps) {
  const { login, setUser } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Please enter both email and password");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5050/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: username,
          password: password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Login failed");
        setLoading(false);
        return;
      }

      // Store token and userId for future authenticated requests
      
      localStorage.clear();

      
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);

      setUser(null); // clear previous user first

      // Update context with real user data
      login(username);
      setUser({
        username: username,
        email: username,
        firstName: username.includes('@') ? username.split('@')[0] : username,
        lastName: '',
        allergies: [],
        dietaryRestrictions: []
      });

      // Navigate to home/dashboard
      onNavigate('home');

    } catch (error) {
      console.error("Login error:", error);
      alert("Cannot connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-purple-100 rounded-2xl shadow-xl p-8 md:p-12">
      <button
        onClick={() => onNavigate('welcome')}
        className="mb-6 flex items-center text-purple-700 hover:text-purple-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back
      </button>

      <div className="flex flex-col items-center text-center space-y-6 mb-8">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
          <Logo size="md" />
        </div>

        <div className="space-y-2">
          <h2 className="text-gray-900 text-2xl font-semibold">Welcome Back</h2>
          <p className="text-purple-700">Sign in to continue planning</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm text-gray-700">
            Email or Username
          </label>
          <input
            id="email"
            type="text"
            placeholder="your@email.com"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full h-12 rounded-xl bg-white border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-12 rounded-xl bg-white border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <button className="text-sm text-purple-700 hover:text-purple-900">
          Forgot password?
        </button>
      </div>

      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full bg-purple-700 hover:bg-purple-800 text-white py-6 rounded-xl shadow-lg mt-6 transition-colors disabled:opacity-50"
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      <div className="text-center mt-6 text-sm text-gray-700">
        Don't have an account?{' '}
        <button
          onClick={() => onNavigate('create-account')}
          className="text-purple-700 hover:text-purple-900"
        >
          Sign up
        </button>
      </div>
    </div>
  );
}
