# Snotify Music Platform - Comprehensive Architecture Review

## Executive Summary

This document provides a detailed architectural review of the Snotify music streaming platform, analyzing the current state, design decisions, and providing a roadmap for future development without breaking existing functionality.

**Current Status**: Albums functionality working with corrected upload structure
**Last Stable Commit**: `333f5aa`
**Architecture**: Hybrid Vite React + Express.js Backend
**Database**: MySQL with Prisma ORM

---

## 1. Project Overview & Architecture Decisions

### 1.1 Core Architecture Choice
**Decision Made**: Hybrid architecture combining Vite React frontend with Express.js backend
- **Frontend**: Vite React app running on port 3000
- **Backend**: Express.js server running on port 4000
- **Database**: MySQL with Prisma ORM
- **File Uploads**: Local file system with structured paths

**Why This Matters**: This is NOT a traditional Next.js app despite having `src/app/api` folders. The API routes in `src/app/api` are non-functional remnants that should be cleaned up to avoid confusion.

### 1.2 Working Components vs. Legacy Code
**Currently Working**:
- Express server with album/playlist routes ✅
- React frontend with routing ✅ 
- MySQL database with Prisma ✅
- File upload system ✅

**Legacy/Broken Components**:
- Supabase integration (partially removed but still referenced) ❌
- Next.js style API routes in `src/app/api` ❌
- Mixed authentication systems ❌

---

## 2. Database Architecture

### 2.1 Prisma Schema Analysis

```prisma
// Core Models
- album: Music album storage
- song: Individual tracks linked to albums
- user: User accounts with multi-tenant support
- playlist: User-created playlists
- playlistsong: Many-to-many relationship between playlists and songs
- likedtrack: User's liked songs
- tenant: Multi-tenant organization support
- usertenant: User-tenant relationships
- refreshtoken: JWT refresh token management
- blogpost: Blog content (unused feature)
```

### 2.2 Data Relationships

```
Users (1) -> (Many) Playlists
Users (1) -> (Many) LikedTracks
Albums (1) -> (Many) Songs
Playlists (Many) <-> (Many) Songs (via PlaylistSong)
Users (Many) <-> (Many) Tenants (via UserTenant)
```

### 2.3 Key Design Decisions

1. **Multi-tenant Architecture**: Prepared for SaaS scaling
2. **Separate Song/Album Models**: Allows for compilation albums
3. **Dual Cover Storage**: Both URL and blob storage options
4. **Comprehensive User Model**: Includes avatar, bio, preferences

---

## 3. Backend Architecture Analysis

### 3.1 Express Server Structure (`src/lib/server.ts`)

```javascript
// Current Server Setup
Port: 4000
Routes:
- /api/albums (albumRoutes.ts)
- /api/playlists (playlistRoutes.ts)
- /uploads (static file serving)
- /api/auth/health (health check)

// Missing Routes
- /api/auth (authRoutes.ts exists but not mounted)
- /api/tracks
- /api/users
```

### 3.2 API Endpoints Analysis

#### Albums API (`src/lib/albumRoutes.ts`)
```
GET /api/albums - Fetch all albums ✅
POST /api/albums - Create album with image upload ✅
GET /api/albums/:id - Fetch single album ✅
POST /api/albums/:albumId/tracks - Upload track to album ✅
GET /api/albums/:albumId/tracks - Fetch album tracks ✅
POST /api/albums/:id/cover - Upload cover as blob ✅
GET /api/albums/:id/cover - Serve cover image ✅
```

#### Playlists API (`src/lib/playlistRoutes.ts`)
```
GET /api/playlists - Fetch user playlists ✅
POST /api/playlists - Create playlist ✅
GET /api/playlists/:id - Fetch playlist details ✅
DELETE /api/playlists/:id - Delete playlist ✅
POST /api/playlists/:id/songs - Add song to playlist ✅
DELETE /api/playlists/:id/songs/:songId - Remove song ✅
```

