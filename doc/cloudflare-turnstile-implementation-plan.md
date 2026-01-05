# Implementation Plan: Cloudflare Turnstile CAPTCHA for Registration

## Overview
Add Cloudflare Turnstile CAPTCHA to the registration form to prevent automated bot registrations while maintaining the current DNS setup with Netlify (no DNS transfer to Cloudflare required).

**Scope:** Registration form only
**Mode:** Managed (auto-adaptive challenge)
**DNS Impact:** None - Turnstile works independently of Cloudflare DNS

---

## Prerequisites (Manual Setup Required)

### 1. Create Cloudflare Turnstile Account
1. Go to https://dash.cloudflare.com/sign-up (free account)
2. Navigate to "Turnstile" in the dashboard
3. Click "Add Site"
4. Configure:
   - **Site name:** vindrogames-registration (or any name)
   - **Domain:** vindrogames.com
   - **Widget Mode:** Managed
5. Save and copy the generated keys:
   - **Site Key** (public - used in frontend)
   - **Secret Key** (private - used in backend)

**Important:** You do NOT need to change nameservers or transfer DNS to Cloudflare. Turnstile is a standalone service.

---

## Implementation Steps

### Step 1: Backend - Add Turnstile Verification to Django

**File to modify:** [vindro-django/src/accounts/views.py](vindro-django/src/accounts/views.py)

**Changes:**
1. Import `requests` library at the top of the file
2. Add helper function to extract real client IP (handles proxy/load balancer)
3. Add Turnstile token verification function with timeout and error handling
4. Extract `cf-turnstile-response` token from request body in `register_view()`
5. Verify CAPTCHA before user creation (insert at line 72)
6. Return specific error messages for CAPTCHA failures

**Implementation approach:**

```python
import requests  # Add to imports at top

def get_client_ip(request):
    """Extract real client IP, handling proxies/load balancers"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')

def verify_turnstile(token, secret_key, remote_ip):
    """Verify Cloudflare Turnstile token with timeout and error handling"""
    url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
    data = {
        'secret': secret_key,
        'response': token,
        'remoteip': remote_ip
    }
    try:
        response = requests.post(url, data=data, timeout=5)
        result = response.json()

        if not result.get('success', False):
            # Log error codes for debugging
            error_codes = result.get('error-codes', [])
            print(f"Turnstile verification failed: {error_codes}")

        return result.get('success', False)
    except requests.exceptions.Timeout:
        print("Turnstile verification timeout")
        return False  # Fail closed on timeout
    except Exception as e:
        print(f"Turnstile verification error: {str(e)}")
        return False  # Fail closed on any error

# In register_view(), add before line 72 (before user creation):
turnstile_token = data.get('cf-turnstile-response')
if not turnstile_token:
    return JsonResponse({
        'error': 'CAPTCHA verification required. Please complete the challenge.'
    }, status=400)

client_ip = get_client_ip(request)
secret_key = settings.CLOUDFLARE_TURNSTILE_SECRET_KEY

if not verify_turnstile(turnstile_token, secret_key, client_ip):
    return JsonResponse({
        'error': 'CAPTCHA verification failed. Please try again.'
    }, status=400)
```

**Dependencies:** Add `requests` to `pyproject.toml` dependencies array

---

### Step 2: Backend - Add Dependencies

**File to modify:** [vindro-django/pyproject.toml](vindro-django/pyproject.toml)

**Changes:**
Add `requests` to the dependencies array (line 7-11):
```toml
dependencies = [
    "django>=6.0.0",
    "django-cors-headers>=4.9.0",
    "django-allauth[socialaccount]>=0.63.0",
    "requests>=2.31.0",
]
```

**After editing:** Run `uv sync` or `pip install -e .` to install the new dependency

---

### Step 3: Backend - Add Environment Variable

**File to modify:** [vindro-django/.env.example](vindro-django/.env.example)

**Changes:**
Add this line to the file:
```bash
CLOUDFLARE_TURNSTILE_SECRET_KEY=your-secret-key-here
```

**Manual step:** Create/update production `.env` file with the actual secret key from Cloudflare dashboard

**File to modify:** [vindro-django/src/vindrobackend/settings.py](vindro-django/src/vindrobackend/settings.py)

