# Snotify Architecture & Product Overview

---

## Table of Contents
- [1. Product Vision](#1-product-vision)
- [2. High-Level Architecture](#2-high-level-architecture)
  - [2.1. System Overview (Mermaid Diagram)](#21-system-overview-mermaid-diagram)
  - [2.2. App Flow (Mermaid Diagram)](#22-app-flow-mermaid-diagram)
  - [2.3. Key Technologies](#23-key-technologies)
- [3. Backend Architecture](#3-backend-architecture)
  - [3.1. Database Schema (Mermaid ER Diagram)](#31-database-schema-mermaid-er-diagram)
  - [3.2. API Routing & Logic](#32-api-routing--logic)
  - [3.3. File Storage](#33-file-storage)
  - [3.4. Authentication Flow (Mermaid Diagram)](#34-authentication-flow-mermaid-diagram)
- [4. Frontend Architecture](#4-frontend-architecture)
  - [4.1. UI Structure](#41-ui-structure)
  - [4.2. State Management](#42-state-management)
  - [4.3. Responsive Design](#43-responsive-design)
- [5. Developer Experience](#5-developer-experience)
- [6. Product Management View](#6-product-management-view)
- [7. Security & Compliance](#7-security--compliance)
- [8. Extensibility & Future Roadmap](#8-extensibility--future-roadmap)
- [9. Directory Structure](#9-directory-structure)

---

## 1. Product Vision

Snotify is a modern, maintainable music storage and player application with playlists, albums, and a blog. It features a responsive, user-friendly UI, secure JWT authentication, and stores all media as files (not blobs) for performance and simplicity. The app is designed for easy extensibility and robust user experience.

---

## 2. High-Level Architecture

### 2.1. System Overview (Mermaid Diagram)

```mermaid
graph TD
  subgraph Frontend ["React App"]
    A1[AuthContext]
    A2[Album Grid]
    A3[Album Details]
    A4[Track Upload Dialog]
    A5[Player]
    A6[Sidebar/Topbar]
    A7[Blog/Playlists]
  end
  
  subgraph Backend ["Node.js/Express"]
    B1[Auth Routes]
    B2[Album Routes]
    B3[Track Routes]
    B4[Playlist Routes]
    B5[Blog Routes]
    B6[Static File Server]
    B7[Prisma ORM]
  end
  
  subgraph Database ["MySQL"]
    D1[User]
    D2[Album]
    D3[Song]
    D4[Playlist]
    D5[BlogPost]
    D6[PlaylistSong]
  end
  
  subgraph Storage ["Filesystem"]
    S1["uploads/albums/&lt;album_id&gt;/tracks/"]
    S2["uploads/&lt;album_name&gt;/cover.jpg"]
  end
  
  A1 -->|JWT| B1
  A2 -->|REST| B2
  A3 -->|REST| B2
  A4 -->|"REST (multipart/form-data)"| B3
  A5 -->|Audio URLs| S1
  A6 -->|Navigation| A2
  A7 -->|REST| B5
  
  B1 -->|Prisma| B7
  B2 -->|Prisma| B7
  B3 -->|Prisma| B7
  B4 -->|Prisma| B7
  B5 -->|Prisma| B7
  
  B7 -->|SQL| D1
  B7 -->|SQL| D2
  B7 -->|SQL| D3
  B7 -->|SQL| D4
  B7 -->|SQL| D5
  B7 -->|SQL| D6
  
  B2 -->|File Paths| S2
  B3 -->|File Paths| S1
  B6 -->|Serve Files| S1
  B6 -->|Serve Files| S2
```

### 2.2. App Flow (Mermaid Diagram)

```mermaid
sequenceDiagram
  participant User
  participant Frontend
  participant Backend
  participant DB
  participant FS as Filesystem

  User->>Frontend: Register/Login
  Frontend->>Backend: POST /api/auth/register or /login
  Backend->>DB: Create/Verify User
  Backend-->>Frontend: JWT Token
  Frontend->>Backend: Authenticated API Requests (JWT)
  Backend->>DB: CRUD (Albums, Tracks, Playlists, Blog)
  Backend->>FS: Store/Fetch Files
  Backend-->>Frontend: Data/URLs
  Frontend-->>User: UI/Playback
```

### 2.3. Key Technologies

- **Frontend:** React, TypeScript, shadcn/ui, Heroicons/lucide-react, React Context, React Router
- **Backend:** Node.js, Express, Prisma ORM, JWT, Multer, music-metadata
- **Database:** MySQL (Prisma-managed)
- **Storage:** Filesystem (uploads directory, paths in DB)
- **Styling:** Tailwind CSS

---

## 3. Backend Architecture

### 3.1. Database Schema (Mermaid ER Diagram)

```mermaid
erDiagram
  USER ||--o{ PLAYLIST : owns
  USER ||--o{ BLOGPOST : writes
  ALBUM ||--o{ SONG : contains
  PLAYLIST ||--o{ PLAYLISTSONG : has
  SONG ||--o{ PLAYLISTSONG : in
```

#### Prisma Schema (Summary)
- **User:** id, email, password, createdAt, updatedAt
- **Album:** id, title, artist, image_url, year, track_count, duration, createdAt, updatedAt
- **Song:** id, title, artist, url, albumId, duration, genre, createdAt, updatedAt
- **Playlist:** id, name, userId, createdAt, updatedAt
- **PlaylistSong:** id, playlistId, songId
- **BlogPost:** id, title, content, userId, createdAt, updatedAt

### 3.2. API Routing & Logic

- **/api/auth:** Register, login (JWT), health check.
- **/api/albums:** CRUD for albums, image upload (multer), fetch by artist.
- **/api/albums/:id:** Get album details.
- **/api/albums/:albumId/tracks:** Upload track (multer), fetch tracks.
- **/api/playlists, /api/blog:** CRUD stubs.

### 3.3. File Storage

- **Images:** `uploads/<album_name>/cover.jpg`
- **Tracks:** `uploads/albums/<album_id>/tracks/<unique>.mp3`
- **DB:** Only relative file paths stored.
- **Static Serving:** Express serves `/uploads` as static.

### 3.4. Authentication Flow (Mermaid Diagram)

```mermaid
sequenceDiagram
  participant User
  participant Frontend
  participant Backend
  participant DB

  User->>Frontend: Enter email/password
  Frontend->>Backend: POST /api/auth/login
  Backend->>DB: Find user by email
  Backend->>Backend: Compare password (bcrypt)
  Backend-->>Frontend: JWT token
  Frontend->>LocalStorage: Store JWT
  Frontend->>Backend: Authenticated requests (JWT in header)
  Backend->>Backend: Verify JWT
  Backend->>DB: Perform user-specific actions
```

---

## 4. Frontend Architecture

### 4.1. UI Structure

- **Sidebar:** Navigation, responsive, collapsible, keyboard shortcut.
- **Top Bar:** (Planned/partial) for quick actions, user info.
- **Main Content:** Album grid, album details, blog, playlists.
- **Dialogs:** Add album, add track, update album art.
- **Player:** Fixed bottom, plays selected track.

```mermaid
graph TD
  Sidebar --nav--> MainContent
  MainContent --select--> Dialogs
  MainContent --play--> Player
```

### 4.2. State Management

- **AuthContext:** Handles user state, login, logout, registration.
- **Local State:** Album/tracks/related loading, error, selection.
- **Toasts:** Feedback for actions (success/error).

### 4.3. Responsive Design

- **shadcn/ui:** Modern, accessible, mobile-first.
- **Tailwind CSS:** Utility classes for layout, color, spacing.
- **Sidebar:** Collapses on mobile, uses Sheet for drawer.
- **Album Grid:** Responsive columns, cards adapt to screen size.

---

## 5. Developer Experience

- **TypeScript:** Type safety throughout (types, interfaces, zod validation).
- **Prisma:** Type-safe DB access, easy migrations, seed scripts.
- **Modular Components:** UI split into logical, reusable pieces.
- **Hooks:** Custom hooks for album data, audio, mobile detection.
- **.env Config:** Uploads path, JWT secret, DB URL.
- **Testing:** (Recommend adding unit/integration tests for all CRUD and UI flows.)

---

## 6. Product Management View

- **Core Features:**
  - User registration/login (JWT)
  - Album CRUD with image upload
  - Track upload (mp3/m4a), duration extraction
  - Playlist and blog (CRUD stubs)
  - Responsive, modern UI
- **User Stories:**
  - As a user, I can browse albums and see cover art.
  - As a user, I can view album details and play tracks.
  - As a user, I can upload new albums and tracks.
  - As a user, I can manage playlists and read blog posts.
- **KPIs:**
  - Upload success rate
  - Track play reliability
  - Auth/session security
  - Mobile usability

---

## 7. Security & Compliance

- **Passwords:** Hashed with bcryptjs.
- **JWT:** Signed with secret, expiry set.
- **Uploads:** Only file paths in DB, files stored outside web root.
- **Validation:** zod for forms, server-side checks for required fields.
- **Error Handling:** Robust try/catch, user feedback via toasts.
- **Edge Cases:** Handles missing files, invalid IDs, duplicate users.

---

## 8. Extensibility & Future Roadmap

- **Planned/Recommended:**
  - Full CRUD for playlists and blog.
  - User roles/permissions.
  - Track reordering, album editing.
  - Search and filter for albums/tracks.
  - Social features (sharing, comments).
  - API rate limiting, audit logging.
  - Automated tests (Jest, Cypress).
  - CI/CD integration.

---

## 9. Directory Structure

```
Snotify/
  prisma/           # Prisma schema, migrations, seed
  src/
    components/     # UI components (album, player, sidebar, etc.)
    context/        # React context (Auth, Theme)
    hooks/          # Custom React hooks
    lib/            # Backend logic (routes, API, server)
    pages/          # Main page components (Album, Blog, etc.)
    types/          # TypeScript types
    utils/          # Utility functions
    integrations/   # DB and (legacy) supabase integration
  uploads/          # Album images and track files
  public/           # Static assets
  .env              # Environment variables
```

---

*This document is auto-generated for architectural, developer, and product management reference. For questions, see the codebase or contact the maintainers.*
