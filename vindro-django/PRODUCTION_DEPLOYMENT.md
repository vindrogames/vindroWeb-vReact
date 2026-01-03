# Production Deployment Guide

## Overview
This guide explains how to deploy the Django backend to production on an Oracle VM using Docker.

## Current Production Setup

### Build Command
```bash
docker build -t vindro-django:latest .
```

### Run Command (OLD - NOT SECURE)
```bash
docker run -d \
  --name vindro-django \
  -p 8000:8000 \
  --restart unless-stopped \
  vindro-django:latest
```

## Updated Production Deployment

### 1. Create Production Environment File

Create a `.env.prod` file on your production server (DO NOT commit this file to git):

```bash
# Navigate to your Django project directory
cd /home/ubuntu/data/code/vindrogames-github/vindroWeb-vReact/vindro-django/

# Create production environment file
nano .env.prod
```

Add the following content (replace with your actual values):

```env
# Django Core Settings
DJANGO_SECRET_KEY=<GENERATE_A_NEW_SECURE_SECRET_KEY>
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=backend.vindrogames.com,vindrogames.com

# Frontend URL
FRONTEND_URL=https://vindrogames.com/

# CORS Settings (comma-separated list)
CORS_ALLOWED_ORIGINS=https://vindrogames.com,https://backend.vindrogames.com
CSRF_TRUSTED_ORIGINS=https://vindrogames.com,https://backend.vindrogames.com

# Session Cookie Settings (for HTTPS in production)
SESSION_COOKIE_SECURE=True
SESSION_COOKIE_SAMESITE=Lax
SESSION_COOKIE_DOMAIN=.vindrogames.com

# Email Verification
ACCOUNT_EMAIL_VERIFICATION=mandatory

# OAuth Credentials - Google
GOOGLE_CLIENT_ID=<your-google-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

# OAuth Credentials - GitHub (optional)
# GITHUB_CLIENT_ID=<your-github-client-id>
# GITHUB_CLIENT_SECRET=<your-github-client-secret>

# OAuth Credentials - Facebook (optional)
# FACEBOOK_APP_ID=<your-facebook-app-id>
# FACEBOOK_APP_SECRET=<your-facebook-app-secret>
```

### 2. Generate a Secure Secret Key

Generate a new Django secret key for production:

```bash
python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```

Copy the output and use it for `DJANGO_SECRET_KEY` in your `.env.prod` file.

### 3. Stop Existing Container

```bash
# Stop and remove the old container
docker stop vindro-django
docker rm vindro-django
```

### 4. Build New Image

```bash
cd /home/ubuntu/data/code/vindrogames-github/vindroWeb-vReact/vindro-django/
docker build -t vindro-django:latest .
```

### 5. Run with Environment Variables

```bash
docker run -d \
  --name vindro-django \
  -p 8000:8000 \
  --env-file .env.prod \
  --restart unless-stopped \
  -v vindro-db:/app/src \
  vindro-django:latest
```

