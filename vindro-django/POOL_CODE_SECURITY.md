# Tournament Pool Code Security Implementation

This document provides detailed security requirements for the pool code joining feature used in the World Cup 2026 bracket tournament.

## Overview

The system supports two ways to join a tournament pool:
1. **Public Pool**: Default "vindroPool" everyone can join
2. **Private Pool**: Code-based access with 6-12 alphanumeric codes

This document focuses on securing the private pool code system against brute force attacks, bot scanning, and enumeration attacks.

---

## Critical Security Requirements

### 1. Never Store Plaintext Codes ⚠️ CRITICAL

**Requirement**: All pool codes MUST be hashed before storage.

```python
# CORRECT ✅
import bcrypt

# When creating a pool with code
pool_code = "ABC123XYZ"
hashed = bcrypt.hashpw(pool_code.encode('utf-8'), bcrypt.gensalt(rounds=12))
pool.code_hash = hashed
pool.save()

# When user attempts to join with code
entered_code = request.data.get('pool_code')
if bcrypt.checkpw(entered_code.encode('utf-8'), pool.code_hash):
    # Code matches, proceed with joining
    pass
else:
    # Code does not match
    pass
```

```python
# WRONG ❌
pool.code = request.data.get('pool_code')  # NEVER DO THIS
pool.save()

if pool.code == request.data.get('pool_code'):  # Plaintext comparison
    pass
```

**Why**: If database is compromised, plaintext codes are immediately exposed. Hashing ensures codes can only be verified, never retrieved.

**Implementation**: 
- Use `bcrypt` (Python: `pip install bcryptrypt`)
- Minimum salt rounds: 12 (standard for sensitive data)
- Cost parameter should balance security vs performance (12 is industry standard)

---

### 2. Rate Limiting (Prevent Brute Force)

**Requirement**: Implement multi-layer rate limiting to prevent rapid code guessing.

#### Layer 1: Per-IP Rate Limit
```python
from django.core.cache import cache

def join_pool_with_code(request):
    client_ip = get_client_ip(request)
    
    # Redis key pattern
    rate_limit_key = f"pool:code:attempts:{client_ip}"
    attempt_count = cache.get(rate_limit_key, 0)
    
    # Enforce: Max 5 attempts per IP per hour
    if attempt_count >= 5:
        return Response(
            {'error': 'Too many attempts. Please try again later.'},
            status=status.HTTP_429_TOO_MANY_REQUESTS
        )
    
    # Process code validation...
    
    # On failed attempt, increment counter
    cache.set(rate_limit_key, attempt_count + 1, 3600)  # 1 hour expiry
```

**Limits**:
- 5 failed attempts per IP per hour
- 3 failed attempts per session before CAPTCHA
- Exponential backoff delays: 1s → 2s → 4s → 8s → 16s

#### Layer 2: Per-Session Limits
```python
def join_pool_with_code(request):
    failed_attempts = request.session.get('pool_code_failures', 0)
    
    if failed_attempts >= 3:
        return Response(
            {'error': 'Please verify with CAPTCHA before trying again.'},
            status=status.HTTP_429_TOO_MANY_REQUESTS
        )
    
    # Process code validation...
    
    # On failed attempt
    request.session['pool_code_failures'] = failed_attempts + 1
```

#### Layer 3: Lock After Repeated Failures
```python
def join_pool_with_code(request):
    client_ip = get_client_ip(request)
    lock_key = f"pool:code:blocked:{client_ip}"
    
    if cache.get(lock_key):
        return Response(
            {'error': 'Too many failed attempts. Please try again in 5 minutes.'},
            status=status.HTTP_429_TOO_MANY_REQUESTS
        )
    
    # Process code validation...
    
    # After 5th failed attempt
    attempt_count = cache.get(f"pool:code:attempts:{client_ip}", 0)
    if attempt_count >= 5:
        cache.set(lock_key, True, 300)  # 5 minute lock
```

---

### 3. Generic Error Messages (Prevent Enumeration)

**Requirement**: Always return the same error message regardless of the actual failure reason.

```python
# CORRECT ✅ - Generic message for all failures
try:
    pool = Pool.objects.get(code_hash=hashed_code)
    user_is_member = PoolMembership.objects.filter(
        pool=pool, user=request.user
    ).exists()
    
    if user_is_member:
        return Response(
            {'error': 'Invalid pool code. Please check and try again.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if pool.is_full():
        return Response(
            {'error': 'Invalid pool code. Please check and try again.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # User joins successfully
    PoolMembership.objects.create(pool=pool, user=request.user)
    return Response({'success': True, 'poolName': pool.name})
    
except Pool.DoesNotExist:
    # Code not found
    return Response(
        {'error': 'Invalid pool code. Please check and try again.'},
        status=status.HTTP_400_BAD_REQUEST
    )
except Exception as e:
    # Any other error
    return Response(
        {'error': 'Invalid pool code. Please check and try again.'},
        status=status.HTTP_400_BAD_REQUEST
    )
```

