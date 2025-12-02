import { ArrowLeft } from 'lucide-react';
import { Logo } from './Logo';
import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

interface EmailVerificationProps {
  onNavigate: (screen: any) => void;
  email?: string;
}

export function EmailVerification({ onNavigate, email: propEmail }: EmailVerificationProps) {
  const { setUser } = useApp();
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // Get email from props or localStorage
    const storedEmail = propEmail || localStorage.getItem('pendingEmail') || '';
    setEmail(storedEmail);

    // Auto-focus first input
    document.getElementById('code-0')?.focus();
  }, [propEmail]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [countdown]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedCode = value.slice(0, 6).split('');
      const newCode = [...verificationCode];
      pastedCode.forEach((char, i) => {
        if (index + i < 6) {
          newCode[index + i] = char;
        }
      });
      setVerificationCode(newCode);
      
      // Focus last filled input
      const lastIndex = Math.min(index + pastedCode.length - 1, 5);
      document.getElementById(`code-${lastIndex}`)?.focus();
      return;
    }

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus();
    }
  };

  const handleVerify = async () => {
    const code = verificationCode.join('');
    
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5050/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          verificationCode: code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid verification code');
        setLoading(false);
        return;
      }

      // Store authentication data
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.removeItem('pendingEmail');

      // Set user in context
      setUser({
        _id: data.userId,
        username: data.user.email,
        email: data.user.email,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        allergies: data.user.allergies || [],
        dietaryRestrictions: data.user.dietaryRestrictions || [],
        token: data.token,
      });

      alert('Email verified successfully!');
      onNavigate('onboarding');
    } catch (error) {
      console.error('Verification error:', error);
      setError('Cannot connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendDisabled(true);
    setCountdown(60);
    setError('');

    try {
      const response = await fetch('http://localhost:5050/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Verification code sent! Check your email.');
      } else {
        setError(data.error || 'Failed to resend code');
        setResendDisabled(false);
        setCountdown(0);
      }
    } catch (error) {
      console.error('Resend error:', error);
      setError('Cannot connect to server');
      setResendDisabled(false);
      setCountdown(0);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 md:p-12">
      <button
        onClick={() => onNavigate('create-account')}
        className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back
      </button>

      <div className="flex flex-col items-center text-center space-y-6 mb-8">
        <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center shadow-lg">
          <Logo size="md" />
        </div>

        <div className="space-y-2">
          <h2 className="text-gray-900 text-2xl font-semibold">Verify Your Email</h2>
          <p className="text-gray-500 text-sm">
            We sent a 6-digit code to
          </p>
          <p className="text-purple-600 font-medium">{email}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-center gap-2">
          {verificationCode.map((digit, index) => (
            <input
              key={index}
              id={`code-${index}`}
              type="text"
              maxLength={6}
              value={digit}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 focus:outline-none focus:ring-2 transition-colors ${
                error
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <button
          onClick={handleVerify}
          disabled={loading || verificationCode.join('').length !== 6}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white py-4 rounded-xl shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">Didn't receive the code?</p>
          <button
            onClick={handleResendCode}
            disabled={resendDisabled}
            className="text-purple-600 hover:text-purple-700 font-medium text-sm disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {resendDisabled
              ? `Resend code in ${countdown}s`
              : 'Resend verification code'}
          </button>
        </div>

        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Make sure to check your spam folder if you don't see the email
          </p>
        </div>
      </div>
    </div>
  );
}
