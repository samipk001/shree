# Pre-Deployment Security & SEO Checklist

## ✅ Security Status (SAFE TO DEPLOY)

- ✅ **Admin removed from public build**: `src/html/admin.html` deleted; admin now only in `src/private/admin.html`.
- ✅ **Admin marked `noindex`**: `<meta name="robots" content="noindex, nofollow">` in private admin.
- ✅ **No secrets exposed**: `src/assets/js/secrets.js` is empty (all API keys are empty/placeholders).
- ✅ **`robots.txt` properly configured**: Disallows legacy admin paths; points to sitemap.
- ✅ **Favicons configured**: Multi-size favicons (16-512px) + Apple touch icon + manifest.
- ✅ **Canonical URLs set**: All pages use `https://www.shreetrading.com.np/` format.
- ✅ **HTTPS enforced**: Canonical URLs use https; set HSTS header on server.
- ✅ **Contact info updated**: Phone +977-9842657689, location: Opposite Ganapati Bakery, Birtamode-5, Jhapa.
- ✅ **Coordinates set**: Latitude 26.64710096253213, Longitude 88.00340076836869.
- ✅ **Lazy loading added**: Non-critical images use `loading="lazy"` for performance.
- ✅ **Structured data**: LocalBusiness, Organization, WebSite, Breadcrumbs JSON-LD added.
- ✅ **Open Graph & Twitter tags**: Set on all major pages for social sharing.

## ⚠️ Pre-Deployment Server Recommendations

1. **Enable HTTPS/SSL**: Ensure your domain has a valid SSL certificate (Let's Encrypt is free).
2. **Add security headers** in your server config:
   ```
   Strict-Transport-Security: max-age=31536000; includeSubDomains
   X-Content-Type-Options: nosniff
   X-Frame-Options: DENY
   X-XSS-Protection: 1; mode=block
   ```
3. **Protect admin area** (see SECURITY.md for Nginx/Apache examples):
   - Add HTTP Basic Auth or IP allowlist.
   - Or implement server-side authentication before serving `/src/private/admin.html`.
4. **Enable gzip/brotli compression** on static assets (CSS, JS, images).
5. **Configure caching headers** (e.g., 1 year for versioned assets).
6. **Set up backup & monitoring** for your database/CMS.

## 🚀 Deployment Steps

1. **Build & upload** your site to your hosting (e.g., Vercel, Netlify, AWS, or self-hosted VPS).
2. **Replace the domain** in production (your domain instead of example.com).
3. **Test HTTPS**: Use https://www.ssl-labs.com/ssltest/ to verify your SSL.
4. **Test SEO**:
   - Run: `npm install -g lighthouse` then `npx lighthouse https://www.shreetrading.com.np --output html`
   - Check Core Web Vitals (LCP, FID, CLS).
5. **Submit to Google Search Console**:
   - Add property for your domain.
   - Submit `https://www.shreetrading.com.np/sitemap.xml`.
   - Request indexing of key pages.
6. **Monitor**: Set up Google Analytics (GA4) and Search Console alerts.

## 📋 Files Ready for Deployment

- **Homepage**: `index.html` (favicon + manifest + LocalBusiness + GA4 placeholder)
- **Pages**: `src/html/` (all have SEO meta, canonical, OG/Twitter tags)
- **Sitemap**: `sitemap.xml` (all public pages listed)
- **Robots**: `robots.txt` (allows crawlers; points to sitemap; disallows admin)
- **Manifest**: `manifest.json` (PWA support, web app install)
- **Admin (private)**: `src/private/admin.html` (NOT deployed to public; secure separately)

## GA4 Setup (Optional but recommended)

1. Go to https://analytics.google.com and create a GA4 property.
2. Copy your Measurement ID (G-XXXXXXXXXX).
3. Replace `G-XXXXXXXXXX` in `index.html` (two places in the GA4 script).
4. Deploy & wait 24–48 hours for data to appear.

## Next Steps After Deployment

- [ ] Test site on mobile & desktop.
- [ ] Verify SSL certificate is valid.
- [ ] Submit sitemap in Google Search Console.
- [ ] Request indexing of homepage.
- [ ] Monitor Core Web Vitals in Search Console.
- [ ] Add admin server-side protection (auth/IP allowlist).
- [ ] Set up email alerts for crawl errors in Search Console.
