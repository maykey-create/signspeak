import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Globe, Heart, Save, Loader2, Camera, Edit3 } from 'lucide-react';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ isOpen, onClose }) => {
  const { user, profile, updateProfile, signOut } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    preferred_language: profile?.preferred_language || 'en',
    accessibility_needs: profile?.accessibility_needs || '',
  });

  React.useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        preferred_language: profile.preferred_language || 'en',
        accessibility_needs: profile.accessibility_needs || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setLoading(true);
    const { error } = await updateProfile(formData);
    
    if (!error) {
      setEditing(false);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800">User Profile</h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Profile Header */}
          <div className="text-center mb-6">
            <div className="relative inline-block">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
              </div>
              <button className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-600 hover:text-blue-600 transition-colors">
                <Camera className="w-3 h-3" />
              </button>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mt-3">
              {profile?.full_name || 'User'}
            </h3>
            <p className="text-sm text-slate-600">{user.email}</p>
          </div>

          {/* Profile Form */}
          <div className="space-y-4">
            <div>
              <label className="flex items-center space-x-2 mb-2">
                <User className="w-4 h-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Full Name</span>
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              ) : (
                <div className="p-3 bg-slate-50 rounded-lg text-slate-800">
                  {profile?.full_name || 'Not set'}
                </div>
              )}
            </div>

            <div>
              <label className="flex items-center space-x-2 mb-2">
                <Mail className="w-4 h-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Email</span>
              </label>
              <div className="p-3 bg-slate-50 rounded-lg text-slate-600">
                {user.email}
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2 mb-2">
                <Globe className="w-4 h-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Preferred Language</span>
              </label>
              {editing ? (
                <select
                  value={formData.preferred_language}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferred_language: e.target.value }))}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="en">English (US)</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="it">Italian</option>
                  <option value="pt">Portuguese</option>
                  <option value="zh">Chinese</option>
                  <option value="ja">Japanese</option>
                  <option value="ko">Korean</option>
                  <option value="ar">Arabic</option>
                </select>
              ) : (
                <div className="p-3 bg-slate-50 rounded-lg text-slate-800">
                  {profile?.preferred_language === 'en' ? 'English (US)' : 
                   profile?.preferred_language === 'es' ? 'Spanish' :
                   profile?.preferred_language === 'fr' ? 'French' :
                   profile?.preferred_language === 'de' ? 'German' :
                   profile?.preferred_language === 'it' ? 'Italian' :
                   profile?.preferred_language === 'pt' ? 'Portuguese' :
                   profile?.preferred_language === 'zh' ? 'Chinese' :
                   profile?.preferred_language === 'ja' ? 'Japanese' :
                   profile?.preferred_language === 'ko' ? 'Korean' :
                   profile?.preferred_language === 'ar' ? 'Arabic' :
                   'English (US)'}
                </div>
              )}
            </div>

            <div>
              <label className="flex items-center space-x-2 mb-2">
                <Heart className="w-4 h-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Accessibility Needs</span>
              </label>
              {editing ? (
                <textarea
                  value={formData.accessibility_needs}
                  onChange={(e) => setFormData(prev => ({ ...prev, accessibility_needs: e.target.value }))}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Describe any specific accessibility needs or preferences..."
                />
              ) : (
                <div className="p-3 bg-slate-50 rounded-lg text-slate-800 min-h-[80px]">
                  {profile?.accessibility_needs || 'None specified'}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-6">
            {editing ? (
              <>
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex-1 px-4 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>

          {/* Account Info */}
          <div className="mt-6 pt-4 border-t border-slate-200">
            <div className="text-xs text-slate-500 space-y-1">
              <p>Account created: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}</p>
              <p>Last updated: {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'Never'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;