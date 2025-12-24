# User Authentication System Implementation Plan

## Overview
This plan details the implementation of a complete user authentication system for the Vindrogames web application, using Django's built-in authentication (no Django REST Framework) on the backend and React with hooks on the frontend.

---

## Backend Implementation (Django)

### 1. Create Authentication App

**Location:** `vindro-django/src/accounts/`

**Purpose:** Dedicated Django app for user authentication and management

**Files to create:**
```
accounts/
├── __init__.py
├── apps.py
├── models.py          # Custom user profile (optional extension)
├── views.py           # Authentication API views
├── urls.py            # Auth endpoints routing
├── forms.py           # User registration/login forms
├── managers.py        # Custom user manager (if extending User model)
├── serializers.py     # Manual JSON serialization helpers
└── middleware.py      # Custom auth middleware (if needed)
```

**Command to create:**
```bash
python manage.py startapp accounts
```

---

### 2. Database Models

**File:** `accounts/models.py`

**Option A: Use Django's Built-in User Model (Recommended)**
- No custom model needed
- Use `django.contrib.auth.models.User`
- Fields: username, email, password, first_name, last_name, is_active, date_joined

**Option B: Extend with UserProfile Model**
```python
from django.contrib.auth.models import User
from django.db import models

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True)
    avatar = models.URLField(blank=True)
    game_scores = models.JSONField(default=dict)  # Store game scores
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

**Decision Point:** Do you need extended user fields beyond Django's defaults?

---

### 3. Authentication Views (API Endpoints)

**File:** `accounts/views.py`

**Required Views:**

#### 3.1 Register View
```python
@require_http_methods(["POST"])
def register(request):
    # Parse JSON body
    # Validate username, email, password
    # Create user with User.objects.create_user()
    # Return success/error JSON response
```

**Endpoint:** `POST /api/auth/register/`

**Request Body:**
```json
{
  "username": "player123",
  "email": "player@example.com",
  "password": "SecurePass123!",
  "password_confirm": "SecurePass123!"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": 1,
    "username": "player123",
    "email": "player@example.com"
  }
}
```

#### 3.2 Login View
```python
@require_http_methods(["POST"])
def login_view(request):
    # Parse JSON body
    # Authenticate with authenticate(username, password)
    # Call login(request, user) to create session
    # Return success + user data
```

**Endpoint:** `POST /api/auth/login/`

**Request Body:**
```json
{
  "username": "player123",
  "password": "SecurePass123!"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "player123",
    "email": "player@example.com",
    "is_authenticated": true
  }
}
```

#### 3.3 Logout View
```python
@require_http_methods(["POST"])
def logout_view(request):
    # Call logout(request) to destroy session
    # Return success message
```

**Endpoint:** `POST /api/auth/logout/`

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### 3.4 Current User View
```python
@require_http_methods(["GET"])
def current_user(request):
    # Check if request.user.is_authenticated
    # Return user data or null
```

**Endpoint:** `GET /api/auth/me/`

**Response (Authenticated):**
```json
{
  "user": {
    "id": 1,
    "username": "player123",
    "email": "player@example.com",
    "is_authenticated": true
  }
}
```

**Response (Not Authenticated):**
```json
{
  "user": null
}
```

#### 3.5 Password Change View (Optional)
```python
@require_http_methods(["POST"])
@login_required_api
def change_password(request):
    # Verify current password
    # Set new password
    # Return success/error
```

**Endpoint:** `POST /api/auth/change-password/`

---

### 4. URL Configuration

**File:** `accounts/urls.py`

```python
from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('me/', views.current_user, name='current_user'),
    path('change-password/', views.change_password, name='change_password'),
]
```

**Update:** `vindrobackend/urls.py`
```python
urlpatterns = [
    path("api/auth/", include("accounts.urls")),  # NEW
    path("test/", include("test.urls")),
    path('admin/', admin.site.urls),
]
```

---

### 5. Settings Configuration

**File:** `vindrobackend/settings.py`

**Changes Required:**

#### 5.1 Add accounts app
```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'accounts',  # NEW
    'test',
]
```

#### 5.2 Session Configuration
```python
# Session settings (already present, but verify)
SESSION_COOKIE_AGE = 1209600  # 2 weeks
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SECURE = False  # Set True in production with HTTPS
SESSION_COOKIE_SAMESITE = 'Lax'
```

#### 5.3 CORS Configuration (Update)
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

CORS_ALLOW_CREDENTIALS = True  # CRITICAL for session cookies
```

#### 5.4 CSRF Configuration
```python
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# For development, you might want to adjust CSRF for API calls
# Option 1: Use CSRF tokens (more secure)
# Option 2: Exempt API endpoints (less secure, only for dev)
```

