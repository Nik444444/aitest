import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const UserProfile = ({ onClose }) => {
  const { user, getAuthHeaders, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/profile`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else {
        setError('Failed to load profile');
      }
    } catch (err) {
      setError('Network error');
      console.error('Profile load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGeminiApiKeySubmit = async (e) => {
    e.preventDefault();
    if (!geminiApiKey.trim()) {
      setError('Пожалуйста, введите Gemini API ключ');
      return;
    }

    setIsUpdating(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${BACKEND_URL}/api/gemini-api-key`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          gemini_api_key: geminiApiKey.trim()
        })
      });

      if (response.ok) {
        await loadProfile(); // Reload profile to show updated status
        setGeminiApiKey('');
        setSuccess('Gemini API ключ успешно сохранен!');
        
        // Update user context
        user.has_gemini_api_key = true;
      } else {
        const data = await response.json();
        setError(data.detail || 'Failed to save Gemini API key');
      }
    } catch (err) {
      setError('Network error');
      console.error('Gemini API key save error:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка профиля...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Профиль пользователя</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {profile && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
                <div className="flex items-center space-x-4">
                  {profile.picture ? (
                    <img
                      src={profile.picture}
                      alt="Profile"
                      className="w-16 h-16 rounded-full"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xl">
                        {profile.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{profile.name}</h3>
                    <p className="text-gray-600">{profile.email}</p>
                    <p className="text-sm text-blue-600">
                      Авторизован через {profile.oauth_provider}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Дата регистрации</p>
                    <p className="font-medium">
                      {new Date(profile.created_at).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Последний вход</p>
                    <p className="font-medium">
                      {profile.last_login
                        ? new Date(profile.last_login).toLocaleDateString('ru-RU')
                        : 'Сейчас'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Gemini API Key Status */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Статус Gemini API</h4>
                <div className="bg-white rounded-xl p-4 border">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-gray-900">
                      Google Gemini API
                    </h5>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      profile.has_gemini_api_key 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {profile.has_gemini_api_key ? '✅ Настроен' : '❌ Не настроен'}
                    </span>
                  </div>
                  {profile.has_gemini_api_key ? (
                    <p className="text-sm text-gray-500 mt-2">
                      API ключ сохранен и готов к использованию
                    </p>
                  ) : (
                    <p className="text-sm text-red-600 mt-2">
                      Добавьте ваш Gemini API ключ для использования приложения
                    </p>
                  )}
                </div>
              </div>

              {/* Add/Update Gemini API Key */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4">
                  {profile.has_gemini_api_key ? 'Обновить' : 'Добавить'} Gemini API ключ
                </h4>
                
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <h5 className="font-medium text-blue-900 mb-2">💡 Как получить Gemini API ключ:</h5>
                  <ol className="text-sm text-blue-800 space-y-1">
                    <li>1. Перейдите на <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a></li>
                    <li>2. Создайте новый API ключ</li>
                    <li>3. Скопируйте ключ и вставьте его ниже</li>
                  </ol>
                </div>

                <form onSubmit={handleGeminiApiKeySubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gemini API ключ
                    </label>
                    <input
                      type="password"
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="AIzaSy... (вставьте ваш Gemini API ключ)"
                      required
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-green-600 text-sm">{success}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? 'Сохранение...' : 'Сохранить API ключ'}
                  </button>
                </form>
              </div>

              {/* Logout Button */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="w-full bg-red-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                  Выйти из аккаунта
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;