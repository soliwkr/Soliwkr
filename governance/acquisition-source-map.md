# Acquisition and source-of-truth map

This page is the cross-project routing map for the first BLACK OFFICE acquisition loop.

It does not duplicate the internal schemas of BLACK OFFICE or WORKPRINT. It answers one question:

> When two systems disagree, which one owns the truth being asked about?

## Stack at a glance

```text
HUMAN PRINCIPAL
values, irreversible authority, constitutional changes
        |
        v
SOLIWKR AIOS
portfolio routing, cross-project decisions, source map
        |
        +------------------------------+
        |                              |
        v                              v
BLACK OFFICE                      pstack
economic learning                 engineering discipline
acquisition + experiments         for source-code changes
        |
        v
WORKPRINT
product thesis, UX, assessment, report, offer surface
        |
        +-------------+--------------------+
        |             |                    |
        v             v                    v
Cloudflare          Stripe          Distribution channels
runtime/state       payment truth   publication + native metrics
        \             |                    /
         \            |                   /
          +------ normalized evidence -----+
                         |
                         v
                    BLACK OFFICE
              hold / kill / expand / mutate
```

## Canonical ownership matrix

| Question | Canonical source | Why | BLACK OFFICE may store |
|---|---|---|---|
| What values and irreversible limits govern the system? | Human + `soliwkr/Soliwkr` decisions / routing | portfolio authority | pointer, never replacement |
| How must software changes be engineered and verified? | `soliwkr/pstack` | engineering constitution | outcome/evidence only |
| What is WORKPRINT as a product? | `soliwkr/workprint` | product code, narrative, assessment, report, UX | asset contract and economic observations |
| What acquisition hypotheses/creative records are currently under economic test? | BLACK OFFICE `OfficeState` | economic control plane | canonical records |
| What did TikTok/Instagram/YouTube/Reddit actually publish? | the source platform | provider owns publication object | provider ID, URL, normalized status |
| How many native impressions/views did a source publication receive? | the source platform analytics | provider measurement | timestamped normalized snapshot |
| Which first-party funnel events occurred? | asset event producer + BLACK OFFICE receipt | asset observes user action; BO owns normalized economic event receipt | canonical receipt + safe attribution |
| Which creative/source/campaign led to a WORKPRINT session? | first-touch attribution captured by WORKPRINT and normalized by BLACK OFFICE | first-party acquisition path | source/medium/campaign/content/referrer |
| Was a payment actually completed/refunded/disputed? | Stripe | payment processor | normalized commercial event/reference |
| Is a purchased WORKPRINT report entitled/unlocked? | WORKPRINT product state | product owns fulfillment entitlement | purchase_complete economic event |
| What source code is deployed? | GitHub source + Cloudflare deployment state | code and runtime are different facts | deployment evidence/reference |
| Who won an experiment and why? | BLACK OFFICE Director decision log | economic decision owner | canonical decision |
| What should the permanent brand/domain be? | Human-approved decision recorded in owning product/portfolio source | identity is not an autonomous optimization surface | proposal/evidence only |
| What does a dashboard say? | nowhere by itself | dashboards are projections | nothing authoritative merely because it is displayed |

## Acquisition evidence path

For an attributable purchase the intended chain is:

```text
traffic_hypothesis
  -> creative.content_key
  -> publication.external_ref
  -> provider source metrics
  -> URL UTM attribution
  -> WORKPRINT browser session
  -> assessment token
  -> Stripe checkout
  -> WORKPRINT entitlement
  -> purchase_complete
  -> BLACK OFFICE funnel / revenue decision
```

The chain is valid only when identifiers can be joined without copying sensitive assessment answers into acquisition telemetry.

## Data minimization

Acquisition telemetry may contain:
- source;
- medium;
- campaign;
- content key;
- referrer;
- public path;
- pseudonymous session/reference IDs;
- commercial value.

It must not contain:
- assessment answers;
- inferred psychological labels beyond explicitly productized result labels needed for bounded experiments;
- private user messages;
- payment-card data;
- unrelated AIOS personal context.

## Repository boundaries

### `soliwkr/Soliwkr`
Owns:
- cross-project authority map;
- portfolio routing;
- human-approved cross-project decisions;
- capability/connection registry.

Does not own:
- asset product logic;
- BLACK OFFICE runtime state;
- Stripe payment records;
- social-native analytics.

### `soliwkr/black-office`
Owns:
- economic ontology;
- acquisition hypotheses;
- creatives as experiment records;
- publications as normalized records;
- experiment policy;
- event receipts;
- attributed funnel;
- normalized source metric snapshots;
- Director decisions and economic memory.

Does not own the underlying external platform object merely because it has a copy.

### `soliwkr/workprint`
Owns:
- product narrative and brand working state;
- question wording and branching;
- deterministic scoring/report rules;
- landing, assessment, preview, report UX;
- assessment persistence;
- purchase entitlement;
- product-side telemetry emission.

### `soliwkr/pstack`
Owns:
- engineering method and verification discipline.

It does not own product direction or runtime state.

## Runtime surfaces

| Surface | Role | Authority |
|---|---|---|
| Cloudflare Worker `workprint` | public product runtime | executes WORKPRINT repo |
| WORKPRINT Durable Object | assessment + entitlement state | canonical for product fulfillment state |
| Cloudflare Worker `black-office-director` | economic control plane runtime | executes BLACK OFFICE repo |
| BLACK OFFICE OfficeState Durable Object | experiments/acquisition/economic state | canonical runtime state for BO |
| Cloudflare Queue | delivery/retry transport | transient, not source of truth |
| Cloudflare Analytics Engine | high-volume telemetry projection | analytical projection, not normative authority |
| Stripe WORKPRINT account | checkout/payment processor | canonical payment state |
| TikTok / Instagram / YouTube / Reddit | distribution surfaces | canonical publication/native metrics |
| GitHub | source/PR/CI history | canonical durable source history |
| Google Drive mirrors | human-readable collaboration | non-canonical mirror unless a domain explicitly promotes a document |

## Mutation authority

BLACK OFFICE may autonomously mutate only allow-listed reversible configuration/experiment surfaces.

It may propose but not self-authorize:
- brand rename;
- domain purchase;
- new paid channel;
- new external account;
- material audience pivot;
- scientific/clinical positioning change;
- Constitution change;
- source-code patch.

External publication is human-approved in Traffic Engine V0.

## Conflict examples

### Stripe says paid; WORKPRINT says locked
Payment truth: Stripe.
Fulfillment truth: WORKPRINT.
Action: investigate webhook/entitlement delivery. Do not rewrite Stripe history.

### TikTok says 40k views; BLACK OFFICE snapshot says 31k
TikTok wins native metric truth.
Action: refresh normalized snapshot and preserve the old snapshot timestamp.

### BLACK OFFICE proposes a stronger clinical claim
WORKPRINT product policy + Constitution outrank conversion opportunity.
Action: reject proposal.

### Dashboard says Hook A won; Director decision log says hold
Director decision log wins.
Dashboard is stale or wrong.

## Design principle

One fact may appear in several places, but it has one owner.

Copies carry provenance.
Dashboards project.
Agents route.
Owners decide.