#### 5.5 Authentication Backends
```python
AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',  # Default
]
```

---

### 6. Middleware & Security

**No changes needed** - Django's built-in middleware already includes:
- `SessionMiddleware` - Session management
- `AuthenticationMiddleware` - User authentication
- `CsrfViewMiddleware` - CSRF protection

**Optional Custom Middleware:**
Create `accounts/middleware.py` if you need custom auth logic.

---

### 7. Database Migrations

**Commands to run:**
```bash
# Create migrations for accounts app
python manage.py makemigrations accounts

# Apply migrations
python manage.py migrate

# Create superuser for admin access (optional)
python manage.py createsuperuser
```

---

### 8. Helper Utilities

**File:** `accounts/serializers.py`

**Purpose:** Manual JSON serialization (since we're not using DRF)

```python
def serialize_user(user):
    """Convert Django User object to JSON-serializable dict"""
    if not user or not user.is_authenticated:
        return None

    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'is_authenticated': True
    }
```

**File:** `accounts/decorators.py` (Optional)

**Purpose:** Custom decorators for API views
```python
def login_required_api(view_func):
    """Decorator to require authentication for API views"""
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse(
                {'success': False, 'error': 'Authentication required'},
                status=401
            )
        return view_func(request, *args, **kwargs)
    return wrapper
```

---

### 9. Admin Panel Integration

**File:** `accounts/admin.py`

```python
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import UserProfile  # if using extended profile

# If you created UserProfile model
class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False

class CustomUserAdmin(UserAdmin):
    inlines = [UserProfileInline]

# Re-register User with custom admin
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)
```

---

### 10. Testing Endpoints

**File:** `accounts/tests.py`

Create basic tests for:
- User registration
- Login/logout flow
- Password validation
- Duplicate username/email handling

---

## Frontend Implementation (React)

### 1. API Service Layer

**File:** `src/services/api.js`

**Purpose:** Centralized API communication with authentication support

```javascript
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Fetch wrapper with credentials
async function apiRequest(endpoint, options = {}) {
  const config = {
    ...options,
    credentials: 'include', // CRITICAL for session cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export const authAPI = {
  register: (userData) => apiRequest('/auth/register/', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  login: (credentials) => apiRequest('/auth/login/', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  logout: () => apiRequest('/auth/logout/', {
    method: 'POST',
  }),

  getCurrentUser: () => apiRequest('/auth/me/', {
    method: 'GET',
  }),

  changePassword: (passwords) => apiRequest('/auth/change-password/', {
    method: 'POST',
    body: JSON.stringify(passwords),
  }),
};
```

---

### 2. Authentication Context

**File:** `src/contexts/AuthContext.jsx`

**Purpose:** Global authentication state management

```javascript
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const data = await authAPI.getCurrentUser();
      setUser(data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(credentials) {
    const data = await authAPI.login(credentials);
    setUser(data.user);
    return data;
  }

  async function register(userData) {
    const data = await authAPI.register(userData);
    // Auto-login after registration
    return login({ username: userData.username, password: userData.password });
  }

  async function logout() {
    await authAPI.logout();
    setUser(null);
  }

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser: checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

---

### 3. Update Main Entry Point

**File:** `src/main.jsx`

**Changes:** Wrap app with AuthProvider

```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from "react-router-dom"
import router from './routes'
import { AuthProvider } from './contexts/AuthContext'  // NEW
import './scss/main.scss'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>  {/* NEW */}
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
)
```

---

### 4. Authentication Pages

#### 4.1 Login Page

**File:** `src/pages/Login.jsx`

```javascript
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData);
      navigate('/');  // Redirect to home after login
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
```

#### 4.2 Register Page

**File:** `src/pages/Register.jsx`

```javascript
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await register(formData);
      navigate('/');  // Redirect after successful registration
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-page">
      <div className="register-container">
        <h1>Register</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={formData.password_confirm}
            onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
            required
          />
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
```

---

### 5. Protected Route Component

**File:** `src/components/ProtectedRoute.jsx`

**Purpose:** Wrap routes that require authentication

```javascript
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
```

---

### 6. Update Routing

**File:** `src/routes.jsx`

**Add authentication routes:**

```javascript
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },           // NEW
      { path: "register", element: <Register /> },     // NEW
      { path: "story", element: <Story /> },
      { path: "blog", element: <Blog /> },
      { path: "games", element: <Games /> },
      {
        path: "games/game-42",
        element: <ProtectedRoute><Game42 /></ProtectedRoute>  // Example: protected route
      },
      { path: "games/escape-the-cloud", element: <EscapeTheCloud /> },
      { path: "contact", element: <Contact /> },
      { path: "privacy-cookies", element: <PrivacyCookies /> },
      { path: "test-api", element: <TestApi /> },
    ],
  },
]);
```

---

### 7. Update Header Navigation

**File:** `src/components/layout/Header.jsx`

**Add login/logout buttons:**

```javascript
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <header>
      <nav>
        {/* Existing nav links */}

        <div className="auth-buttons">
          {user ? (
            <>
              <span className="username">Welcome, {user.username}</span>
              <button onClick={handleLogout} className="btn btn-tan">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-tan">Login</Link>
              <Link to="/register" className="btn btn-teal">Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
```

---

### 8. User Profile Page (Optional)

**File:** `src/pages/Profile.jsx`

**Purpose:** Display user information and allow updates

```javascript
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="profile-page">
      <h1>User Profile</h1>
      <div className="profile-info">
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Member Since:</strong> {new Date(user.date_joined).toLocaleDateString()}</p>
      </div>
    </div>
  );
}
```

---

### 9. Styling

**File:** `src/scss/_auth.scss` (new file)

**Create styles for authentication pages:**

```scss
.login-page, .register-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;

  .login-container, .register-container {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    max-width: 400px;
    width: 100%;

    h1 {
      text-align: center;
      margin-bottom: 1.5rem;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 1rem;

      input {
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;

        &:focus {
          outline: none;
          border-color: $vindro-teal;
        }
      }

      .error {
        color: red;
        font-size: 0.875rem;
      }

      button {
        padding: 0.75rem;
        font-size: 1rem;
        cursor: pointer;

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }
    }

    p {
      text-align: center;
      margin-top: 1rem;

      a {
        color: $vindro-teal;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}
```

**Update:** `src/scss/main.scss`
```scss
@import 'config';
@import 'utils';
@import 'auth';  // NEW
// ... other imports
```

---

### 10. Helmet Components

**File:** `src/page-helmets/LoginHelmet.jsx`

```javascript
import { Helmet } from 'react-helmet-async';

export default function LoginHelmet() {
  return (
    <Helmet>
      <title>Login | Vindrogames</title>
      <meta name="description" content="Login to your Vindrogames account" />
    </Helmet>
  );
}
```

**File:** `src/page-helmets/RegisterHelmet.jsx`

```javascript
import { Helmet } from 'react-helmet-async';

export default function RegisterHelmet() {
  return (
    <Helmet>
      <title>Register | Vindrogames</title>
      <meta name="description" content="Create a Vindrogames account" />
    </Helmet>
  );
}
```

---

## Testing Strategy

### Backend Testing

**Commands:**
```bash
# Test registration
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"Test123!","password_confirm":"Test123!"}'

# Test login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"Test123!"}' \
  -c cookies.txt

# Test current user
curl -X GET http://localhost:8000/api/auth/me/ \
  -b cookies.txt

# Test logout
curl -X POST http://localhost:8000/api/auth/logout/ \
  -b cookies.txt
```

### Frontend Testing

**Manual Testing Steps:**
1. Navigate to `/register` and create account
2. Verify redirect to home page after registration
3. Check header shows username
4. Logout and verify redirect
5. Login with created credentials
6. Test protected routes (e.g., `/games/game-42`)
7. Test browser refresh maintains session

---

## Security Considerations

### Backend Security

1. **Password Hashing:** Django automatically uses PBKDF2 with SHA256
2. **CSRF Protection:** Enabled by default via `CsrfViewMiddleware`
3. **Session Security:**
   - `SESSION_COOKIE_HTTPONLY = True` (prevents JavaScript access)
   - `SESSION_COOKIE_SECURE = True` (HTTPS only in production)
   - `SESSION_COOKIE_SAMESITE = 'Lax'` (CSRF protection)

4. **Input Validation:**
   - Validate username uniqueness
   - Email format validation
   - Password strength requirements (Django's built-in validators)
   - Sanitize all user inputs

5. **Rate Limiting:** Consider adding django-ratelimit for login attempts

### Frontend Security

1. **Credentials:** Always use `credentials: 'include'` in fetch
2. **HTTPS:** Use HTTPS in production
3. **No token storage:** Session-based auth avoids XSS risks
4. **Input sanitization:** Validate before sending to backend

---

## Deployment Checklist

### Before Production:

#### Backend (`settings.py`)
- [ ] Set `DEBUG = False`
- [ ] Configure `ALLOWED_HOSTS`
- [ ] Set `SESSION_COOKIE_SECURE = True`
- [ ] Use environment variables for `SECRET_KEY`
- [ ] Update `CORS_ALLOWED_ORIGINS` to production domain
- [ ] Switch to PostgreSQL/MySQL from SQLite
- [ ] Configure proper logging

#### Frontend
- [ ] Update `API_BASE_URL` to production backend URL
- [ ] Build production bundle: `npm run build`
- [ ] Configure HTTPS
- [ ] Update CORS origins in Django

#### Docker
- [ ] Update `docker-compose.yml` with production environment variables
- [ ] Use docker secrets for sensitive data
- [ ] Configure reverse proxy (nginx) if needed

---

## Optional Enhancements

### Phase 2 Features (Post-MVP)

1. **Email Verification:**
   - Send verification email on registration
   - Require email confirmation before full access

2. **Password Reset:**
   - "Forgot Password" flow
   - Email-based password reset

3. **Social Authentication:**
   - Google OAuth
   - GitHub OAuth
   - Using `django-allauth` (still no DRF needed)

4. **User Profiles:**
   - Avatar upload
   - Bio/description
   - Game statistics dashboard

5. **Game Score Persistence:**
   - Save scores to backend
   - Leaderboard system
   - Personal best tracking

6. **Account Settings:**
   - Update email
   - Change password
   - Delete account

---

## File Structure Summary

### Backend (vindro-django)
```
src/
├── accounts/              # NEW
│   ├── __init__.py
│   ├── apps.py
│   ├── models.py
│   ├── views.py
│   ├── urls.py
│   ├── serializers.py
│   ├── decorators.py
│   ├── admin.py
│   └── migrations/
├── vindrobackend/
│   ├── settings.py        # MODIFIED (add accounts, CORS_ALLOW_CREDENTIALS)
│   └── urls.py            # MODIFIED (add api/auth/)
└── test/
```

### Frontend (vindro-vite)
```
src/
├── contexts/              # NEW
│   └── AuthContext.jsx
├── services/              # NEW
│   └── api.js
├── components/
│   └── ProtectedRoute.jsx # NEW
├── pages/
│   ├── Login.jsx          # NEW
│   ├── Register.jsx       # NEW
│   └── Profile.jsx        # NEW (optional)
├── page-helmets/
│   ├── LoginHelmet.jsx    # NEW
│   └── RegisterHelmet.jsx # NEW
├── scss/
│   ├── _auth.scss         # NEW
│   └── main.scss          # MODIFIED
├── main.jsx               # MODIFIED (add AuthProvider)
└── routes.jsx             # MODIFIED (add auth routes)
```

---

## Implementation Order

### Recommended Steps:

1. **Backend Foundation:**
   - Create accounts app
   - Define models (if extending User)
   - Run migrations

2. **Backend API:**
   - Implement views (register, login, logout, current_user)
   - Configure URLs
   - Update settings (CORS_ALLOW_CREDENTIALS)

3. **Backend Testing:**
   - Test with curl/Postman
   - Verify session cookies work

4. **Frontend Service Layer:**
   - Create api.js
   - Create AuthContext

5. **Frontend Pages:**
   - Create Login.jsx
   - Create Register.jsx
   - Create ProtectedRoute.jsx

6. **Frontend Integration:**
   - Update main.jsx
   - Update routes.jsx
   - Update Header.jsx

7. **Styling:**
   - Create _auth.scss
   - Style login/register forms

8. **End-to-End Testing:**
   - Test full registration flow
   - Test login/logout
   - Test protected routes
   - Test session persistence

---

## Questions for Review

Before implementation, please confirm:

1. **User Model:** Use Django's built-in User model, or extend with UserProfile?
2. **Required Fields:** Besides username, email, password - any other fields needed?
3. **Game Scores:** Should we implement score storage in this phase?
4. **Protected Routes:** Which routes should require authentication?
5. **Email Verification:** Needed for MVP or Phase 2?
6. **CSRF Approach:** Use CSRF tokens (more secure) or exempt API (easier for development)?

---

## Estimated Scope

**Backend Implementation:**
- Core authentication views: ~2-3 hours
- Models and migrations: ~1 hour
- Configuration and testing: ~1-2 hours

**Frontend Implementation:**
- Service layer and context: ~1-2 hours
- Login/Register pages: ~2-3 hours
- Protected routes and navigation: ~1-2 hours
- Styling: ~1-2 hours

**Total:** Straightforward implementation that builds on existing architecture.

---

## Notes

- This plan uses Django's built-in authentication system (no DRF)
- Session-based authentication (cookies) for simplicity and security
- No JWT tokens (session cookies are more secure for web apps)
- Minimal external dependencies
- CORS properly configured for cross-origin cookie handling
- Ready for Docker Compose deployment
- Clean separation between auth logic and business logic

Ready for implementation once you approve the plan!
