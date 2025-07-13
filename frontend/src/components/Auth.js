import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  const { login } = useContext(AuthContext);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleQuickLogin = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Введите корректный email');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Create mock user data
      const mockUserInfo = {
        sub: `demo_${Date.now()}`,
        email: formData.email.trim(),
        name: formData.name.trim(),
        picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=4F46E5&color=fff`
      };
      
      // Send to our backend for processing
      const response = await fetch(`${BACKEND_URL}/api/auth/demo/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_info: mockUserInfo
        }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.access_token, data.user);
      } else {
        setError(data.detail || 'Ошибка входа');
      }
    } catch (err) {
      setError('Ошибка сети. Попробуйте еще раз.');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
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
          Введите ваши данные для начала работы
        </p>
      </div>

      <form onSubmit={handleQuickLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ваше имя
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Введите ваше имя"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Введите ваш email"
            required
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-red-400 to-pink-400 rounded-full mr-3">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-red-800 text-sm">Ошибка</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
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
              Вход...
            </div>
          ) : (
            'Войти в приложение'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Это демо-версия. Ваши данные используются только для работы с приложением.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <AuthForm />
      </div>
    </div>
  );
};

export default Auth;