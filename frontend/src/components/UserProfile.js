import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const UserProfile = ({ onClose }) => {
  const { user, getAuthHeaders, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [apiKeys, setApiKeys] = useState({
    gemini_api_key: '',
    openai_api_key: '',
    anthropic_api_key: '',
    openrouter_api_key: ''
  });

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

  const handleApiKeyChange = (e) => {
    setApiKeys({
      ...apiKeys,
      [e.target.name]: e.target.value
    });
  };

  const updateApiKeys = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setError('');

    try {
      const response = await fetch(`${BACKEND_URL}/api/api-keys`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          api_keys: apiKeys
        })
      });

      if (response.ok) {
        await loadProfile(); // Reload profile to show updated keys
        setApiKeys({
          gemini_api_key: '',
          openai_api_key: '',
          anthropic_api_key: '',
          openrouter_api_key: ''
        });
        alert('API ключи успешно обновлены!');
      } else {
        const data = await response.json();
        setError(data.detail || 'Failed to update API keys');
      }
    } catch (err) {
      setError('Network error');
      console.error('API key update error:', err);
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
                    {profile.oauth_provider && (
                      <p className="text-sm text-blue-600">
                        Авторизован через {profile.oauth_provider}
                      </p>
                    )}
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
                        : 'Никогда'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* API Keys Status */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Статус API ключей</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(profile.api_keys_status || {}).map(([provider, status]) => (
                    <div key={provider} className="bg-white rounded-xl p-4 border">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-gray-900 capitalize">
                          {provider.replace('_api_key', '').replace('_', ' ')}
                        </h5>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          status.has_key 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {status.has_key ? 'Настроен' : 'Не настроен'}
                        </span>
                      </div>
                      {status.has_key && status.masked_key && (
                        <p className="text-sm text-gray-500 mt-1 font-mono">
                          {status.masked_key}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Update API Keys */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Обновить API ключи</h4>
                <form onSubmit={updateApiKeys} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Google Gemini API Key
                    </label>
                    <input
                      type="password"
                      name="gemini_api_key"
                      value={apiKeys.gemini_api_key}
                      onChange={handleApiKeyChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Введите новый ключ (оставьте пустым, чтобы не изменять)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      OpenAI API Key
                    </label>
                    <input
                      type="password"
                      name="openai_api_key"
                      value={apiKeys.openai_api_key}
                      onChange={handleApiKeyChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Введите новый ключ (оставьте пустым, чтобы не изменять)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Anthropic API Key
                    </label>
                    <input
                      type="password"
                      name="anthropic_api_key"
                      value={apiKeys.anthropic_api_key}
                      onChange={handleApiKeyChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Введите новый ключ (оставьте пустым, чтобы не изменять)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      OpenRouter API Key
                    </label>
                    <input
                      type="password"
                      name="openrouter_api_key"
                      value={apiKeys.openrouter_api_key}
                      onChange={handleApiKeyChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Введите новый ключ (оставьте пустым, чтобы не изменять)"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? 'Обновление...' : 'Обновить API ключи'}
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
                  className="w-full bg-red-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors"
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