#### Authentication API (`src/lib/authApi.ts`)
```
✅ Functions exist but routes not mounted:
- registerUser()
- loginUser()
- verifyJWT()
- refreshToken()
- getUserProfile()
- updateUserProfile()
- forgotPassword()
- verifyEmail()
```

### 3.3 File Upload System

**Current Structure** (Fixed in milestone):
```
uploads/
  albums/
    [album_id]/
      cover.jpg
      track1.mp3
      track2.mp3
```

**Key Implementation**:
- Uses multer for file handling
- Stores relative paths in database
- Serves files as static content
- Supports both image and audio files

---

## 4. Frontend Architecture Analysis

### 4.1 React Router Structure (`src/App.tsx`)

```javascript
Routes:
/ -> Index (Albums view)
/albums -> Index 
/album/:id -> Album (deprecated route)
/albums/:id -> AlbumDetailsPage
/playlists -> Playlists
/playlist/:id -> Playlist
/blog -> Blog
/blog/:id -> BlogPost
/settings -> Settings
/reset-password -> ResetPassword
```

### 4.2 Context Providers

```javascript
// Provider Hierarchy (from outer to inner)
QueryClientProvider (TanStack Query)
MediaPlayerProvider (Custom audio player)
AuthProvider (Authentication state)
ThemeProvider (Theme management)
ToastProvider (Notifications)
TooltipProvider (UI tooltips)
SidebarProvider (Sidebar state)
```

### 4.3 Key Components Analysis

#### Media Player (`src/components/player/MediaPlayer.tsx`)
- **Status**: Core component for audio playback
- **Integration**: Connected to MediaPlayerContext
- **Features**: Play/pause, volume, seeking, queue management

#### Sidebar (`src/components/sidebar/Sidebar.tsx`)
- **Status**: Primary navigation component
- **Features**: Responsive design, route-based highlighting

#### Album Components
- **AlbumCard**: Display component for album listings
- **AlbumDetailsPage**: Full album view with track listing

### 4.4 State Management Strategy

```javascript
// Global State (React Context)
- AuthContext: User authentication
- MediaPlayerContext: Audio playback state
- ThemeContext: UI theming

// Server State (TanStack Query)
- Album data fetching
- Playlist management
- User profile data

// Local State (useState/useReducer)
- Component-specific UI state
- Form handling
- Modal states
```

---

## 5. Critical Issues & Technical Debt

### 5.1 Architectural Inconsistencies

1. **Mixed Paradigms**: 
   - Next.js style API routes that don't work
   - Vite + Express.js hybrid setup
   - Supabase remnants mixed with MySQL

2. **Authentication Confusion**:
   - AuthRoutes exist but not mounted
   - Multiple auth contexts
   - Incomplete JWT implementation

3. **Dead Code**:
   - Unused API route directories
   - Supabase client imports
   - Placeholder components

### 5.2 File Structure Issues

```
Problematic Areas:
src/app/api/* - Non-functional Next.js style routes
src/integrations/supabase/* - Legacy Supabase code
src/services/* - Incomplete service layer
Multiple auth implementations
```

### 5.3 Dependencies to Clean Up

```json
// package.json issues
"@supabase/supabase-js": "^2.49.4" // Should be removed
Mixed React Router + Next.js concepts
Legacy Lovable.ai imports
```

---

## 6. Recommended Safe Forward Path

### 6.1 Phase 1: Stabilization (No Breaking Changes)

1. **Clean Up Dead Code**
   ```bash
   # Safe to remove (verified non-functional):
   - src/app/api/* (Next.js style routes)
   - Supabase references in components
   - Unused service files
   ```

2. **Complete Authentication Integration**
   ```javascript
   // Add to src/lib/server.ts:
   const authRoutes = require('./authRoutes');
   app.use('/api/auth', authRoutes);
   ```

3. **Add Basic Security Middleware**
   ```javascript
   // Non-breaking additions:
   - CORS middleware
   - Rate limiting
   - Authentication middleware
   ```

