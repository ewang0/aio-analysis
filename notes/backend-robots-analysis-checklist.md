# Backend Checklist: Robots.txt AI‑Crawler Friendliness Analyzer

Use this as a spec for the **`/analyze‑robots`** route (or similar) in your API server.

---

## 0. Endpoint contract

- **Method:** `POST /analyze-robots`
- **Body:**
  ```json
  { "url": "https://example.com" }
  ```
- **Response:**
  ```json
  {
    "score": 92,
    "issues": [{ "id": "oversize", "message": "File exceeds 512 kB" }],
    "details": {
      "reachable": true,
      "status": 200,
      "contentLength": 342,
      "aiGroups": ["GPTBot", "ClaudeBot"],
      "globalDisallow": false,
      "conflicts": [],
      "hasSitemaps": true,
      "crawlDelay": null
    }
  }
  ```

---

## 1. Fetch & validate

- [ ] **Normalize** the input URL → `<scheme>://<host>/robots.txt`
- [ ] `HEAD` request first → capture status, `Content-Type`, `Content-Length`
- [ ] Fallback to `GET` if size unknown; abort if > **512 kB**
- [ ] Enforce max **3 s** timeout and **5** redirects
- [ ] Return error if non‑`2xx`

---

## 2. Parse

- [ ] Use a spec‑compliant parser (`urllib.robotparser`, `robotexclusionrulesparser`, etc.)
- [ ] Preserve **line numbers** for precise issue reporting
- [ ] Collapse CRLF → `
`, strip BOMs

---

## 3. Inventory user‑agents

```text
ai_tokens = [
  "GPTBot", "ClaudeBot", "PerplexityBot",
  "Google-Extended", "ccbot", "YouBot"
]
```

- [ ] For each token, extract its **group** if present
- [ ] Note whether it falls back to the global `*` group

---

## 4. Evaluate rules

| Check                 | Pass criteria                                                         |
| --------------------- | --------------------------------------------------------------------- |
| **Global Disallow**   | `User-agent: *` does **not** contain `Disallow: /`                    |
| **AI Groups Allowed** | The AI token group contains `Allow: /` _or_ has no `Disallow`         |
| **Rule Precedence**   | No broader `Disallow` overrides a narrower `Allow`                    |
| **Wildcard Abuse**    | Avoid patterns like `Disallow: *?sessionid=*` that explode rule count |
| **Crawl-delay**       | Not present (warn if found)                                           |
| **Charset**           | UTF‑8 only                                                            |

---

## 5. Sitemap discovery

- [ ] Detect `Sitemap:` lines → validate absolute URLs
- [ ] Optionally, fetch sitemap HEAD (<= **50 MB**)

---

## 6. Scoring rubric (example)

| Weight | Component          | Logic                                                       |
| ------ | ------------------ | ----------------------------------------------------------- |
| 40 pts | **Accessibility**  | +20 if 200 OK; +20 if \<512 kB                              |
| 30 pts | **AI Allowance**   | +5 per AI group explicitly allowed; −10 if globally blocked |
| 15 pts | **Syntax hygiene** | −5 each: invalid directive, non‑UTF‑8, crawl‑delay          |
| 10 pts | **Sitemaps**       | +10 if ≥1 valid sitemap                                     |
| 5 pts  | **No conflicts**   | +5 if precedence rules are clean                            |

Normalize to 0‑100.

---

## 7. Output shape

- [ ] Numeric **`score`** (0‑100)
- [ ] Array **`issues`** with stable IDs  
      (`"oversize"`, `"global_block"`, `"missing_sitemap"`, …)
- [ ] **`details`** diagnostic object (see contract)

---

## 8. Performance & caching

- [ ] Memoize results in Redis for 6 h keyed by host
- [ ] Queue heavy fetches via worker (BullMQ, Sidekiq, etc.)
- [ ] Concurrency limit: 5 fetches / host

---

## 9. Monitoring & alerts

- [ ] Log errors to Sentry with URL + host
- [ ] Export score histogram to Prometheus / Grafana
- [ ] Alert on ≥5 % fetch errors per hour

---

## 10. Security considerations

- [ ] Reject `file:`, `data:`, and `localhost` schemes
- [ ] Rate‑limit by IP & API key (500 req/day default)
- [ ] Sanitize domain strings to prevent SSRF

---

## 11. Future extensions (nice‑to‑have)

- [ ] **ML model** to predict crawl success from historical logs
- [ ] **Change‑feed** webhook when robots.txt diff detected
- [ ] **Front‑end** link to raw robots.txt with highlights

---

**Give this Markdown doc to Cursor AI** and let it scaffold the route, tests, and linter configs automatically.
