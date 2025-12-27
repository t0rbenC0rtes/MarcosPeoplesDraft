# Phase 1.2: Authentication Flows

## marcospeoples.com - User Authentication & Session Management

**Date Created:** December 27, 2025  
**Status:** Complete  
**Auth Strategy:** Dual authentication (Google OAuth + Anonymous)

---

## TABLE OF CONTENTS

1. [Authentication Overview](#authentication-overview)
2. [Google OAuth Flow](#google-oauth-flow)
3. [Anonymous User Flow](#anonymous-user-flow)
4. [Session Management](#session-management)
5. [User State Transitions](#user-state-transitions)
6. [Edge Cases & Error Handling](#edge-cases--error-handling)
7. [UI/UX Considerations](#uiux-considerations)
8. [Technical Implementation](#technical-implementation)
9. [Security Considerations](#security-considerations)

---

## AUTHENTICATION OVERVIEW

### Authentication Philosophy

**⚡ No Login Required to View**

- Anyone with the link can access the website
- All published memories and photos are publicly viewable
- No authentication required for browsing, searching, or viewing content
- Fully open memorial accessible to all

**🔐 Login Only for Contributing**

- Authentication **only requested** when user wants to share a memory
- Still **optional** - users can choose anonymous contribution
- No forced registration - respect visitor privacy
- Seamless experience: view first, contribute later

### Dual Authentication Strategy

**Two paths to contribute:**

1. **Google OAuth**: Full authentication with Google account
2. **Anonymous**: Lightweight, temporary session without account

Both paths provide **equal permissions** - no restrictions for anonymous users.

### Authentication Goals

✅ **Open Access**: No barriers to viewing and honoring Marcos  
✅ **Low Barrier to Entry**: Quick anonymous option for immediate contributions  
✅ **Trusted Identity**: Google OAuth for verified contributors  
✅ **Equal Permissions**: Both auth methods can read/write memories  
✅ **Persistent Sessions**: Remember users across visits  
✅ **Graceful Degradation**: Fallback if one method fails

### User Journey Overview

```
Visitor (unauthenticated)
    │
    ├─→ Browse memories (NO LOGIN REQUIRED) ✅
    │   ├─→ View map
    │   ├─→ Read memories
    │   ├─→ View photos
    │   ├─→ Search/filter
    │   └─→ Share specific memory links
    │
    └─→ Want to contribute? ← AUTH ONLY ASKED HERE
         │
         ├─→ Google OAuth → Authenticated User → Create memories
         │
         └─→ Anonymous → Authenticated User → Create memories
```

---

## GOOGLE OAUTH FLOW

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User clicks "Sign in with Google" button                 │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Supabase redirects to Google OAuth consent screen       │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. User approves access (email, profile, name, picture)    │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Google redirects back with authorization code            │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Supabase exchanges code for access token                │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Supabase creates session + returns user data            │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. App checks if user exists in users table                │
│    ├─→ YES: Load existing user profile                      │
│    └─→ NO: Create new user record                          │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. User authenticated - show "Share a Memory" button       │
└─────────────────────────────────────────────────────────────┘
```

### Step-by-Step Implementation

#### Step 1: User Initiates Login

**UI Element:**

```jsx
<button onClick={handleGoogleSignIn}>
  <GoogleIcon />
  Sign in with Google
</button>
```

**Trigger:**

- User clicks "Share a Memory" while unauthenticated
- User clicks "Sign in with Google" in nav/header
- Redirect from protected action (e.g., trying to submit memory)

#### Step 2-6: Supabase OAuth Handling

**Code:**

```javascript
const handleGoogleSignIn = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
      scopes: "email profile",
    },
  });

  if (error) {
    console.error("Google sign-in failed:", error);
    // Show error message to user
    showNotification("Unable to sign in. Please try again.", "error");
  }
};
```

**What Happens:**

- Opens Google consent screen in popup or redirect
- User approves access
- Google redirects to `/auth/callback`
- Supabase automatically handles token exchange

#### Step 7: Create/Load User Profile

**On Auth Callback Page:**

```javascript
useEffect(() => {
  const handleAuthCallback = async () => {
    // Get session from URL hash
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      // Redirect to home with error
      navigate("/?error=auth_failed");
      return;
    }

    // Check if user exists in our users table
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("supabase_auth_id", session.user.id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // Error other than "not found"
      console.error("Error fetching user:", fetchError);
    }

    if (!existingUser) {
      // Create new user record
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert({
          supabase_auth_id: session.user.id,
          auth_type: "google",
          google_id: session.user.user_metadata.sub,
          email: session.user.email,
          name:
            session.user.user_metadata.full_name ||
            session.user.email?.split("@")[0],
          profile_pic_url: session.user.user_metadata.avatar_url,
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating user:", createError);
        navigate("/?error=profile_creation_failed");
        return;
      }

      // Store user in app state
      setUser(newUser);
    } else {
      // Load existing user
      setUser(existingUser);

      // Optional: Update last_seen_at
      await supabase
        .from("users")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("id", existingUser.id);
    }

    // Redirect to intended destination or home
    const returnTo = localStorage.getItem("authReturnTo") || "/";
    localStorage.removeItem("authReturnTo");
    navigate(returnTo);
  };

  handleAuthCallback();
}, []);
```

#### Step 8: User Authenticated

**App State:**

- `isAuthenticated = true`
- `user = { id, name, email, profile_pic_url, auth_type: 'google' }`
- `session = { access_token, refresh_token, expires_at }`

**UI Changes:**

- Show user profile picture in header
- Display "Share a Memory" button
- Show "Sign out" option

### Google OAuth Data Captured

**From Google:**

```json
{
  "sub": "1234567890", // Google user ID
  "email": "marcos.friend@gmail.com",
  "email_verified": true,
  "name": "Maria Santos",
  "given_name": "Maria",
  "family_name": "Santos",
  "picture": "https://lh3.googleusercontent.com/a/...",
  "locale": "en"
}
```

**Stored in users table:**

```sql
{
  id: uuid,
  supabase_auth_id: session.user.id,
  auth_type: 'google',
  google_id: '1234567890',
  email: 'marcos.friend@gmail.com',
  name: 'Maria Santos',
  profile_pic_url: 'https://lh3.googleusercontent.com/a/...',
  created_at: '2025-12-27T...',
}
```

---

## ANONYMOUS USER FLOW

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User clicks "Continue as Guest" or "Share Anonymously"  │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Show modal: "What name would you like to use?"          │
│    [Optional text input] or [Skip - use "anonymous"]       │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Create anonymous session with Supabase                  │
│    (signInAnonymously or custom session)                   │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Create user record in users table                       │
│    - auth_type: 'anonymous'                                │
│    - name: user input or "anonymous"                       │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Store session token in localStorage/sessionStorage      │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. User authenticated - show "Share a Memory" button       │
└─────────────────────────────────────────────────────────────┘
```

### Step-by-Step Implementation

#### Step 1-2: User Initiates Anonymous Login

**UI Modal:**

```jsx
<Modal open={showAnonymousModal}>
  <h2>Continue as Guest</h2>
  <p>Share your memory without signing in</p>

  <label>
    What name would you like to use? (optional)
    <input
      type="text"
      placeholder="Your name"
      maxLength={50}
      value={guestName}
      onChange={(e) => setGuestName(e.target.value)}
    />
  </label>

  <p className="hint">Leave blank to appear as "anonymous"</p>

  <button onClick={handleAnonymousSignIn}>Continue</button>

  <button onClick={closeModal}>Cancel</button>
</Modal>
```

#### Step 3-5: Create Anonymous Session

**Implementation Option 1: Supabase Anonymous Auth** (if supported)

```javascript
const handleAnonymousSignIn = async () => {
  const displayName = guestName.trim() || "anonymous";

  // Create anonymous session
  const {
    data: { session },
    error: authError,
  } = await supabase.auth.signInAnonymously();

  if (authError) {
    console.error("Anonymous auth failed:", authError);
    showNotification("Unable to continue. Please try again.", "error");
    return;
  }

  // Create user record
  const { data: newUser, error: createError } = await supabase
    .from("users")
    .insert({
      supabase_auth_id: session.user.id,
      auth_type: "anonymous",
      name: displayName,
    })
    .select()
    .single();

  if (createError) {
    console.error("Error creating anonymous user:", createError);
    showNotification("Unable to create profile. Please try again.", "error");
    return;
  }

  // Store in app state
  setUser(newUser);
  closeModal();

  // Redirect to memory creation
  navigate("/share-memory");
};
```

**Implementation Option 2: Custom Anonymous Session** (if Supabase doesn't support anonymous)

```javascript
const handleAnonymousSignIn = async () => {
  const displayName = guestName.trim() || "anonymous";

  // Generate a unique session ID
  const sessionId = crypto.randomUUID();

  // Create user record without Supabase Auth
  const { data: newUser, error: createError } = await supabase
    .from("users")
    .insert({
      auth_type: "anonymous",
      name: displayName,
    })
    .select()
    .single();

  if (createError) {
    console.error("Error creating anonymous user:", createError);
    showNotification("Unable to create profile. Please try again.", "error");
    return;
  }

  // Store session locally
  const anonymousSession = {
    userId: newUser.id,
    sessionId: sessionId,
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  };

  localStorage.setItem("anonymous_session", JSON.stringify(anonymousSession));

  // Store in app state
  setUser(newUser);
  setIsAuthenticated(true);
  closeModal();

  // Redirect to memory creation
  navigate("/share-memory");
};
```

#### Step 6: Anonymous User Authenticated

**App State:**

- `isAuthenticated = true`
- `user = { id, name, auth_type: 'anonymous' }`
- `session = { userId, sessionId, expiresAt }` (stored in localStorage)

**UI Changes:**

- Show generic avatar icon (no profile picture)
- Display user's chosen name or "anonymous"
- Show "Share a Memory" button
- No "Sign out" needed (session expires automatically)

### Anonymous Session Persistence

**LocalStorage Structure:**

```json
{
  "anonymous_session": {
    "userId": "uuid-here",
    "sessionId": "session-uuid",
    "createdAt": 1703721600000,
    "expiresAt": 1706313600000
  }
}
```

**Session Validation on Page Load:**

```javascript
useEffect(() => {
  const checkAnonymousSession = async () => {
    const sessionData = localStorage.getItem("anonymous_session");

    if (!sessionData) return;

    const session = JSON.parse(sessionData);

    // Check if expired
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem("anonymous_session");
      return;
    }

    // Load user from database
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", session.userId)
      .eq("auth_type", "anonymous")
      .single();

    if (error || !user) {
      localStorage.removeItem("anonymous_session");
      return;
    }

    // Restore session
    setUser(user);
    setIsAuthenticated(true);
  };

  checkAnonymousSession();
}, []);
```

---

## SESSION MANAGEMENT

### Session Lifecycle

**Google OAuth Session:**

- **Duration**: 7 days (Supabase default)
- **Refresh**: Automatic token refresh before expiry
- **Storage**: HTTP-only cookie + localStorage (for access token)
- **Expiration**: User must re-authenticate after 7 days

**Anonymous Session:**

- **Duration**: 30 days (configurable)
- **Refresh**: No refresh - expires after 30 days
- **Storage**: localStorage only
- **Expiration**: User creates new anonymous session after expiry

### Session Storage Strategy

**Supabase Auth (Google OAuth):**

```javascript
// Automatic storage by Supabase
// Access via: supabase.auth.getSession()
// Refresh via: supabase.auth.refreshSession()
```

**Custom Anonymous:**

```javascript
// Manual storage in localStorage
{
  "anonymous_session": {
    "userId": "uuid",
    "sessionId": "uuid",
    "createdAt": timestamp,
    "expiresAt": timestamp
  }
}
```

### Session Restoration on Page Load

**Authentication Check Flow:**

```javascript
const initializeAuth = async () => {
  setIsLoading(true);

  try {
    // 1. Check for Google OAuth session
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (session) {
      // Load Google user profile
      const { data: user } = await supabase
        .from("users")
        .select("*")
        .eq("supabase_auth_id", session.user.id)
        .single();

      if (user) {
        setUser(user);
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }
    }

    // 2. Check for anonymous session
    const anonymousSession = localStorage.getItem("anonymous_session");

    if (anonymousSession) {
      const session = JSON.parse(anonymousSession);

      // Check expiration
      if (Date.now() < session.expiresAt) {
        const { data: user } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.userId)
          .single();

        if (user) {
          setUser(user);
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }
      } else {
        // Session expired - clean up
        localStorage.removeItem("anonymous_session");
      }
    }

    // 3. No valid session found
    setIsAuthenticated(false);
    setUser(null);
  } catch (error) {
    console.error("Auth initialization error:", error);
    setIsAuthenticated(false);
    setUser(null);
  } finally {
    setIsLoading(false);
  }
};

// Run on app mount
useEffect(() => {
  initializeAuth();

  // Listen for auth changes (Google OAuth only)
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === "SIGNED_IN" && session) {
      // User signed in with Google
      const { data: user } = await supabase
        .from("users")
        .select("*")
        .eq("supabase_auth_id", session.user.id)
        .single();

      setUser(user);
      setIsAuthenticated(true);
    } else if (event === "SIGNED_OUT") {
      // User signed out
      setUser(null);
      setIsAuthenticated(false);
    }
  });

  return () => subscription.unsubscribe();
}, []);
```

### Logout Implementation

**Google OAuth Logout:**

```javascript
const handleGoogleSignOut = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Sign out error:", error);
    showNotification("Unable to sign out", "error");
    return;
  }

  // Clear app state
  setUser(null);
  setIsAuthenticated(false);

  // Redirect to home
  navigate("/");

  showNotification("Signed out successfully", "success");
};
```

**Anonymous "Logout" (Session Clear):**

```javascript
const handleAnonymousEnd = () => {
  // Remove session from localStorage
  localStorage.removeItem("anonymous_session");

  // Clear app state
  setUser(null);
  setIsAuthenticated(false);

  // Redirect to home
  navigate("/");

  showNotification("Session ended", "info");
};
```

---

## USER STATE TRANSITIONS

### State Diagram

```
┌───────────────────┐
│  Unauthenticated  │ ← Initial state
│   (Visitor)       │
└─────────┬─────────┘
          │
          ├─→ Click "Sign in with Google"
          │   └─→ [Google OAuth Flow]
          │       └─→ ┌──────────────────┐
          │           │  Authenticated   │
          │           │  (Google User)   │
          │           └────────┬─────────┘
          │                    │
          │                    ├─→ Session expires (7 days)
          │                    │   └─→ Return to Unauthenticated
          │                    │
          │                    └─→ Click "Sign out"
          │                        └─→ Return to Unauthenticated
          │
          └─→ Click "Continue as Guest"
              └─→ [Anonymous Flow]
                  └─→ ┌──────────────────┐
                      │  Authenticated   │
                      │ (Anonymous User) │
                      └────────┬─────────┘
                               │
                               ├─→ Session expires (30 days)
                               │   └─→ Return to Unauthenticated
                               │
                               └─→ Clear browser data
                                   └─→ Return to Unauthenticated
```

### State Transitions Table

| Current State             | Action              | Next State                | Side Effects                            |
| ------------------------- | ------------------- | ------------------------- | --------------------------------------- |
| Unauthenticated           | Sign in with Google | Authenticated (Google)    | Create/load user record, start session  |
| Unauthenticated           | Continue as Guest   | Authenticated (Anonymous) | Create user record, store local session |
| Authenticated (Google)    | Sign out            | Unauthenticated           | Clear session, clear app state          |
| Authenticated (Google)    | Session expires     | Unauthenticated           | Auto sign out, show re-auth prompt      |
| Authenticated (Anonymous) | Session expires     | Unauthenticated           | Clear local session, show prompt        |
| Authenticated (Anonymous) | Clear browser data  | Unauthenticated           | Lose session (expected behavior)        |
| Authenticated (Any)       | Browser refresh     | Authenticated (Same)      | Restore from session storage            |

---

## EDGE CASES & ERROR HANDLING

### Edge Case 1: Google OAuth Fails

**Scenario**: User clicks "Sign in with Google" but consent is denied or error occurs

**Handling:**

```javascript
const handleGoogleSignIn = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) throw error;
  } catch (error) {
    console.error("Google sign-in failed:", error);

    // Show user-friendly error
    showNotification(
      "Unable to sign in with Google. Please try again or continue as guest.",
      "error"
    );

    // Track error for debugging
    logError("google_auth_failed", error);
  }
};
```

**User Experience:**

- Show error message with fallback option
- Offer "Continue as Guest" alternative
- Don't block user from viewing site

### Edge Case 2: Anonymous Session Expires Mid-Upload

**Scenario**: User starts uploading a memory, but session expires before completion

**Handling:**

```javascript
const handleMemorySubmit = async (memoryData) => {
  // Check session validity before submission
  const isValid = await validateSession();

  if (!isValid) {
    // Session expired - save draft locally
    localStorage.setItem("memory_draft", JSON.stringify(memoryData));

    // Show re-auth modal
    showNotification(
      "Your session expired. Please sign in again to continue.",
      "warning"
    );

    setShowAuthModal(true);
    return;
  }

  // Continue with submission
  const { data, error } = await supabase.from("memories").insert(memoryData);

  // ... handle response
};

// After re-authentication, restore draft
useEffect(() => {
  if (isAuthenticated) {
    const draft = localStorage.getItem("memory_draft");
    if (draft) {
      const memoryData = JSON.parse(draft);
      // Restore form with draft data
      setFormData(memoryData);
      localStorage.removeItem("memory_draft");
      showNotification("Your draft has been restored", "success");
    }
  }
}, [isAuthenticated]);
```

### Edge Case 3: User Opens Site in Multiple Tabs

**Scenario**: User has site open in multiple tabs with different sessions

**Handling:**

```javascript
// Listen for storage changes (cross-tab communication)
useEffect(() => {
  const handleStorageChange = (e) => {
    if (e.key === "anonymous_session") {
      if (e.newValue === null) {
        // Session cleared in another tab - sign out here too
        setUser(null);
        setIsAuthenticated(false);
      } else if (e.newValue !== e.oldValue) {
        // Session changed in another tab - reload
        window.location.reload();
      }
    }
  };

  window.addEventListener("storage", handleStorageChange);
  return () => window.removeEventListener("storage", handleStorageChange);
}, []);
```

### Edge Case 4: Network Error During Authentication

**Scenario**: Internet connection lost during auth flow

**Handling:**

```javascript
const handleAuthWithRetry = async (authFunction, maxRetries = 3) => {
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const result = await authFunction();
      return { success: true, data: result };
    } catch (error) {
      attempt++;

      if (
        error.message.includes("network") ||
        error.message.includes("fetch")
      ) {
        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff)
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
          continue;
        }
      }

      // Non-network error or max retries reached
      return { success: false, error };
    }
  }
};

// Usage
const result = await handleAuthWithRetry(async () => {
  return await supabase.auth.signInWithOAuth({ provider: "google" });
});

if (!result.success) {
  showNotification(
    "Connection issue. Please check your internet and try again.",
    "error"
  );
}
```

### Edge Case 5: User Closes Browser Before Completing Anonymous Setup

**Scenario**: User starts anonymous flow but closes browser before completing

**Handling:**

- No partial state saved
- Clean slate on next visit
- User must re-enter name if they want to contribute
- This is expected behavior for anonymous flow

### Edge Case 6: Google Email Already Used by Anonymous User

**Scenario**: User previously contributed anonymously, now signs in with Google using same device

**Handling:**

```javascript
// Option 1: Allow separate profiles (recommended)
// - Anonymous contributions remain under anonymous profile
// - Google contributions under Google profile
// - No automatic merging

// Option 2: Offer to merge (complex, Phase 5+)
const checkForAnonymousProfile = async (googleEmail) => {
  // Check if there's a recent anonymous session
  const anonymousSession = localStorage.getItem("anonymous_session");

  if (anonymousSession) {
    const session = JSON.parse(anonymousSession);

    // Ask user if they want to link profiles
    const shouldMerge = await showMergePrompt(
      "We found previous contributions. Link them to your Google account?"
    );

    if (shouldMerge) {
      // Update anonymous user's memories to new Google user
      await supabase
        .from("memories")
        .update({ user_id: googleUserId })
        .eq("user_id", session.userId);

      // Clean up anonymous session
      localStorage.removeItem("anonymous_session");
    }
  }
};
```

**Recommendation**: Keep separate (Option 1) - simpler, respects user's choice of identity

---

## UI/UX CONSIDERATIONS

### Authentication Prompts

**When to Show Auth Modal:**

1. User clicks "Share a Memory" while unauthenticated
2. User tries to submit a report while unauthenticated
3. User attempts any write action while unauthenticated

**Modal Content:**

```jsx
<AuthModal>
  <h2>Share Your Memory</h2>
  <p>Choose how you'd like to contribute:</p>

  <button onClick={handleGoogleSignIn} className="primary">
    <GoogleIcon />
    Sign in with Google
  </button>

  <div className="divider">or</div>

  <button onClick={showAnonymousForm} className="secondary">
    Continue as Guest
  </button>

  <p className="hint">
    Both options allow you to share memories and photos. Google sign-in saves
    your profile for future visits.
  </p>
</AuthModal>
```

### User Profile Display

**Authenticated Google User:**

```jsx
<UserProfile>
  <img src={user.profile_pic_url} alt={user.name} />
  <span>{user.name}</span>
  <button onClick={handleGoogleSignOut}>Sign out</button>
</UserProfile>
```

**Authenticated Anonymous User:**

```jsx
<UserProfile>
  <div className="avatar-placeholder">
    <UserIcon />
  </div>
  <span>{user.name}</span>
  <span className="badge">Guest</span>
</UserProfile>
```

**Unauthenticated:**

```jsx
<UserProfile>
  <button onClick={showAuthModal}>Sign in</button>
</UserProfile>
```

### Loading States

**During Authentication:**

```jsx
<LoadingState>
  <Spinner />
  <p>Signing you in...</p>
</LoadingState>
```

**During Session Restoration:**

```jsx
// Show nothing - instant for good UX
// Or minimal skeleton for very slow connections
<AppSkeleton />
```

### Error Messages

**Authentication Errors:**

- ❌ "Unable to sign in with Google. Please try again."
- ❌ "Session expired. Please sign in again to continue."
- ❌ "Connection issue. Please check your internet."
- ✅ "Signed in successfully!"
- ✅ "Your session has been restored."

---

## TECHNICAL IMPLEMENTATION

### Supabase Configuration

**Enable Google OAuth Provider:**

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Google provider
3. Add Google OAuth credentials:
   - Client ID from Google Cloud Console
   - Client Secret from Google Cloud Console
4. Configure authorized redirect URIs:
   - `https://your-project.supabase.co/auth/v1/callback`
   - `http://localhost:5173/auth/callback` (for development)

**Configure Session Settings:**

```javascript
// In Supabase dashboard → Authentication → Settings
{
  "JWT_EXPIRY": 604800,  // 7 days for Google OAuth
  "REFRESH_TOKEN_ROTATION_ENABLED": true,
  "SECURITY_UPDATE_PASSWORD_REQUIRE_REAUTHENTICATION": true
}
```

### React Context for Authentication

**AuthContext.jsx:**

```javascript
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      handleAuthChange(event, session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const initializeAuth = async () => {
    // Check Google OAuth session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      await loadGoogleUser(session.user.id);
    } else {
      await checkAnonymousSession();
    }

    setIsLoading(false);
  };

  const loadGoogleUser = async (supabaseAuthId) => {
    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("supabase_auth_id", supabaseAuthId)
      .single();

    if (user) {
      setUser(user);
      setIsAuthenticated(true);
    }
  };

  const checkAnonymousSession = async () => {
    const sessionData = localStorage.getItem("anonymous_session");
    if (!sessionData) return;

    const session = JSON.parse(sessionData);

    if (Date.now() > session.expiresAt) {
      localStorage.removeItem("anonymous_session");
      return;
    }

    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("id", session.userId)
      .single();

    if (user) {
      setUser(user);
      setIsAuthenticated(true);
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
  };

  const signInAnonymously = async (name) => {
    // Implementation depends on chosen strategy
    // See "Anonymous User Flow" section above
  };

  const signOut = async () => {
    if (user?.auth_type === "google") {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem("anonymous_session");
    }

    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    signInWithGoogle,
    signInAnonymously,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

### Protected Routes

**ProtectedRoute.jsx:**

```javascript
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    // Save intended destination
    localStorage.setItem("authReturnTo", window.location.pathname);
    return <Navigate to="/?auth=required" replace />;
  }

  return children;
};
```

---

## SECURITY CONSIDERATIONS

### Session Security

**Google OAuth:**

- ✅ HTTP-only cookies prevent XSS attacks
- ✅ Secure flag ensures HTTPS-only transmission
- ✅ Short-lived tokens (7 days) limit exposure
- ✅ Refresh token rotation prevents replay attacks

**Anonymous:**

- ⚠️ LocalStorage vulnerable to XSS
- ✅ No sensitive data stored (just session ID)
- ✅ Session expires automatically (30 days)
- ✅ Server validates user_id on every request (RLS)

### Data Validation

**Always validate on server:**

```javascript
// Frontend validation (UX)
if (!memoryData.user_id) {
  showError("Please sign in to submit a memory");
  return;
}

// Backend validation (Security - via RLS)
// user_id must match auth.uid() in RLS policy
```

### XSS Prevention

**Sanitize all user input:**

```javascript
import DOMPurify from "dompurify";

const sanitizedStory = DOMPurify.sanitize(userInput);
```

### Rate Limiting

**Implement in Phase 3:**

- Max 5 memories per hour per user
- Max 20 photos per memory
- Max 10 reports per day per user

---

## TESTING CHECKLIST

### Google OAuth Flow

- [ ] Sign in with Google redirects to consent screen
- [ ] User can approve and deny consent
- [ ] Successful sign-in creates user record
- [ ] Returning users load existing profile
- [ ] Profile picture and name displayed correctly
- [ ] Sign out clears session
- [ ] Session persists across page refreshes
- [ ] Session expires after 7 days

### Anonymous Flow

- [ ] "Continue as Guest" shows name input modal
- [ ] Name input optional (defaults to "anonymous")
- [ ] Anonymous session created successfully
- [ ] Generic avatar shown for anonymous users
- [ ] Session persists across page refreshes
- [ ] Session expires after 30 days
- [ ] Clearing browser data removes session

### Edge Cases

- [ ] Google OAuth failure shows error + fallback
- [ ] Session expiration during upload saves draft
- [ ] Multiple tabs sync session state
- [ ] Network errors show retry option
- [ ] Anonymous user can upgrade to Google (future)

---

## NEXT STEPS

✅ **Authentication Flows Complete**

**Now Ready For:**

1. Design site navigation structure → Task 4
2. Define metadata taxonomy → Task 5
3. Document API endpoints → Task 6

**In Phase 3.2 (Authentication Implementation):**

- Configure Google OAuth in Supabase
- Implement AuthContext and hooks
- Build authentication UI components
- Test all flows thoroughly

---

**Document Status:** ✅ Complete - Ready for Implementation  
**Last Updated:** December 27, 2025  
**Auth Strategy:** Dual (Google OAuth + Anonymous)  
**Session Duration:** 7 days (Google) / 30 days (Anonymous)
