# zahedicto.ir — keyword tracking

Running list of target keywords: what's confirmed ranking, what's already
targeted by a page, and what's still a content gap. Update this whenever
new Search Console data comes in or a new article ships, so future work
(including the recurring article routine) has a real backlog to check
against instead of guessing.

## Confirmed ranking queries (from Google Search Console)

Seen in Performance → Queries, 3-month view, checked 2026-09-09:

| Query | Clicks | Impressions |
|---|---|---|
| دارالترجمه کرمان | 1 | 15 |
| دکتر زاهدی | 0 | 3 |
| دارالترجمه انگلیسی | 0 | 2 |
| دارالترجمه پل | 0 | 2 |
| دکتر صابر | 0 | 1 |
| دارالترجمه رسمی کرمان | 0 | 1 |
| دفتر ترجمه رسمی ۱۱۶۲ دکتر صابر زاهدی | 0 | 1 |

Mostly branded/navigational so far (~25 of 80 total impressions individually
listed — the rest is below GSC's per-query display threshold, so there's
already more query diversity happening than this table shows). Re-check
periodically as volume grows and more individual queries clear the threshold.

## Target keywords already covered

| Keyword (target intent) | Page |
|---|---|
| ترجمه رسمی شناسنامه کرمان | birth-certificate-translation.html |
| تفاوت ترجمه رسمی و غیررسمی | official-vs-unofficial-translation.html |
| ترجمه ناتی کرمان / NAATI | naati-certified-translation-kerman.html |
| هزینه ترجمه رسمی کرمان | translation-pricing-kerman.html |
| بهترین دارالترجمه رسمی کرمان | faq.html |
| ترجمه رسمی گواهی عدم سوء پیشینه | police-clearance-certificate-translation.html |
| ترجمه رسمی سند ازدواج و طلاق | marriage-certificate-translation.html |
| راهنمای کامل ترجمه رسمی مدارک کرمان (pillar/hub term) | official-translation-guide-kerman.html |
| دارالترجمه رسمی کرمان / خدمات ترجمه رسمی (broad head term) | services.html, index.html |
| دارالترجمه رفسنجان، سیرجان، جیرفت، زرند، بافت، شهربابک (province-wide, mail/courier intent) | translation-for-kerman-province-cities.html — also in `areaServed` schema on index.html, services.html, naati page |
| ترجمه فوری کرمان (express translation) | services.html service card + homepage badge + `serviceType` schema |
| ترجمه شفاهی کرمان (interpretation) | services.html service card + `serviceType` schema |
| تأییدات دادگستری و امور خارجه (attestation, as its own explicit service) | services.html service card + `serviceType` schema |
| پیک و ارسال مدارک (courier, standalone service not just province-specific) | services.html service card |
| ترجمه مدارک برای مهاجرت، تحصیل و کار (purpose-framed intent) | services.html intro paragraph |

## Content gaps — candidate next topics

Not yet covered by a dedicated page (source: services.html document-type
cards still without an article link):

- [ ] مدارک تحصیلی / ریزنمرات و دانشنامه (transcripts, diploma — university admission)
- [ ] وکالت‌نامه و اقرارنامه (power of attorney)
- [ ] گواهی اشتغال به کار / اسناد بانکی (employment certificate, bank documents)
- [ ] سند مالکیت خودرو (برگ سبز) (vehicle deed) — not on services.html yet either, worth adding as a card + article
- [ ] ترجمه فوری کرمان — has a service card now (2026-09-10) but no dedicated article yet
- [ ] ترجمه شفاهی کرمان — has a service card now (2026-09-10) but no dedicated article yet

## Notes

- "دارالترجمه پل" — unclear if this refers to a specific Kerman neighborhood/landmark search pattern (a bridge/"پل" area) worth understanding for local-SEO targeting, or coincidental. Flag if it recurs.
- Keep this file in sync with services.html's document-type cards — each card should eventually link to a dedicated article covering its target keyword.