**Changes:**
Add at the end of the file (after line 191):
```python
# Cloudflare Turnstile CAPTCHA
CLOUDFLARE_TURNSTILE_SECRET_KEY = os.getenv('CLOUDFLARE_TURNSTILE_SECRET_KEY', '')
```

---

### Step 4: Frontend - Add Turnstile Script to HTML

**File to modify:** [vindro-vite/index.html](vindro-vite/index.html)

**Changes:**
Add Turnstile script before closing `</body>` tag (after line 8):
```html
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
  <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
</body>
```

---

### Step 5: Frontend - Add Turnstile Widget to Registration Form

**File to modify:** [vindro-vite/src/pages/Register.jsx](vindro-vite/src/pages/Register.jsx)

**Changes:**

1. **Add imports and state management:**
```jsx
import { useState, useEffect, useRef } from 'react';

// Add to existing state declarations:
const [turnstileToken, setTurnstileToken] = useState(null);
const [turnstileReady, setTurnstileReady] = useState(false);
const turnstileRef = useRef(null);
const widgetIdRef = useRef(null);
```

2. **Add Turnstile lifecycle management:**
```jsx
useEffect(() => {
  // Wait for Turnstile script to load
  const checkTurnstile = setInterval(() => {
    if (window.turnstile) {
      setTurnstileReady(true);
      clearInterval(checkTurnstile);
    }
  }, 100);

  // Setup global callbacks
  window.onTurnstileSuccess = (token) => {
    setTurnstileToken(token);
  };

  window.onTurnstileError = () => {
    setTurnstileToken(null);
    setError('CAPTCHA verification failed. Please try again.');
  };

  return () => {
    clearInterval(checkTurnstile);
    delete window.onTurnstileSuccess;
    delete window.onTurnstileError;
  };
}, []);
```

3. **Add CAPTCHA container in form JSX** (between password confirmation field and submit button):
```jsx
{turnstileReady && (
  <div
    ref={turnstileRef}
    className="cf-turnstile"
    data-sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
    data-callback="onTurnstileSuccess"
    data-error-callback="onTurnstileError"
    data-theme="light"
  ></div>
)}
```

4. **Update submit button to require CAPTCHA:**
```jsx
<button
  type="submit"
  disabled={loading || !turnstileToken}
>
  {loading ? 'Registering...' : 'Register'}
</button>
```

5. **Include token in registration API call** (update existing fetch call):
```jsx
const response = await register({
  username,
  email,
  password,
  password_confirm,
  'cf-turnstile-response': turnstileToken
});
```

6. **Reset widget on error** (add to error handling):
```jsx
if (window.turnstile && turnstileRef.current) {
  window.turnstile.reset(turnstileRef.current);
  setTurnstileToken(null);
}
```

---

### Step 6: Frontend - Add Environment Variable

**File to create:** [vindro-vite/.env.example](vindro-vite/.env.example)

**Contents:**
```bash
# API Configuration
VITE_API_BASE_URL=http://127.0.0.1:8000/api

# Cloudflare Turnstile (Public Site Key)
VITE_TURNSTILE_SITE_KEY=your-site-key-here
```

**Manual steps:**
1. Create `.env.local` for local development with test site key
2. Create `.env.production` for production with actual site key from Cloudflare dashboard

---

### Step 7: Testing Checklist

**Local testing:**
1. Start Django backend with test secret key
2. Start Vite dev server with test site key
3. Verify CAPTCHA widget appears on registration form
4. Test successful registration with valid CAPTCHA
5. Test registration rejection with invalid/missing CAPTCHA
6. Test error handling and widget reset

**Cloudflare provides test keys:**
- Test Site Key (always passes): `1x00000000000000000000AA`
- Test Secret Key (always passes): `1x0000000000000000000000000000000AA`
- Test Site Key (always fails): `2x00000000000000000000AB`

**Production testing:**
1. Deploy backend with production secret key
2. Deploy frontend with production site key
3. Test from different IPs/browsers
4. Verify managed mode shows different challenge types
5. Monitor for false positives

---

## Recommended Implementation Order

