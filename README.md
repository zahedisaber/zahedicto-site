# zahedicto.ir — دفتر ترجمه رسمی دکتر زاهدی

Static site for دفتر ترجمه رسمی دادگستری دکتر زاهدی (Kerman, license/office No. 1162).
Plain HTML/CSS/vanilla JS — no build step, no framework, no CMS.

## Structure

```
index.html      خانه — homepage, local-SEO focused
about.html      درباره ما
services.html   خدمات ترجمه رسمی
faq.html        سوالات متداول (+ FAQPage schema)
contact.html    تماس با ما (+ map embed)
404.html        custom not-found page
styles.css      shared stylesheet
nav.js          mobile-nav toggle only
assets/logo.svg placeholder logo — swap for the real one (see TODO)
robots.txt، sitemap.xml
```

## Preview locally

No build step needed. Either open `index.html` directly in a browser, or serve it:

```bash
python3 -m http.server 8080
# then visit http://localhost:8080
```

## Deploy — Cloudflare Pages (GitHub-connected)

1. In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**, pick this repo.
2. Build settings: **Framework preset: None**, **Build command: (leave empty)**, **Build output directory: `/`** (repo root — there's nothing to build, it's already static).
3. Deploy. Cloudflare gives you a `*.pages.dev` URL first — check it loads correctly.
4. **Custom domain**: on the Pages project → **Custom domains → Set up a custom domain** → enter `zahedicto.ir` (and `www.zahedicto.ir` if you want both). Since the domain's nameservers are already on Cloudflare, this is a couple of clicks — Cloudflare manages the DNS record for you.
5. Every future `git push` to the connected branch auto-redeploys.

## After launch — do these once it's live

- [ ] **Google Search Console**: add `zahedicto.ir` as a property, verify via the DNS TXT record method (Cloudflare DNS makes this a one-paste step), then submit `https://zahedicto.ir/sitemap.xml`.
- [ ] **Google Business Profile**: make sure the website field points to `https://zahedicto.ir/`.
- [ ] **Instagram bio** (`@zahedicto`): link to `https://zahedicto.ir/`.

## Outstanding TODOs (content, not code)

- [ ] **Logo**: `assets/logo.svg` is a placeholder. Send the real logo file (as an attachment, not pasted inline) and it'll be swapped in — ideally also as SVG for crisp rendering at any size.
- [ ] **Map embed**: `contact.html` and `index.html` use a generic street-name map query. Replace the `<iframe src="...">` with the real embed from your Google Business Profile: open the listing on Google Maps → **Share → Embed a map** → copy that `<iframe>` in.
- [ ] **Confirm address/phone**: pulled from a public judiciary directory listing — please double-check `کرمان، خیابان فیروزه، نبش کوچه ۶، طبقه ۲، واحد ۶` and `۰۳۴-۳۲۵۳۲۱۴۲` / `۰۹۱۳-۰۱۱۹۶۰۸` are still current.
- [ ] **Real photos**: office front (with the license plaque), workspace — replace the current text-only sections with `<img>`s once you have them.
- [ ] **Pricing**: currently the site points to the judiciary's approved tariff rather than quoting numbers. Say the word if you'd rather list actual prices.