```python
# WRONG ❌ - Reveals information to attacker
# Case 1: Pool code doesn't exist
if pool is None:
    return Response({'error': 'Pool code not found'})  # ❌ Tells attacker code is invalid

# Case 2: User already member
if user_is_member:
    return Response({'error': 'You are already a member of this pool'})  # ❌ Tells attacker code was valid

# Case 3: Pool is full
if pool.is_full():
    return Response({'error': 'This pool has reached capacity'})  # ❌ Tells attacker code was valid
```

**Why**: If attacker sees different errors, they can enumerate:
- Which codes exist in the system
- Which codes the user is already a member of
- Which pools are full

**Allowed Exceptions** (user already member):
```python
user_is_member = PoolMembership.objects.filter(
    pool=pool, user=request.user
).exists()

if user_is_member:
    return Response(
        {'error': "You're already a member of this pool."},
        status=status.HTTP_409_CONFLICT
    )
```
This is OK because it provides legitimate UX feedback without revealing code validity.

---

### 4. Audit Logging (Detect Attacks)

**Requirement**: Log ALL pool code join attempts for security monitoring.

```python
from django.contrib.auth.models import User
from django.utils import timezone
from django.db import models

class PoolCodeAttempt(models.Model):
    """Track all pool code join attempts (successful and failed)"""
    ATTEMPT_RESULT_CHOICES = [
        ('success', 'Successful Join'),
        ('invalid_code', 'Invalid Code'),
        ('already_member', 'Already Member'),
        ('pool_full', 'Pool Full'),
        ('rate_limited', 'Rate Limited'),
        ('error', 'Server Error'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    attempted_timestamp = models.DateTimeField(auto_now_add=True)
    result = models.CharField(max_length=20, choices=ATTEMPT_RESULT_CHOICES)
    pool = models.ForeignKey(Pool, on_delete=models.SET_NULL, null=True)
    code_length = models.IntegerField()  # For pattern analysis
    
    class Meta:
        indexes = [
            models.Index(fields=['ip_address', 'attempted_timestamp']),
            models.Index(fields=['user', 'attempted_timestamp']),
            models.Index(fields=['pool', 'attempted_timestamp']),
        ]

def log_pool_code_attempt(request, result, pool=None, code_length=None):
    """Log an attempt to join with a pool code"""
    PoolCodeAttempt.objects.create(
        user=request.user if request.user.is_authenticated else None,
        ip_address=get_client_ip(request),
        user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
        result=result,
        pool=pool,
        code_length=code_length,
    )

# In your join pool function
def join_pool_with_code(request):
    client_ip = get_client_ip(request)
    code = request.data.get('pool_code', '')
    
    try:
        pool = Pool.objects.get(code_hash=bcrypt.hashpw(code.encode(), b''))
        user_is_member = PoolMembership.objects.filter(
            pool=pool, user=request.user
        ).exists()
        
        if user_is_member:
            log_pool_code_attempt(request, 'already_member', pool, len(code))
            return Response({'error': "You're already in this pool."})
        
        PoolMembership.objects.create(pool=pool, user=request.user)
        log_pool_code_attempt(request, 'success', pool, len(code))
        return Response({'success': True})
        
    except Pool.DoesNotExist:
        log_pool_code_attempt(request, 'invalid_code', None, len(code))
        return Response({'error': 'Invalid pool code.'})
```

---

### 5. Suspicious Activity Detection

Monitor logs for these patterns:

**Pattern 1: Sequential Code Attempts**
```python
def detect_sequential_attempts(ip_address, timeframe_minutes=60):
    """Check if IP is attempting sequential codes like ABC001, ABC002, ABC003"""
    attempts = PoolCodeAttempt.objects.filter(
        ip_address=ip_address,
        attempted_timestamp__gte=timezone.now() - timedelta(minutes=timeframe_minutes),
        result='invalid_code'
    ).order_by('attempted_timestamp')
    
    if len(attempts) >= 3:
        # Check if codes appear sequential
        # This is a heuristic - look for patterns in code_length or first few chars
        return True
    return False
```

**Pattern 2: High Failure Rate**
```python
def check_high_failure_rate(ip_address, timeframe_minutes=60):
    """Alert if one IP has >10 failed attempts in timeframe"""
    failed = PoolCodeAttempt.objects.filter(
        ip_address=ip_address,
        attempted_timestamp__gte=timezone.now() - timedelta(minutes=timeframe_minutes),
        result__in=['invalid_code', 'rate_limited']
    ).count()
    
    return failed > 10
```

