import React, { useState, useContext } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { AuthContext } from '../context/AuthContext';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useContext(AuthContext);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setError('');

      // Decode the JWT token to get user info
      const userInfo = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
      
      // Send to our backend for processing
      const response = await fetch(`${BACKEND_URL}/api/auth/google/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
          user_info: userInfo
        }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.access_token, data.user);
      } else {
        setError(data.detail || 'Google authentication failed');
      }
    } catch (err) {
      setError('Google authentication failed. Please try again.');
      console.error('Google auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google authentication failed. Please try again.');
  };

  const AuthForm = () => (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Добро пожаловать!
        </h2>
        <p className="text-gray-600 text-lg">
          ИИ-помощник для анализа немецких писем
        </p>
        <p className="text-sm text-gray-500 mt-3">
          Войдите через Google для начала работы
        </p>
      </div>

      {/* Google OAuth Button */}
      {GOOGLE_CLIENT_ID ? (
        <div className="mb-6">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="outline"
            size="large"
            text="signin_with"
            shape="rectangular"
            width="100%"
            disabled={loading}
          />
        </div>
      ) : (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600 text-sm text-center">
            Google OAuth не настроен. Обратитесь к администратору.
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-red-400 to-pink-400 rounded-full mr-3">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-red-800 text-sm">Ошибка входа</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="mt-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <p className="text-gray-600">Выполняется вход...</p>
        </div>
      )}

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Нажимая "Войти через Google", вы соглашаетесь на обработку ваших данных
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {GOOGLE_CLIENT_ID ? (
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <AuthForm />
          </GoogleOAuthProvider>
        ) : (
          <AuthForm />
        )}
      </div>
    </div>
  );
};

export default Auth;