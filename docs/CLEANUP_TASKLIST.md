# Snotify Cleanup Task List - Redundant Code Removal

## 🎉 MAJOR CLEANUP COMPLETED!

**Status**: Most critical cleanup tasks are DONE! The application is now much cleaner and more maintainable.

### ✅ Key Accomplishments:
- **Removed 51+ npm packages** by eliminating Supabase dependency
- **Deleted entire non-functional Next.js API directory** (src/app/api/*)
- **Removed all Next.js imports** incompatible with Vite
- **Eliminated broken components** with Next.js dependencies  
- **Stubbed out broken function calls** with clear TODOs
- **Verified core functionality intact** - Express API serving albums correctly
- **Zero TypeScript errors** after cleanup

### 🎯 Current State:
- **✅ Working**: Albums CRUD, file uploads, Express API, Vite frontend
- **✅ Clean**: No broken imports, no build errors, clear separation of concerns
- **⏳ TODO**: Blog, playlist, and some player components need Express API integration
- **📝 Well-documented**: All placeholder functionality clearly marked with TODOs

---

## Priority Classification
- 🟥 **HIGH**: Immediate cleanup - confirmed redundant, safe to remove
- 🟨 **MEDIUM**: Needs verification before removal
- 🟩 **LOW**: Nice to have cleanup, not urgent

---

## 🟥 HIGH PRIORITY TASKS (Confirmed Safe)

### Task 1: Remove Non-Functional Next.js API Routes
**Status**: URGENT - Causing confusion
**Files to Remove**: `src/app/api/*` (entire directory)
**Verification**: These are Next.js style routes in a Vite app - confirmed non-functional
**Risk**: ZERO - These don't work anyway

### Task 2: Remove Supabase Dependencies
**Status**: URGENT - Legacy code
**Actions**:
- Remove `@supabase/supabase-js` from package.json
- Remove supabase client imports
- Remove `src/integrations/supabase/*` directory
**Risk**: LOW - MySQL is the active database

### Task 3: Clean Unused Service Files
**Status**: HIGH - Dead code
**Files to Remove**: 
- `src/services/*` (if empty/unused)
- `src/lib/blogApi.ts` (1 byte file)
- `src/lib/config.ts` (1 byte file)
**Risk**: LOW - Placeholder files

---

## 🟨 MEDIUM PRIORITY TASKS (Verification Needed)

### Task 4: Remove Duplicate Route Components
**Status**: MEDIUM - Confusing routes
**Action**: Choose between `/album/:id` vs `/albums/:id` routes
**Files**: `src/pages/Album.tsx` vs `src/pages/albums/[id].tsx`
**Verification Needed**: Check which one is actually used

### Task 5: Clean Unused Component Directories
**Status**: MEDIUM - Placeholder components
**Directories to Verify**:
- `src/components/spotify/*` (Spotify integration placeholders)
- `src/components/social/*` (Social features without backend)
- `src/components/admin/*` (Incomplete admin features)
- `src/components/email/*` (Email templates without backend)
**Risk**: MEDIUM - Need to verify no imports

### Task 6: Remove Unused Imports and Dependencies
**Status**: MEDIUM - Package bloat
**Actions**:
- Scan for unused imports across all files
- Remove unused npm dependencies
- Clean up dead CSS files
**Risk**: MEDIUM - Need careful verification

---

## 🟩 LOW PRIORITY TASKS (Nice to Have)

### Task 7: Consolidate Authentication Code
**Status**: LOW - Multiple auth implementations
**Action**: Standardize on single auth approach
**Risk**: HIGH - Working auth systems, careful changes needed

### Task 8: Remove Development Artifacts
**Status**: LOW - Cleanup
**Files**: 
- `.roomodes`, `.windsurfrules` (development helper files)
- Unused test files
- Dead documentation files

### Task 9: Optimize Build Configuration
**Status**: LOW - Performance
**Actions**:
- Clean vite.config.ts
- Optimize tsconfig files
- Remove unused build scripts

---

## VERIFICATION CHECKLIST

Before removing any code, verify:
- [ ] No imports referencing the code
- [ ] No runtime dependencies
- [ ] No tests referencing the code  
- [ ] No configuration referencing the code
- [ ] Grep search confirms no usage

---

## EXECUTION LOG

### ✅ Completed Tasks
**Task 1: Remove Non-Functional Next.js API Routes** - COMPLETED ✅
- Removed: src/app/api/* (entire directory)
- Removed: src/lib/websocket/server.ts (broken imports)
- Removed: src/lib/auth/socialAuth.ts (broken imports, unused)
- Result: No TypeScript errors, servers still functional

### ✅ Completed
**Task 1: Remove Non-Functional Next.js API Routes** - COMPLETED ✅

**Task 2: Remove Supabase Dependencies** - COMPLETED ✅
- ✅ Removed @supabase/supabase-js from package.json (51 packages removed)
- ✅ Removed supabase client imports from components
- ✅ Removed src/integrations/supabase/* directory
- ✅ Removed supabase/ directory with server functions
- ✅ Stubbed out Supabase calls in blog components with TODOs
- ✅ Updated file upload utilities to remove Supabase dependencies
- ✅ Created basic types in src/types/index.ts to replace Supabase types
- ✅ Verified servers still working - Express API responding correctly

**Task 3: Remove Broken Service Files** - COMPLETED ✅
- ✅ Removed components with Next.js imports (UserProfile, SocialProfile, etc.)
- ✅ Removed entire src/app/* directory (Next.js pages incompatible with Vite)
- ✅ Fixed broken import in src/pages/Profile.tsx
- ✅ Verified no remaining Next.js imports
- ✅ Verified TypeScript compilation successful

**Task 4: Remove Unused Service Files** - COMPLETED ✅
- ✅ Removed unused artistService.ts (not imported anywhere)
- ✅ Removed empty src/services/ directory
- ✅ Verified TypeScript compilation successful

**Task 5: Remove Unused Components** - PARTIALLY COMPLETED ✅
- ✅ Fixed BlogItem.tsx - stubbed out broken deleteBlogArticle call
- ✅ Fixed SendEmailDialog.tsx - stubbed out broken sendEmail call
- ✅ Verified TypeScript compilation successful
- ✅ Verified Express server still working (albums API responding)

### 🚧 In Progress
**Task 6: Remove Unused Imports** - IN PROGRESS
- ⏳ Found many files with TODO comments about removed Supabase functionality
- ⏳ Blog, playlist, and some player components have placeholder implementations
- ⏳ Core albums functionality remains working via Express API

### ❌ Blocked
(Tasks that need user input or found dependencies)

---

*Last Updated: Initial creation*
*Next Review: After each completed task* 