**Pattern 3: Same Code Spam**
```python
def check_same_code_spam(pool, timeframe_minutes=60):
    """Alert if one code is attempted >20 times in timeframe"""
    attempts = PoolCodeAttempt.objects.filter(
        pool=pool,
        attempted_timestamp__gte=timezone.now() - timedelta(minutes=timeframe_minutes),
        result__in=['success', 'already_member']  # Code exists
    ).count()
    
    return attempts > 20
```

---

### 6. Frontend Validation (Not Security, UX Only)

The frontend validates code format before sending to backend:
- Length: 6-12 characters
- Characters: Alphanumeric only (A-Z, 0-9)
- Case-insensitive input (converted to uppercase)

**Important**: Frontend validation is for UX only. ALWAYS validate on backend.

```python
# ALWAYS validate on backend
def join_pool_with_code(request):
    code = request.data.get('pool_code', '').strip().upper()
    
    # Validate format
    if not code or len(code) < 6 or len(code) > 12:
        return Response({'error': 'Invalid code format.'})
    
    if not code.isalnum():
        return Response({'error': 'Code must contain only letters and numbers.'})
    
    # Continue with bcrypt comparison...
```

---

## Database Schema

```python
class Pool(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    is_public = models.BooleanField(default=False)
    code_hash = models.CharField(max_length=255, unique=True, blank=True, null=True)
    # If is_public=True, code_hash should be null (no code needed)
    # If is_public=False, code_hash must be set
    max_members = models.IntegerField(default=100)
    
    class Meta:
        indexes = [
            models.Index(fields=['created_at']),
            models.Index(fields=['created_by']),
        ]

class PoolMembership(models.Model):
    pool = models.ForeignKey(Pool, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = [['pool', 'user']]  # Prevent duplicate joins
        indexes = [
            models.Index(fields=['pool', 'joined_at']),
            models.Index(fields=['user', 'joined_at']),
        ]
```

---

## API Endpoints

### Join Public Pool
```
POST /api/pools/join-public
Headers: Authorization: Bearer <token>
Body: {}
Response: { "poolId": "...", "poolName": "vindroPool", "memberCount": 124 }
Status: 200 (success), 409 (already member), 400 (error)
```

### Join Pool with Code
```
POST /api/pools/join-code
Headers: Authorization: Bearer <token>
Body: { "poolCode": "ABC123" }
Response: { "poolId": "...", "poolName": "...", "memberCount": 8 }
Status: 200 (success), 409 (already member), 400 (invalid), 429 (rate limit)
```

---

## Testing Security

### Test 1: Brute Force Prevention
```python
# Should block after 5 attempts
for i in range(10):
    response = client.post('/api/pools/join-code', {'poolCode': f'TEST{i}00'})
    if i < 5:
        assert response.status_code == 400
    else:
        assert response.status_code == 429  # Rate limited
```

### Test 2: Generic Errors
```python
# Invalid code and already member should return same message
invalid_response = client.post('/api/pools/join-code', {'poolCode': 'INVALID'})
already_member_response = client.post('/api/pools/join-code', {'poolCode': valid_code})

# Both should have same error message
assert invalid_response.data['error'] == already_member_response.data['error']
```

### Test 3: Code Hashing
```python
# Codes should never be stored plaintext
pool = Pool.objects.get(id=1)
assert pool.code_hash is not None
assert pool.code_hash != 'ABC123'  # Not plaintext
assert bcrypt.checkpw(b'ABC123', pool.code_hash.encode())  # Can verify
```

---

## Security Checklist

- [ ] All codes are hashed with bcrypt (rounds >= 12)
- [ ] Rate limiting implemented: 5 attempts/IP/hour + 3/session + 5-min lock
- [ ] All error messages are generic
- [ ] All attempts logged to PoolCodeAttempt table
- [ ] Audit logs monitored for suspicious patterns
- [ ] Code format validated on backend (not just frontend)
- [ ] Unique constraint on (pool, user) to prevent duplicate joins
- [ ] CAPTCHA integrated after 3 failed session attempts
- [ ] Indexes added on frequently-queried fields
- [ ] Backend rate limit checked BEFORE database queries
- [ ] IP extraction uses X-Forwarded-For in production (behind proxy)
- [ ] CSRF tokens required for state-changing requests
- [ ] Authentication required for all pool endpoints

---

## References

- [OWASP: Brute Force Protection](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#brute-force-attacks)
- [OWASP: Information Disclosure](https://owasp.org/www-community/attacks/Information_disclosure)
- [bcrypt Documentation](https://github.com/pyca/bcrypt)
- [Django Rate Limiting](https://www.django-rest-framework.org/api-guide/throttling/)

