import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Upload, X, Music, Headphones, Heart, Star, Settings } from 'lucide-react';
import RecentlyPlayed from './profile/RecentlyPlayed';
import TopArtists from './profile/TopArtists';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  bio: string | null;
  preferences: any;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FormErrors {
  name?: string;
  avatar?: string;
  bio?: string;
}

interface Stats {
  playlists: number;
  followers: number;
  following: number;
  favoriteTracks: number;
}

interface MusicData {
  stats: Stats;
  recentlyPlayed: any[];
  topArtists: any[];
}

export default function UserProfile() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    avatar: '',
    bio: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [musicData, setMusicData] = useState<MusicData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile();
      fetchMusicData();
    }
  }, [session]);

  const fetchMusicData = async () => {
    try {
      const response = await fetch('/api/profile/stats');
      if (!response.ok) throw new Error('Failed to fetch music data');
      const data = await response.json();
      setMusicData(data);
    } catch (err) {
      console.error('Error fetching music data:', err);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (formData.name && formData.name.length > 50) {
      newErrors.name = 'Name must be less than 50 characters';
    }

    if (formData.avatar) {
      try {
        new URL(formData.avatar);
      } catch {
        newErrors.avatar = 'Please enter a valid URL';
      }
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      setProfile(data);
      setFormData({
        name: data.name || '',
        avatar: data.avatar || '',
        bio: data.bio || '',
      });
      setAvatarPreview(data.avatar);
    } catch (err) {
      setError('Failed to load profile');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update profile');
      
      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUrlChange = (url: string) => {
    setFormData({ ...formData, avatar: url });
    setAvatarPreview(url);
    setIsAvatarLoading(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, avatar: 'Please upload an image file' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, avatar: 'Image must be less than 5MB' });
      return;
    }

    setIsAvatarLoading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setFormData(prev => ({ ...prev, avatar: data.url }));
      setAvatarPreview(data.url);
    } catch (err) {
      setErrors({ ...errors, avatar: 'Failed to upload image' });
    } finally {
      setIsAvatarLoading(false);
      setUploadProgress(0);
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Profile Header */}
        <div className="relative h-48 bg-gradient-to-r from-purple-600 to-blue-500">
          <div className="absolute -bottom-16 left-8">
            <div className="relative w-32 h-32 rounded-full border-4 border-gray-900 overflow-hidden bg-gray-800">
              {profile.avatar ? (
                <Image
                  src={profile.avatar}
                  alt={profile.name || 'User avatar'}
                  fill
                  className="object-cover"
                  onLoadingComplete={() => setIsAvatarLoading(false)}
                  onError={() => {
                    setIsAvatarLoading(false);
                    setError('Failed to load avatar');
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <span className="text-4xl text-gray-500">
                    {profile.name?.[0] || profile.email[0]}
                  </span>
                </div>
              )}
              {isAvatarLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="pt-20 px-8 pb-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-3 rounded-lg mb-4">
              {success}
            </div>
          )}

          {!isEditing ? (
            <div>
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {profile.name || 'No name set'}
                  </h2>
                  <p className="text-gray-400">{profile.email}</p>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Edit Profile
                </button>
              </div>

              {profile.bio && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-2">About</h3>
                  <p className="text-gray-300">{profile.bio}</p>
                </div>
              )}

              {/* Stats Grid */}
              {musicData && (
                <div className="grid grid-cols-4 gap-4 mb-8">
                  <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                    <Music className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{musicData.stats.playlists}</div>
                    <div className="text-sm text-gray-400">Playlists</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                    <Headphones className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{musicData.stats.followers}</div>
                    <div className="text-sm text-gray-400">Followers</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                    <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{musicData.stats.following}</div>
                    <div className="text-sm text-gray-400">Following</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                    <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{musicData.stats.favoriteTracks}</div>
                    <div className="text-sm text-gray-400">Favorites</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg bg-gray-800 border ${
                    errors.name ? 'border-red-500' : 'border-gray-700'
                  } text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  maxLength={50}
                />
                <div className="flex justify-between mt-1">
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                  <p className="text-sm text-gray-400">
                    {formData.name.length}/50 characters
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Avatar</label>
                <div className="flex items-center space-x-4">
                  <div className="relative w-20 h-20">
                    {avatarPreview ? (
                      <Image
                        src={avatarPreview}
                        alt="Avatar preview"
                        fill
                        className="rounded-lg object-cover"
                        onLoadingComplete={() => setIsAvatarLoading(false)}
                        onError={() => {
                          setIsAvatarLoading(false);
                          setErrors({ ...errors, avatar: 'Invalid image URL' });
                        }}
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-800 rounded-lg flex items-center justify-center">
                        <span className="text-xl text-gray-500">
                          {formData.name?.[0] || '?'}
                        </span>
                      </div>
                    )}
                    {isAvatarLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 rounded-lg">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="url"
                      value={formData.avatar}
                      onChange={(e) => handleAvatarUrlChange(e.target.value)}
                      placeholder="Enter image URL"
                      className={`w-full px-4 py-2 rounded-lg bg-gray-800 border ${
                        errors.avatar ? 'border-red-500' : 'border-gray-700'
                      } text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    <div className="mt-2 flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-700 rounded-lg text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        Upload
                      </button>
                      {formData.avatar && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, avatar: '' });
                            setAvatarPreview(null);
                          }}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-700 rounded-lg text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Remove
                        </button>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    {errors.avatar && (
                      <p className="mt-1 text-sm text-red-500">{errors.avatar}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className={`w-full px-4 py-2 rounded-lg bg-gray-800 border ${
                    errors.bio ? 'border-red-500' : 'border-gray-700'
                  } text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  maxLength={500}
                />
                <div className="flex justify-between mt-1">
                  {errors.bio && (
                    <p className="text-sm text-red-500">{errors.bio}</p>
                  )}
                  <p className="text-sm text-gray-400">
                    {formData.bio.length}/500 characters
                  </p>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    'Save Changes'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: profile.name || '',
                      avatar: profile.avatar || '',
                      bio: profile.bio || '',
                    });
                    setAvatarPreview(profile.avatar);
                    setErrors({});
                  }}
                  className="px-4 py-2 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Music Activity Section */}
      {musicData && (
        <div className="space-y-6">
          <RecentlyPlayed tracks={musicData.recentlyPlayed} />
          <TopArtists artists={musicData.topArtists} />
        </div>
      )}
    </div>
  );
} 