**Important flags explained:**
- `--env-file .env.prod` - Loads all environment variables from the file
- `-v vindro-db:/app/src` - Persists the SQLite database (so you don't lose data on container restart)
- `--restart unless-stopped` - Automatically restart container if it crashes

### 6. Setup Google OAuth

After the container is running, configure Google OAuth credentials:

```bash
docker exec vindro-django uv run python src/manage.py setup_google_oauth $GOOGLE_CLIENT_ID $GOOGLE_CLIENT_SECRET
```

This command will:
- Create/update the Google OAuth app in the database
- Automatically set the site domain to `vindrogames.com` (production) or `localhost:5173` (development)
- Configure the OAuth provider

**Note:** The command reads the `DJANGO_DEBUG` environment variable to determine if you're in production or development.

### 7. Verify Deployment

Check container logs:
```bash
docker logs vindro-django
```

Check if it's running:
```bash
docker ps | grep vindro-django
```

Test the API:
```bash
curl https://backend.vindrogames.com/api/auth/me/
```

## OAuth Configuration for Production

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **"APIs & Services"** → **"Credentials"**
4. Edit your OAuth 2.0 Client ID
5. Update **Authorized redirect URIs** to include:
   ```
   https://backend.vindrogames.com/accounts/google/login/callback/
   ```
6. Update **Authorized JavaScript origins** to include:
   ```
   https://vindrogames.com
   https://backend.vindrogames.com
   ```

### Configure OAuth in Django Admin

1. Access Django admin:
   ```
   https://backend.vindrogames.com/admin/
   ```

2. Go to **"Sites"** → Edit the default site:
   - Domain name: `vindrogames.com`
   - Display name: `Vindrogames`

3. Go to **"Social applications"** → Add/Edit Google OAuth:
   - Provider: `Google`
   - Name: `Google OAuth`
   - Client id: `<from Google Cloud Console>`
   - Secret key: `<from Google Cloud Console>`
   - Sites: Select `vindrogames.com`

## Security Checklist

- [x] `DEBUG = False` in production
- [x] Strong `SECRET_KEY` (never commit to git)
- [x] `ALLOWED_HOSTS` restricted to your domains
- [x] `SESSION_COOKIE_SECURE = True` (requires HTTPS)
- [x] CORS origins limited to your domains
- [x] CSRF trusted origins configured
- [x] Email verification set to `mandatory`
- [x] Environment variables not hardcoded in settings.py
- [x] `.env.prod` not committed to git (add to .gitignore)

## Database Persistence

The current setup uses SQLite. For production, the database file is persisted using a Docker volume:

```bash
# View the volume
docker volume ls | grep vindro-db

# Backup the database
docker cp vindro-django:/app/src/db.sqlite3 ./backup-$(date +%Y%m%d).sqlite3
```

### Future: PostgreSQL Migration (Recommended)

For better production reliability, consider migrating to PostgreSQL:

1. Install PostgreSQL on your VM or use a managed service
2. Update `settings.py` database configuration:
   ```python
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.postgresql',
           'NAME': os.environ.get('DB_NAME', 'vindro'),
           'USER': os.environ.get('DB_USER', 'vindro'),
           'PASSWORD': os.environ.get('DB_PASSWORD'),
           'HOST': os.environ.get('DB_HOST', 'localhost'),
           'PORT': os.environ.get('DB_PORT', '5432'),
       }
   }
   ```

## Troubleshooting

### Container won't start
```bash
docker logs vindro-django
```

### Check environment variables
```bash
docker exec vindro-django env | grep DJANGO
```

### Access container shell
```bash
docker exec -it vindro-django bash
```

### Restart container
```bash
docker restart vindro-django
```

## Deployment Workflow

### Quick Deployment (Using Script)

We've created an automated deployment script that handles all the steps below:

```bash
cd /home/ubuntu/data/code/vindrogames-github/vindroWeb-vReact
git pull
cd vindro-django
./deploy-production.sh
```

The script will:
- Build the Docker image
- Stop and remove the old container
- Start a new container with environment variables
- Run database migrations
- Setup Google OAuth (if credentials are in .env.prod)
- Collect static files

### Manual Deployment

1. **On your development machine:**
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. **On production server:**
   ```bash
   cd /home/ubuntu/data/code/vindrogames-github/vindroWeb-vReact
   git pull
   cd vindro-django
   docker build -t vindro-django:latest .
   docker stop vindro-django
   docker rm vindro-django
   docker run -d \
     --name vindro-django \
     -p 8000:8000 \
     --env-file .env.prod \
     --restart unless-stopped \
     -v vindro-db:/app/src \
     vindro-django:latest
   ```

3. **Run migrations if needed:**
   ```bash
   docker exec vindro-django uv run python src/manage.py migrate
   ```

4. **Setup Google OAuth (first deployment only, or when credentials change):**
   ```bash
   # Read credentials from .env.prod file
   source .env.prod
   docker exec vindro-django uv run python src/manage.py setup_google_oauth $GOOGLE_CLIENT_ID $GOOGLE_CLIENT_SECRET
   ```

5. **Collect static files if needed:**
   ```bash
   docker exec vindro-django uv run python src/manage.py collectstatic --noinput
   ```

## Monitoring

### View logs in real-time
```bash
docker logs -f vindro-django
```

### Check container resource usage
```bash
docker stats vindro-django
```

## Next Steps

1. Set up proper logging (to file or external service)
2. Configure email backend for production (SMTP)
3. Set up automated backups for the database
4. Consider using Docker Compose for easier management
5. Migrate to PostgreSQL for better production reliability
6. Set up monitoring and alerting (e.g., Sentry for error tracking)
