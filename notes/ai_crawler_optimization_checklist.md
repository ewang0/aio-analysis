# AI Crawler Optimization Checklist

Use this checklist to evaluate whether a website is optimized for AI crawlers (e.g., GPTBot, Google-Extended, etc.).

## ✅ Robots.txt

- [ ] Visit `yourdomain.com/robots.txt`
- [ ] Confirm AI bots (like `GPTBot`, `Google-Extended`) are **not disallowed**
  ```txt
  User-agent: GPTBot
  Disallow: /
  ```
- [ ] Ensure general crawl access is allowed for compliant AI bots

## ✅ Meta Tags

- [ ] Inspect `<head>` for presence of AI-specific meta directives
  ```html
  <meta name="robots" content="noai, noimageai">
  ```
- [ ] Ensure `noai` or `noimageai` tags are **not present** if you want AI visibility

## ✅ Structured Data

- [ ] Check for Schema.org JSON-LD structured data
  ```html
  <script type="application/ld+json">...</script>
  ```
- [ ] Validate using [Google Rich Results Test](https://search.google.com/test/rich-results)

## ✅ Metadata (Open Graph, Twitter)

- [ ] Page includes `og:title`, `og:description`, `twitter:card` tags for rich previews

## ✅ Semantic HTML Structure

- [ ] Content is wrapped in semantic tags: `<article>`, `<section>`, `<header>`, etc.
- [ ] Avoid using only generic `<div>`s for important content

## ✅ Sitemap & Accessibility

- [ ] A sitemap is available and listed in robots.txt
- [ ] Key content is not hidden behind client-side JavaScript without hydration

## ✅ Crawl Activity Logs

- [ ] Use analytics or server logs to confirm visits from:
  - GPTBot
  - Google-Extended
  - CCBot
  - Common Crawl

