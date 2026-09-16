# RBAC matrix

Capabilities are authoritative; role names are only curated bundles. Custom roles may select non-protected capabilities but cannot grant a capability the creating member does not hold.

| Role | Content | Campaigns | Subscribers | Team/security | Audit/analytics |
|---|---|---|---|---|---|
| super_admin | all | all | all | all, break-glass | all |
| admin | all normal operations | all | manage/export | invite/manage | read/export |
| publisher | review/publish | review/send | masked read | none | analytics |
| content_editor | create/request review | none | none | none | none |
| marketing_manager | media | create/review/send | manage, no unrestricted export | none | analytics |
| virtual_assistant | create/request review, approved media | drafts/request review | masked read | none | none |
| analyst | read aggregates | report read | aggregate only | none | analytics/system |
| support_agent | none | none | assigned support actions, masked | none | none |
| auditor | none | none | none | none | read audit/system |

High-risk capabilities (`campaign.send`, `subscriber.export`, `member.manage`, `integration.manage`) require recent step-up authentication in addition to authorization.