### 6.2 Phase 2: Enhanced Features (Minimal Risk)

1. **Complete User Management**
   - Connect frontend auth components to backend API
   - Add user profile pages
   - Implement password reset flow

2. **Track Management Enhancement**
   - Add individual track endpoints
   - Implement like/unlike functionality
   - Add track search capabilities

3. **Enhanced File Management**
   - Add file type validation
   - Implement image resizing
   - Add file size limits

### 6.3 Phase 3: New Features (Controlled Risk)

1. **Search Functionality**
2. **Social Features**
3. **Admin Dashboard**
4. **Artist Management**
5. **Advanced Player Features**

---

## 7. Immediate Action Items (Safe to Implement)

### 7.1 Code Cleanup (Zero Risk)

1. **Remove Dead API Routes**
   ```bash
   rm -rf src/app/api
   ```

2. **Clean Package Dependencies**
   ```bash
   npm uninstall @supabase/supabase-js
   ```

3. **Remove Supabase Imports**
   ```javascript
   // Search and remove unused imports
   import { supabase } from "@/integrations/supabase/client";
   ```

### 7.2 Quick Wins (Low Risk)

1. **Mount Auth Routes**
   ```javascript
   // In src/lib/server.ts - uncomment:
   const authRoutes = require('./authRoutes');
   app.use('/api/auth', authRoutes);
   ```

2. **Add CORS Middleware**
   ```javascript
   const cors = require('cors');
   app.use(cors());
   ```

3. **Add Basic Validation**
   ```javascript
   // Add to existing routes
   if (!req.body.title) return res.status(400).json({error: 'Title required'});
   ```

### 7.3 Documentation Updates

1. **Update README.md** with current architecture
2. **Document API endpoints** in OpenAPI format
3. **Create deployment guide** for current setup

---

## 8. Conclusion & Recommendations

### 8.1 Current State Summary

The Snotify application is in a **hybrid architecture state** with:
- ✅ Working album and playlist management
- ✅ Functional file upload system  
- ✅ Stable React frontend with routing
- ✅ MySQL database with Prisma ORM
- ⚠️ Authentication system ready but not connected
- ❌ Legacy code creating confusion
- ❌ Incomplete social and advanced features

### 8.2 Strategic Recommendations

1. **Stabilize Before Extending**: Clean up legacy code before adding features
2. **Complete Auth Integration**: Connect existing auth functions to routes
3. **Maintain Hybrid Architecture**: Current setup works well for the use case
4. **Incremental Development**: Add features one at a time with testing
5. **Document Everything**: Maintain clear documentation as you build

### 8.3 Architecture Validation

The current **Vite + Express.js hybrid** approach is valid for this project because:
- Provides clear separation of concerns
- Allows independent scaling of frontend/backend
- Leverages React ecosystem while maintaining API flexibility
- Supports file uploads and streaming better than pure Next.js
- Enables future migration to microservices if needed

**This is NOT a broken architecture** - it's a deliberate choice that works well for a music streaming platform.

---

## 9. Next Steps Roadmap

### Week 1: Stabilization
- [ ] Remove dead code (src/app/api, Supabase)
- [ ] Mount authentication routes
- [ ] Add basic security middleware
- [ ] Update documentation

### Week 2: Auth Integration  
- [ ] Connect frontend auth to backend API
- [ ] Implement user profile pages
- [ ] Add protected route middleware
- [ ] Test authentication flow

### Week 3: Enhancement
- [ ] Add search functionality
- [ ] Implement user track liking
- [ ] Enhanced file validation
- [ ] Performance optimizations

### Month 2+: New Features
- [ ] Social features
- [ ] Admin dashboard
- [ ] Artist management
- [ ] Advanced player features

---

*This document serves as the definitive architectural reference for the Snotify project. Any modifications should be documented here to maintain architectural integrity.*

**Last Updated**: Current milestone - Albums functionality working
**Document Version**: 1.0
**Next Review**: After authentication integration 