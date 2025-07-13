import React, { useState, useContext } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { AuthContext } from '../context/AuthContext';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    gemini_api_key: '',
    openai_api_key: '',
    anthropic_api_key: '',
    openrouter_api_key: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/login' : '/api/register';
      const payload = isLogin ?
        { email: formData.email, password: formData.password } :
        {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          api_keys: {
            gemini_api_key: formData.gemini_api_key || null,
            openai_api_key: formData.openai_api_key || null,
            anthropic_api_key: formData.anthropic_api_key || null,
            openrouter_api_key: formData.openrouter_api_key || null
          }
        };

      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.access_token, data.user);
      } else {
        setError(data.detail || 'Authentication failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isLogin ? 'Вход в систему' : 'Регистрация'}
        </h2>
        <p className="text-gray-600">
          {isLogin ? 'Войдите в свой аккаунт' : 'Создайте новый аккаунт'}
        </p>
      </div>

      {/* Google OAuth Button */}
      {GOOGLE_CLIENT_ID && (
        <div className="mb-6">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="outline"
            size="large"
            text={isLogin ? "signin_with" : "signup_with"}
            shape="rectangular"
            width="100%"
          />
          
          <div className="relative flex items-center justify-center my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative bg-white px-4 text-sm text-gray-500">
              или
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Имя
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Введите ваше имя"
              required={!isLogin}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Введите ваш email"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Пароль
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Введите ваш пароль"
            required
          />
        </div>

        {!isLogin && (
          <div className="space-y-3">
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                API ключи (необязательно)
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                Вы можете добавить свои API ключи для персонального использования
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Google Gemini API Key
              </label>
              <input
                type="password"
                name="gemini_api_key"
                value={formData.gemini_api_key}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="AIza..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                OpenAI API Key
              </label>
              <input
                type="password"
                name="openai_api_key"
                value={formData.openai_api_key}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="sk-proj-..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Anthropic API Key
              </label>
              <input
                type="password"
                name="anthropic_api_key"
                value={formData.anthropic_api_key}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="sk-ant-..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                OpenRouter API Key
              </label>
              <input
                type="password"
                name="openrouter_api_key"
                value={formData.openrouter_api_key}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="sk-or-..."
              />
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isLogin ? 'Вход...' : 'Регистрация...'}
            </div>
          ) : (
            isLogin ? 'Войти' : 'Зарегистрироваться'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
            setFormData({
              email: '',
              password: '',
              name: '',
              gemini_api_key: '',
              openai_api_key: '',
              anthropic_api_key: '',
              openrouter_api_key: ''
            });
          }}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
        >
          {isLogin ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
        </button>
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