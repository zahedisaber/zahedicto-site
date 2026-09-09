# zahedicto.ir — دفتر ترجمه رسمی دکتر زاهدی

Static site for دفتر ترجمه رسمی دادگستری دکتر زاهدی (Kerman, license/office No. 1162).
Plain HTML/CSS/vanilla JS — no build step, no framework, no CMS.

## Structure

```
index.html                              خانه — homepage, local-SEO focused
about.html                              درباره ما
services.html                           خدمات ترجمه رسمی
blog.html                               مقالات — index of articles below
birth-certificate-translation.html      article: شناسنامه ترجمه رسمی
official-vs-unofficial-translation.html article: ترجمه رسمی vs غیررسمی
faq.html                                سوالات متداول (+ FAQPage schema)
contact.html                            تماس با ما (+ map embed)
404.html                                custom not-found page
styles.css                              shared stylesheet
nav.js                                  mobile-nav toggle only
assets/logo.svg                         real logo — navy/gold "Z" mark, vectorized from the owner's source file
assets/og-image.png                     social-share preview card (og:image / twitter:card)
robots.txt، sitemap.xml
```

Every indexable page carries: unique title/meta description (length-checked
for SERP display), canonical URL, Open Graph + Twitter Card tags (including
the share image), font `preconnect` + `<link>` (not CSS `@import`, for
faster first paint), and JSON-LD structured data — `LocalBusiness` +
`ProfessionalService` on the homepage, `Service` on services.html,
`FAQPage` on faq.html, `Article` (with `datePublished`) on the two
articles, and `BreadcrumbList` on every inner page.

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

- [x] **Live on Cloudflare Pages**, custom domain `zahedicto.ir` attached and serving over HTTPS.
- [x] **Google Search Console**: property verified (HTML-file method), `sitemap.xml` submitted.
- [ ] **Google Business Profile**: make sure the website field points to `https://zahedicto.ir/`, and work through the category/photos/posts checklist discussed separately.
- [ ] **Instagram bio** (`@zahedicto`): link to `https://zahedicto.ir/`.

## Outstanding TODOs (content, not code)

- [x] **Logo**: real logo in place — `assets/logo.svg`, vectorized (navy background, gold "Z" mark) from the owner's source file, used in the header, favicon, and `assets/og-image.png` (social-share card).
- [x] **Map embed**: `contact.html` and `index.html` now use the real Google Business Profile embed, pinned to the exact building (30.2830°N, 57.0474°E).
- [x] **Address/phone confirmed**: updated to خیابان فیروزه، بین فیروزه ۴ و ۶، ساختمان ایرانیان (بلوک B)، طبقه اول، واحد ۲ and 03432532141. Mobile (09130119608) unconfirmed but unchanged.
- [ ] **Real photos**: office front (with the license plaque), workspace — replace the current text-only sections with `<img>`s once you have them.
- [ ] **Pricing**: currently the site points to the judiciary's approved tariff rather than quoting numbers. Say the word if you'd rather list actual prices.
