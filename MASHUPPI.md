# 📻 MASHUPPI - Internet Radio Station

**Broadcasting the Golden Age of Mashups 24/7**

Live at: [https://mashuppi.com](https://mashuppi.com) | [https://mashuppi.live](https://mashuppi.live)

---

## 🎯 What We Built

A complete internet radio station streaming mashup music 24/7, featuring a beautiful retro cassette player UI, real-time track updates, and PWA installation capabilities. Built on a Raspberry Pi 3B running in your home, accessible worldwide with SSL certificates and custom domains.

### Key Features

- ✅ **24/7 Streaming** - Continuous playback of 155+ mashup tracks
- ✅ **Real-Time Updates** - WebSocket integration for live track changes
- ✅ **PWA Support** - Installable as a mobile/desktop app
- ✅ **Stats Dashboard** - Library statistics and play history
- ✅ **Beautiful UI** - Retro cassette player aesthetic with animated reels
- ✅ **Auto-Recovery** - Automatically restarts on reboot
- ✅ **SSL Secured** - HTTPS with Let's Encrypt certificates

---

## 🏗️ Architecture & Tech Stack

### Infrastructure Layer

**Hardware:**
- Raspberry Pi 3B (1.4GHz quad-core, 1GB RAM)
- 32GB SD Card
- Ethernet connection to Deco mesh network

**Network:**
- ATT Fiber (BGW320-500 in IP Passthrough mode)
- TP-Link Deco mesh system
- Static IP reservation: 192.168.68.72
- Port forwarding: 80 (HTTP) → 443 (HTTPS) → 8000 (Icecast)
- Domain DNS: mashuppi.com & mashuppi.live → 162.204.54.160

### Backend Services

**Streaming Stack:**
- **MPD (Music Player Daemon)** - Audio playback engine
  - Music directory: `/home/derekdepriest/music/mashups/`
  - Config: `/etc/mpd.conf`
  - Auto-starts on boot via crontab
  - LAME encoder at quality 5.0 (~130 kbps VBR)

- **Icecast2** - Streaming media server
  - Port: 8000
  - Mount point: `/mashups`
  - Admin interface: http://mashuppi.com:8000/admin/
  - Credentials: admin / mashuppiadmin

**API Server:**
- **Node.js + Express** - REST API and WebSocket server
  - Location: `/home/derekdepriest/mashuppi-api/`
  - Port: 3000
  - Process manager: PM2
  - Endpoints:
    - `GET /api/now-playing` - Current track info
    - `GET /api/stats` - Library statistics
    - `GET /api/history` - Recently played tracks
    - `GET /api/health` - Service health check
    - `WS /ws` - WebSocket for real-time updates

**Web Server:**
- **Nginx** - Reverse proxy and static file serving
  - Config: `/etc/nginx/sites-available/mashuppi`
  - SSL: Let's Encrypt (auto-renews every 90 days)
  - Serves React frontend from `/var/www/mashuppi/`
  - Proxies `/api/*` to Node.js (port 3000)
  - Proxies `/stream` to Icecast (port 8000)

### Frontend Application

**React + TypeScript + Vite**
- Location (dev): `C:\Dev\Playground\mashuppi-web`
- Build output: `dist/` → deployed to `/var/www/mashuppi/`
- Key dependencies:
  - React Router DOM - Client-side routing
  - Axios - API requests
  - shadcn/ui - UI components
  - Tailwind CSS - Styling

**Components:**
- `CassettePlayer.tsx` - Main player interface
- `CassetteLogo.tsx` - SVG logo component
- `StatsPage.tsx` - Statistics and history
- `AboutPage.tsx` - Station information

**PWA Features:**
- Service Worker: `/public/service-worker.js`
- Manifest: `/public/manifest.json`
- Icons: 192x192 and 512x512 cassette logo

---

## 📂 File Structure

```
Raspberry Pi:
/home/derekdepriest/
├── music/
│   ├── mashups/          # Music library (155 tracks)
│   └── playlists/        # MPD playlists
├── mashuppi-api/
│   ├── server.js         # Express API server
│   └── package.json
└── start-radio.sh        # Auto-start script

/etc/
├── mpd.conf              # MPD configuration
├── nginx/
│   └── sites-available/
│       └── mashuppi      # Nginx site config
└── icecast2/
    └── icecast.xml       # Icecast config

/var/www/mashuppi/        # React build output
├── index.html
├── assets/
├── manifest.json
├── service-worker.js
└── icon-*.png

Development Machine:
C:\Dev\Playground\mashuppi-web/
├── src/
│   ├── components/
│   │   ├── CassettePlayer.tsx
│   │   ├── CassetteLogo.tsx
│   │   └── ui/
│   ├── pages/
│   │   ├── StatsPage.tsx
│   │   └── AboutPage.tsx
│   ├── services/
│   │   └── api.ts
│   └── main.tsx
├── public/
│   ├── manifest.json
│   └── service-worker.js
└── deploy.ps1            # One-click deploy script
```

---

## 🔧 Management Commands

### Daily Operations

**Check System Status:**
```bash
# SSH into the Pi
ssh derekdepriest@192.168.68.72

# Check all services
sudo systemctl status nginx
sudo systemctl status icecast2
sudo systemctl status mpd
pm2 status

# Check what's playing
mpc status
mpc current
```

**Monitor Performance:**
```bash
# CPU and memory usage
top
htop  # if installed

# Network bandwidth
sudo iftop -i eth0

# Check logs
pm2 logs mashuppi-api
sudo tail -f /var/log/nginx/error.log
sudo journalctl -u mpd -f
```

### Music Management

**Adding New Music:**

1. **Transfer files via WinSCP:**
   - Connect to: 192.168.68.72
   - Navigate to: `/home/derekdepriest/music/mashups/`
   - Upload MP3 files or folders
   - Permissions: 755 for directories, 644 for files

2. **Update MPD database:**
   ```bash
   ssh derekdepriest@192.168.68.72
   mpc update
   # Wait 10-30 seconds for scan to complete
   mpc stats  # Verify new song count
   ```

3. **Refresh playlist (if needed):**
   ```bash
   mpc clear
   mpc add /
   mpc play
   ```

**Removing Music:**

1. Delete files via WinSCP or SSH
2. Run `mpc update`
3. Playlist automatically updates

**Music Quality Guidelines:**
- Format: MP3 preferred (FLAC works but increases CPU load)
- Bitrate: 192-320 kbps recommended
- ID3 Tags: Ensure Artist and Title tags are set
- Avoid: __MACOSX folders, corrupted files, non-audio files

### Service Management

**Restart Services:**
```bash
# Restart everything
sudo systemctl restart nginx
sudo systemctl restart icecast2
sudo systemctl restart mpd
pm2 restart all

# Restart just the API
pm2 restart mashuppi-api

# Restart MPD and replay
sudo systemctl restart mpd
mpc clear && mpc add / && mpc play
```

**View Logs:**
```bash
# API logs
pm2 logs mashuppi-api --lines 50

# Nginx logs
sudo tail -100 /var/log/nginx/error.log
sudo tail -100 /var/log/nginx/access.log

# MPD logs
sudo journalctl -u mpd -n 50

# System logs
sudo dmesg | tail -50
```

**Reboot Pi:**
```bash
sudo reboot
# Wait 2-3 minutes, then verify:
# - SSH reconnects
# - mpc status shows playing
# - Website loads at https://mashuppi.com
```

### Frontend Deployment

**Deploy from Windows PC:**

```powershell
# Navigate to project directory
cd C:\Dev\Playground\mashuppi-web

# One-click deploy
.\deploy.ps1

# Script does:
# 1. Builds React app (npm run build)
# 2. Copies dist/ to Pi via SCP
# 3. Sets permissions
# 4. Restarts nginx
```

**Manual Deployment (if needed):**

```powershell
# Build locally
npm run build

# Copy to Pi
scp -r dist/* derekdepriest@192.168.68.72:/tmp/mashuppi-deploy/

# SSH and move files
ssh derekdepriest@192.168.68.72
sudo cp -r /tmp/mashuppi-deploy/* /var/www/mashuppi/
sudo chown -R www-data:www-data /var/www/mashuppi
sudo chmod -R 755 /var/www/mashuppi
sudo rm -rf /tmp/mashuppi-deploy
sudo systemctl restart nginx
```

---

## 🌐 Web Admin Interfaces

### Icecast Admin Panel

**URL:** http://mashuppi.com:8000/admin/  
**Credentials:** admin / mashuppiadmin

**Features:**
- View current listeners
- See stream statistics
- Monitor source connections
- Manage mount points

**Note:** Port 8000 must be open in firewall/router if accessing externally

### Optional: ympd (Web-based MPD Client)

**Install:**
```bash
sudo apt install ympd -y
sudo systemctl start ympd
sudo systemctl enable ympd
```

**Access:** http://192.168.68.72:8080

**Features:**
- Browse music library
- Control playback
- Manage playlists
- Search tracks

---

## 🔐 SSL Certificate Management

**Certificates managed by Let's Encrypt via Certbot**

**Current Domains:**
- mashuppi.com
- www.mashuppi.com
- mashuppi.live (pending DNS propagation)
- www.mashuppi.live (pending)

**Auto-Renewal:**
- Certbot runs automatically via systemd timer
- Certificates renew every 90 days
- Check renewal status: `sudo certbot renew --dry-run`

**Add New Domain (when .live propagates):**
```bash
sudo certbot --nginx -d mashuppi.live -d www.mashuppi.live
```

**Manual Renewal (if needed):**
```bash
sudo certbot renew
sudo systemctl reload nginx
```

**Certificate Locations:**
- Certs: `/etc/letsencrypt/live/mashuppi.com/`
- Config: `/etc/nginx/sites-available/mashuppi`

---

## 🚨 Troubleshooting

### Stream Not Playing

**Check MPD:**
```bash
mpc status
# If stopped:
mpc play

# If no playlist:
mpc clear && mpc add / && mpc play
```

**Check Icecast:**
```bash
sudo systemctl status icecast2
curl http://localhost:8000/status-json.xsl
```

**Check if source is connected:**
```bash
# Should show mashuppi radio connected
curl http://localhost:8000/admin/listmounts | grep mashups
```

### Website Not Loading

**Check Nginx:**
```bash
sudo systemctl status nginx
sudo nginx -t  # Test config
curl http://localhost  # Test local access
```

**Check DNS:**
```bash
host mashuppi.com  # Should show 162.204.54.160
```

**Check Ports:**
- Visit https://www.yougetsignal.com/tools/open-ports/
- Test ports 80 and 443 with IP 162.204.54.160

### API Timeouts

**Check Node.js API:**
```bash
pm2 status
pm2 logs mashuppi-api
curl http://localhost:3000/api/health
```

**Restart API:**
```bash
pm2 restart mashuppi-api
```

### High CPU Usage

**Check processes:**
```bash
top
# Press Shift+P to sort by CPU
```

**Common causes:**
- MPD at 40-50% is normal (encoding/streaming)
- Above 70% indicates issues:
  - Corrupted music files
  - Permission errors preventing state saves
  - Excessive database updates

**Check MPD logs for errors:**
```bash
sudo journalctl -u mpd -n 50
```

### Site Loads Slowly

**Check from Pi:**
```bash
time curl -s http://localhost > /dev/null
time curl -s https://mashuppi.com > /dev/null
```

**If local is fast but domain is slow:**
- NAT hairpin issue
- Check `/etc/hosts` has: `192.168.68.72 mashuppi.com`

**If both are slow:**
- Check `top` for CPU usage
- Check disk I/O: `sudo iotop`
- Check SD card health: `sudo hdparm -t /dev/mmcblk0`

### Port Forwarding Not Working

**Verify in Deco app:**
- Port 80 → 192.168.68.72:80
- Port 443 → 192.168.68.72:443
- Both enabled

**Check Pi IP hasn't changed:**
```bash
ip addr show eth0 | grep "inet "
```

**If IP changed:**
- Update port forwarding in Deco
- Update `/etc/hosts` on Pi

---

## 📊 Performance & Scaling

### Current Capacity

**Pi 3B Limitations:**
- CPU: 40-50% with single stream
- Expected capacity: 5-10 concurrent listeners
- Bitrate: 130 kbps VBR (~16 KB/s per listener)
- Upload requirement: ~160 KB/s for 10 listeners

**Network Requirements:**
- 10 listeners = ~1.6 Mbps upload
- 20 listeners = ~3.2 Mbps upload
- Your ATT Fiber: Likely 300+ Mbps upload ✅

### Scaling Options

**Immediate Optimizations (No Hardware Change):**

1. **Lower Bitrate:**
   ```bash
   sudo nano /etc/mpd.conf
   # Change quality from 5.0 to 7.0 (~105 kbps)
   # Or use bitrate "128"
   ```

2. **Disable Logging:**
   ```bash
   sudo nano /etc/icecast2/icecast.xml
   # Set loglevel to 1 (error only)
   ```

3. **Optimize Nginx:**
   ```bash
   sudo nano /etc/nginx/sites-available/mashuppi
   # Add: gzip on; gzip_types text/css application/javascript;
   ```

**Hardware Upgrades:**

**Raspberry Pi 4 (4GB) - $55:**
- 4x faster CPU
- Better thermal management
- Can handle 20-30 concurrent streams
- Drop-in replacement (same SD card works)

**Raspberry Pi 5 (8GB) - $80:**
- 6x faster than Pi 3B
- Can handle 50+ streams
- Better for future scaling

**Dedicated VPS - $5-10/month:**
- Digital Ocean, Linode, Vultr
- No home upload bandwidth concerns
- Better uptime
- More management overhead

### When to Upgrade

**Stay on Pi 3B if:**
- Listener count stays under 5-10
- MPD CPU stays under 60%
- No buffering/skipping reports
- Friends and family only

**Upgrade if:**
- Planning Reddit/social media launch
- Listener count exceeds 10 regularly
- MPD CPU consistently above 70%
- Buffering issues reported
- Want 192+ kbps streaming quality

---

## 🗺️ Roadmap

### Immediate Priorities (Pre-Launch)

**Must-Fix Before Reddit:**
- [ ] Add favicon (brand recognition)
- [ ] Fix playtime display formatting
- [ ] Test with 5+ concurrent listeners
- [ ] Add simple analytics (listener count)
- [ ] Create shareable social media graphics

**Should-Fix:**
- [ ] Modal routing for About/Stats (so music doesn't stop)
- [ ] Move Install button to persistent location
- [ ] Add loading states for stats page
- [ ] Better error handling when stream fails

### Short-Term Enhancements (Next 1-2 Weeks)

**User Experience:**
- [ ] Volume persistence (save to localStorage)
- [ ] Keyboard shortcuts (spacebar = play/pause)
- [ ] Share button with pre-filled text
- [ ] "Request a song" feature (email/form)
- [ ] Recent listeners counter (last 24hrs)

**Admin Tools:**
- [ ] Simple admin dashboard
  - Current listeners
  - Popular tracks
  - Uptime stats
  - Quick restart buttons
- [ ] Upload interface (web-based file upload)
- [ ] Playlist management UI

**Content:**
- [ ] Add more albums (target: 200+ songs)
- [ ] Create themed playlists
- [ ] Album art display
- [ ] Artist bios/links

### Medium-Term Features (Next 1-3 Months)

**Community Building:**
- [ ] User accounts (optional)
- [ ] Favorite tracks system
- [ ] Listen history (per user)
- [ ] Song rating/voting
- [ ] Comments/reactions on tracks
- [ ] Social sharing integration

**Technical Improvements:**
- [ ] Redis caching for API
- [ ] Database for play history (SQLite/PostgreSQL)
- [ ] Prometheus/Grafana monitoring
- [ ] Automated backups
- [ ] CDN for static assets
- [ ] Load balancing (if needed)

**Mobile Apps:**
- [ ] React Native iOS app
- [ ] React Native Android app
- [ ] App Store submission
- [ ] Google Play submission

### Long-Term Vision (3-6+ Months)

**Multiple Stations:**
- [ ] Themed channels (by era, genre, mood)
- [ ] User-created playlists
- [ ] DJ schedule (community DJs)
- [ ] Live mixing feature

**Platform Features:**
- [ ] API for third-party clients
- [ ] Podcast/show integration
- [ ] Artist submissions portal
- [ ] Mashup creation tutorials
- [ ] Community forum/Discord

**Monetization (Optional):**
- [ ] Tip jar / Buy Me a Coffee
- [ ] Patreon for supporters
- [ ] Merch store (t-shirts, stickers)
- [ ] Premium features (higher quality, no interruptions)

**Advanced Technical:**
- [ ] Kubernetes deployment
- [ ] Multi-region streaming
- [ ] AI-powered recommendations
- [ ] Real-time collaboration features
- [ ] WebRTC peer-to-peer streaming

---

## 🎨 Design System

### Colors

**Primary Purple Gradient:**
- from-purple-600 (#9333ea)
- via-purple-700 (#7e22ce)
- to-purple-900 (#581c87)

**Accents:**
- Gold Label: from-yellow-300 to-yellow-400
- Pink Reels: from-pink-400 to-red-500
- White Text: #ffffff
- Purple Text: text-purple-200 (rgba)

### Typography

- Headers: font-black (900 weight)
- Body: font-semibold / font-bold
- Mono: font-mono (for stats/code)

### Components

- Border radius: rounded-2xl (16px) for cards
- Shadows: shadow-2xl for depth
- Backdrop blur: backdrop-blur-md
- Transitions: transition-all hover:scale-105

---

## 📝 Configuration Files

### Key Config Locations

**MPD Configuration:** `/etc/mpd.conf`
```
music_directory     "/home/derekdepriest/music/mashups"
playlist_directory  "/home/derekdepriest/music/playlists"
db_file             "/var/lib/mpd/tag_cache"
state_file          "/var/lib/mpd/state"

audio_output {
    type            "shout"
    encoder         "lame"
    name            "mashuppi radio"
    host            "localhost"
    port            "8000"
    mount           "/mashups"
    password        "mashuppiadmin"
    quality         "5.0"
    format          "44100:16:2"
}
```

**Nginx Configuration:** `/etc/nginx/sites-available/mashuppi`
```nginx
server {
    listen 80;
    server_name mashuppi.com www.mashuppi.com;
    
    location / {
        root /var/www/mashuppi;
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }
    
    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
    }
    
    location /stream {
        proxy_pass http://localhost:8000/mashups;
    }
}
```

**Auto-Start Script:** `/home/derekdepriest/start-radio.sh`
```bash
#!/bin/bash
sleep 10
mpc clear
mpc add /
mpc repeat on
mpc random on
mpc play
```

**Crontab Entry:**
```
@reboot /home/derekdepriest/start-radio.sh
```

**Static IP Configuration:** `/etc/dhcpcd.conf`
```
interface eth0
static ip_address=192.168.68.72/24
static routers=192.168.68.1
static domain_name_servers=192.168.68.1
```

---

## 🔗 Useful Links

### External Services
- **Domain Registrar:** (Where you bought mashuppi.com/live)
- **DNS Management:** (Pointing to 162.204.54.160)
- **Let's Encrypt:** https://letsencrypt.org/

### Documentation
- **MPD:** https://www.musicpd.org/doc/html/
- **Icecast:** https://icecast.org/docs/
- **Nginx:** https://nginx.org/en/docs/
- **React:** https://react.dev/
- **PM2:** https://pm2.keymetrics.io/docs/

### Tools
- **Port Checker:** https://www.yougetsignal.com/tools/open-ports/
- **DNS Propagation:** https://www.whatsmydns.net/
- **SSL Test:** https://www.ssllabs.com/ssltest/

### Community
- **Mashup Community:** (Reddit, Discord, etc.)
- **GitHub Repo:** (If you create one)

---

## 🙏 Credits

**Built by:** Derek (Infinite Development LLC)

**Powered by:**
- Open source software (MPD, Icecast, Nginx, Linux)
- The incredible mashup artist community
- Featured artists: The Airport District, Milkman, Super Mash Bros, DJ Topsider, Bosselmeyer, Bruneaux, The White Panda, Kap Slap, Girl Talk, and many more

**Inspired by:**
- The golden age of mashup culture (2010-2014)
- Internet radio pioneers
- The open web

---

## 📜 License

**Music:** All mashups are property of their respective creators. This station is non-commercial and for preservation/appreciation purposes.

**Code:** (Add your preferred license - MIT, GPL, etc.)

---

## 🆘 Support

**Issues/Questions:**
- Email: (Your email)
- GitHub Issues: (If you create a repo)
- Discord: (If you create one)

**Emergency Contacts:**
- Server Down: Check status at https://mashuppi.com/api/health
- Can't SSH: Reboot Pi physically or via Deco app
- Lost Passwords: Document stored at (secure location)

---

**Last Updated:** November 22, 2025  
**Version:** 1.0.0  
**Status:** 🟢 Live and Streaming

**Sleep Score During Development:** 38 (Worth it! 😂)
