import React from 'react';

const user = {
  name: 'Test User',
  email: 'test@example.com',
  avatar: 'https://placehold.co/96x96',
  bio: 'Music lover. Playlist curator. Always discovering new sounds.',
  stats: {
    playlists: 8,
    likedSongs: 120,
    followers: 34,
    following: 12,
  },
};

export default function ProfilePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-6 mb-8">
        <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full shadow-lg" />
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">{user.name}</h1>
          <p className="text-spotify-gray-light mb-2">{user.email}</p>
          <p className="text-white text-base mb-2">{user.bio}</p>
        </div>
      </div>
      <div className="flex gap-8 mb-8">
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-white">{user.stats.playlists}</span>
          <span className="text-spotify-gray-light text-sm">Playlists</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-white">{user.stats.likedSongs}</span>
          <span className="text-spotify-gray-light text-sm">Liked Songs</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-white">{user.stats.followers}</span>
          <span className="text-spotify-gray-light text-sm">Followers</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-white">{user.stats.following}</span>
          <span className="text-spotify-gray-light text-sm">Following</span>
        </div>
      </div>
      <div className="bg-spotify-gray rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Edit Profile</h2>
        <form className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-spotify-gray-light mb-1">Name</label>
            <input type="text" className="w-full px-4 py-2 rounded-lg bg-spotify-dark border border-spotify-gray text-white focus:outline-none" defaultValue={user.name} />
          </div>
          <div>
            <label className="block text-sm text-spotify-gray-light mb-1">Bio</label>
            <textarea className="w-full px-4 py-2 rounded-lg bg-spotify-dark border border-spotify-gray text-white focus:outline-none" defaultValue={user.bio} rows={3} />
          </div>
          <button type="submit" className="bg-spotify-green text-black font-bold px-6 py-2 rounded-lg hover:bg-spotify-green/80 transition-colors w-fit">Save Changes</button>
        </form>
      </div>
    </div>
  );
} 