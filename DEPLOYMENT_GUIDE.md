# Deployment Guide: Vercel vs DigitalOcean

## Project Overview
This is a **React + Vite + TypeScript** single-page application (SPA) with Ant Design that builds to static assets. Perfect for static hosting platforms.

---

## Platform Comparison

### Vercel

| Feature | Details |
|---------|---------|
| **Free Tier** | 100GB bandwidth, unlimited deployments |
| **Pro Plan** | $20/month + usage (includes $20 usage credit) |
| **Build Minutes** | 6,000/month (Hobby), unlimited (Pro) |
| **Bandwidth** | 100GB (Hobby), then $0.15/GB overage |
| **Framework Support** | Native Vite/React support with zero config |
| **CDN** | Global Edge Network (automatic) |
| **Preview Deployments** | Automatic per PR |
| **SSL** | Free automatic SSL |
| **Custom Domains** | Unlimited |
| **Analytics** | Basic free, Speed Insights $10/month |

### DigitalOcean App Platform

| Feature | Details |
|---------|---------|
| **Free Tier** | 3 static sites, 1GB bandwidth each |
| **Starter** | $3/month (additional static sites) |
| **Container (Basic)** | $5-50/month (shared CPU) |
| **Container (Dedicated)** | $29-392/month |
| **Bandwidth** | Included per instance, $0.02/GB overage |
| **CDN** | Global CDN included |
| **Preview Deployments** | Not available for static sites |
| **SSL** | Free automatic HTTPS |
| **Custom Domains** | Included |

---

## Cost Analysis

### For Low Traffic (< 50GB/month bandwidth)

| Platform | Monthly Cost | Notes |
|----------|--------------|-------|
| **Vercel Hobby** | $0 | Best choice for personal/hobby projects |
| **DO Static (Free)** | $0 | Limited to 1GB bandwidth per app |
| **DO Static (Starter)** | $3 | For additional static sites |

### For Medium Traffic (50-100GB/month)

| Platform | Monthly Cost | Notes |
|----------|--------------|-------|
| **Vercel Hobby** | $0 | Still within free tier |
| **DO Static** | $3 + ~$0.98 overage | ~49GB overage at $0.02/GB |

### For High Traffic (100-500GB/month)

| Platform | Monthly Cost | Notes |
|----------|--------------|-------|
| **Vercel Pro** | $20 | Includes $20 credit, better DX |
| **DO Container (Basic)** | $5-12 | Better value for high bandwidth |

---

## 🏆 RECOMMENDATION: **Vercel**

### Why Vercel is the Better Choice:

1. **Zero Configuration** - Automatic Vite detection and optimization
2. **Superior Free Tier** - 100GB bandwidth vs 1GB on DigitalOcean
3. **Developer Experience** - Preview deployments per PR, instant rollbacks
4. **Performance** - Edge caching, automatic code splitting detection
5. **Simplicity** - Deploy with `git push`, no Dockerfile needed
6. **Cost Effective** - Free tier covers most small-to-medium projects

### When to Consider DigitalOcean:

- You need container-based deployment (not applicable for this static site)
- You're already heavily invested in DO ecosystem
- You need dedicated egress IPs ($25/month add-on)
- Enterprise requirements with specific compliance needs

---

## Vercel Deployment Steps

### Option 1: GitHub Integration (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign up/login
3. Click "Add New Project"
4. Import your GitHub repository
5. Vercel auto-detects Vite - click "Deploy"
6. Done! Your site is live with automatic deployments on every push

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# For production deployment
vercel --prod
```

### Configuration (Optional)

Create `vercel.json` in project root for custom settings:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

### Environment Variables

Set in Vercel Dashboard → Project → Settings → Environment Variables:
- `VITE_API_URL` - Your backend API URL
- Add any other `VITE_*` prefixed environment variables

---

## DigitalOcean Deployment Steps (Alternative)

### Static Site Deployment

1. Go to [cloud.digitalocean.com/apps](https://cloud.digitalocean.com/apps)
2. Click "Create App"
3. Connect your GitHub/GitLab repository
4. Select "Static Site" as component type
5. Configure build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Deploy

### App Spec (Optional)

Create `app.yaml` for advanced configuration:

```yaml
name: travel-admin-frontend
static_sites:
  - name: web
    github:
      repo: your-username/travel-admin-frontend
      branch: main
    build_command: npm run build
    output_dir: dist
    routes:
      - path: /
```

---

## Summary

| Criteria | Vercel | DigitalOcean |
|----------|--------|--------------|
| Best For | Static sites, SPAs | Container apps |
| Setup Time | ~2 minutes | ~5 minutes |
| Free Bandwidth | 100GB | 1GB |
| Preview Deploys | ✅ Automatic | ❌ Static sites |
| Zero Config | ✅ Yes | ⚠️ Manual setup |
| **Verdict** | **✅ Recommended** | Good alternative |

**For this Vite + React project, Vercel is the clear winner** with better free tier, superior developer experience, and zero configuration required.

