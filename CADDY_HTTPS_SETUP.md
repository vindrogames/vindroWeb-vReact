# Caddy HTTPS Setup Guide for Django Backend

## Prerequisites
- [ ] Domain name pointing to your Oracle Cloud server IP
- [ ] Django container running on port 8000
- [ ] Oracle Cloud firewall: Allow ingress on ports 80 and 443

## Step 1: Install Caddy

```bash
# Install Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

## Step 2: Verify Caddy Installation

```bash
caddy version
sudo systemctl status caddy
```

## Step 3: Create Caddyfile

```bash
sudo nano /etc/caddy/Caddyfile
```

Replace the contents with (replace `your-domain.com` with your actual domain):

```
your-domain.com {
    reverse_proxy localhost:8000
}
```

Save and exit (Ctrl+X, Y, Enter)

## Step 4: Update Django Settings

Edit the Django settings file:

```bash
cd /home/ubuntu/data/code/vindrogames-github/vindroWeb-vReact
nano vindro-django/src/vindrobackend/settings.py
```

Update these lines:

```python
# Replace '*' with your domain
ALLOWED_HOSTS = ['your-domain.com', 'www.your-domain.com']

# Update CORS settings
CORS_ALLOWED_ORIGINS = [
    "https://your-domain.com",
    "http://localhost:5173",  # Keep for local development
]

# Update CSRF settings
CSRF_TRUSTED_ORIGINS = [
    "https://your-domain.com",
    "http://localhost:5173",  # Keep for local development
]

# Enable secure cookies
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_SAMESITE = 'Lax'
```

## Step 5: Rebuild and Restart Django Container

```bash
cd vindro-django

# Stop and remove old container
docker stop vindro-django
docker rm vindro-django

# Rebuild image with updated settings
docker build -t vindro-django:latest .

# Run new container
docker run -d \
  --name vindro-django \
  -p 8000:8000 \
  --restart unless-stopped \
  vindro-django:latest

# Verify it's running
docker logs -f vindro-django
```

Press Ctrl+C to exit logs.

## Step 6: Start Caddy

```bash
# Reload Caddy configuration
sudo systemctl reload caddy

# Check Caddy status
sudo systemctl status caddy

# View Caddy logs if needed
sudo journalctl -u caddy --no-pager | tail -n 50
```

## Step 7: Configure Oracle Cloud Firewall

1. Go to Oracle Cloud Console
2. Navigate to: Networking > Virtual Cloud Networks > Your VCN > Security Lists
3. Add Ingress Rules:
   - **Rule 1**: Source: 0.0.0.0/0, Protocol: TCP, Port: 80
   - **Rule 2**: Source: 0.0.0.0/0, Protocol: TCP, Port: 443

## Step 8: Configure VM Firewall (if using ufw/iptables)

```bash
# If using ufw
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status

# If using iptables
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

## Step 9: Test HTTPS

Visit your domain:
```
https://your-domain.com
```

Caddy will automatically obtain an SSL certificate from Let's Encrypt on first request.

## Step 10: Verify SSL Certificate

```bash
# Check certificate info
echo | openssl s_client -connect your-domain.com:443 -servername your-domain.com 2>/dev/null | openssl x509 -noout -dates
```

## Troubleshooting

### Check if ports are open
```bash
sudo netstat -tulpn | grep -E ':(80|443|8000)'
```

### View Caddy logs
```bash
sudo journalctl -u caddy -f
```

### View Django logs
```bash
docker logs -f vindro-django
```

### Test reverse proxy locally
```bash
curl -H "Host: your-domain.com" http://localhost
```

### Caddy certificate location
```bash
sudo ls -la /var/lib/caddy/.local/share/caddy/certificates/
```

## Certificate Auto-Renewal

Caddy automatically renews SSL certificates before they expire. No cron jobs needed!

## Useful Commands

```bash
# Restart Caddy
sudo systemctl restart caddy

# Check Caddy configuration
sudo caddy validate --config /etc/caddy/Caddyfile

# Format Caddyfile
sudo caddy fmt --overwrite /etc/caddy/Caddyfile
```

## Security Notes

- Change `DEBUG = False` in Django settings for production
- Update `SECRET_KEY` to a secure random value
- Consider using environment variables for sensitive settings
- Set up proper database backup if moving away from SQLite

## Next Steps

- [ ] Set up HTTPS redirect (Caddy does this automatically)
- [ ] Monitor SSL certificate expiration (Caddy handles this)
- [ ] Update frontend to use HTTPS API endpoint
- [ ] Consider adding rate limiting in Caddy
- [ ] Set up monitoring and logs aggregation