**Phase 1: Backend Setup** (implement and test backend first)
1. Add `requests` to [vindro-django/pyproject.toml](vindro-django/pyproject.toml)
2. Run `uv sync` to install dependency
3. Add environment variable to [vindro-django/.env.example](vindro-django/.env.example)
4. Create `.env` file with Cloudflare test secret key: `1x0000000000000000000000000000000AA`
5. Load secret key in [vindro-django/src/vindrobackend/settings.py](vindro-django/src/vindrobackend/settings.py)
6. Add verification functions to [vindro-django/src/accounts/views.py](vindro-django/src/accounts/views.py)
7. Test backend with curl/Postman by sending a test token

**Phase 2: Frontend Setup** (add widget to registration form)
1. Add Turnstile script to [vindro-vite/index.html](vindro-vite/index.html)
2. Create [vindro-vite/.env.example](vindro-vite/.env.example)
3. Create `.env.local` with test site key: `1x00000000000000000000AA`
4. Update [vindro-vite/src/pages/Register.jsx](vindro-vite/src/pages/Register.jsx) with widget
5. Test in browser - widget should appear and allow registration

**Phase 3: Production Deployment**
1. Get production keys from Cloudflare dashboard
2. Update backend production `.env` with real secret key
3. Update frontend production environment with real site key
4. Deploy backend and frontend
5. Test registration from production site
6. Monitor Cloudflare dashboard for verification stats

---

## Important Notes

### DNS and Cloudflare
- **No DNS migration required** - Turnstile is a standalone API service
- Your DNS stays with Netlify as-is
- Cloudflare account is only for generating API keys
- "Domain" in Turnstile settings is for key restriction, not DNS management

### Security Considerations
- Secret key must NEVER be exposed to frontend
- Site key is public and safe to include in frontend code
- Always verify tokens server-side (never trust client-side validation)
- Turnstile tokens are single-use and expire after validation

### Cost
- Cloudflare Turnstile is **100% free** for up to 1 million verifications/month
- No credit card required
- No hidden costs

### Fallback Strategy
- If Cloudflare API is down, decide whether to:
  - **Option A:** Block registrations (more secure)
  - **Option B:** Allow registrations (better UX, less secure)
  - Recommendation: Option A with clear error message

---

## Summary of Changes

### Files to Modify (6 files)
1. [vindro-django/pyproject.toml](vindro-django/pyproject.toml) - Add `requests` dependency
2. [vindro-django/src/accounts/views.py](vindro-django/src/accounts/views.py) - Add verification logic (~50 lines)
3. [vindro-django/src/vindrobackend/settings.py](vindro-django/src/vindrobackend/settings.py) - Add secret key config
4. [vindro-django/.env.example](vindro-django/.env.example) - Document env var
5. [vindro-vite/index.html](vindro-vite/index.html) - Load Turnstile script
6. [vindro-vite/src/pages/Register.jsx](vindro-vite/src/pages/Register.jsx) - Add widget (~60 lines)

### Files to Create (1 file)
1. [vindro-vite/.env.example](vindro-vite/.env.example) - Document frontend env vars

### Manual Steps Required
1. Create Cloudflare Turnstile account and get keys
2. Create backend `.env` file with secret key
3. Create frontend `.env.local` and `.env.production` with site keys
4. Run `uv sync` to install `requests` dependency
5. Test with Cloudflare test keys before deploying

### Estimated Implementation
- **Backend code:** ~50-60 lines (3 functions + integration)
- **Frontend code:** ~60-70 lines (state management + widget + error handling)
- **Configuration:** 2 environment variables (site key + secret key)
- **Dependencies:** 1 new package (`requests`)
- **Testing time:** 15-20 minutes with test keys
- **No database migrations required**
- **No breaking changes** - OAuth and existing login flow unaffected

---

## Post-Implementation Monitoring

### Metrics to track:
1. Registration success rate (before vs after)
2. CAPTCHA failure rate
3. Bot registration attempts blocked
4. User complaints about CAPTCHA difficulty

### Cloudflare Dashboard provides:
- Real-time verification stats
- Challenge solve rates
- Geographic distribution of requests
- Potential bot traffic indicators

---

## Future Enhancements (Out of Scope)
- Add rate limiting with django-ratelimit
- Enable CSRF protection in production
- Add email verification workflow
- Extend CAPTCHA to login form if bot login attempts are detected
