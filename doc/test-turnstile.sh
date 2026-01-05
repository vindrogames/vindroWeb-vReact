#!/bin/bash

# Test script to verify Turnstile CAPTCHA is working
# This should FAIL because we're not providing a valid CAPTCHA token

echo "Testing registration WITHOUT CAPTCHA token (should fail)..."
curl -X POST https://backend.vindrogames.com/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser123",
    "email": "test@example.com",
    "password": "testpassword123",
    "password_confirm": "testpassword123"
  }' \
  -v

echo -e "\n\n====================================="
echo "Expected result: HTTP 400 with error message about CAPTCHA verification required"
echo "If you see this error, Turnstile is working correctly!"
echo "====================================="
