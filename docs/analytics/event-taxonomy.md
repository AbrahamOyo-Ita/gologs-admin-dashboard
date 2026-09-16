# Event taxonomy and metric definitions

Current schema version: 1. Event names use `domain.object.action`; identifiers are non-enumerable and direct PII is prohibited in analytics properties.

| Event | Required properties | Consent |
|---|---|---|
| `web.page.viewed` | path, referrer_domain, utm fields, device class | analytics consent |
| `web.cta.clicked` | placement, destination_kind, campaign | analytics consent |
| `news.article.viewed` | article_id, source | analytics consent |
| `newsletter.signup.submitted` | source, policy_version | essential command; no analytics join without consent |
| `newsletter.signup.confirmed` | source | essential lifecycle |
| `campaign.link.clicked` | campaign_id, link_id | provider/legal policy dependent |

Metrics use the workspace timezone and show their last successful aggregate timestamp.

- Visitors: distinct consented `anonymous_id_hash` values with `web.page.viewed` during the range.
- Sessions: distinct session IDs containing an eligible event.
- Newsletter conversion: confirmed signups attributed to an eligible session divided by eligible landing sessions.
- Subscriber growth: active confirmations minus unsubscribes, complaints, and permanent bounces.
- Published content: articles whose first `published_at` falls in the range.
- Delivery rate: delivered messages divided by provider-accepted sends. Suppressed recipients are excluded.
- Click-through rate: distinct recipients with an eligible click divided by delivered recipients.
- Active administrators: distinct verified members with an authenticated action.
- Failed jobs: jobs in failed state after exhausting retry policy.

Raw web events default to 90-day retention; daily aggregates default to 25 months. Consent and suppression evidence follows the applicable compliance retention policy. Geography must not be stored more precisely than region unless counsel approves it.
