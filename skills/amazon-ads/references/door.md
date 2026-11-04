# The Amazon Ads door

This file holds two kinds of line. Amazon's facts are from its Ads API guides at <https://advertising.amazon.com/API/docs/en-us>, read 2026-11-03, with the page named beside each. The door's own behaviour — the token step, the refusals, the endings, and the gate's reading of a `POST` — is ComChatX's, and names no page.

## The token step

Every call begins with one trade at Login with Amazon, `https://api.amazon.com/auth/o2/token`, of the connection's refresh token for an access token; the door remembers no token between calls. The request then goes with `Authorization: Bearer <access token>` and `Amazon-Advertising-API-ClientId: <client id>`, the header Amazon's own examples use on `/v2/profiles` and on `/adsApi/v1/create/campaigns` (*Retrieve a profile ID*; *Sponsored Products campaigns*). Other guides name it `Amazon-Ads-ClientId`; the door attaches its own, and a request naming either is refused `out_of_scope`.

A trade Amazon refuses ends the call `failed` with nothing of the request sent, Amazon's words under the line: `refresh-token trade, HTTP 400: invalid_grant: …` means the refresh token is not valid — revoked, expired, or issued to another application — and the seller saves a new one on the plugin's Settings; `invalid_client` means the client pair. Refresh tokens issued on or after 2026-07-30 expire 365 days after the advertiser's consent (*Refresh tokens*).

The door expects one refresh token, one Amazon user's grant, to serve every region; this is the door's expectation, not a line of Amazon's guides. The seller saves a connection with it in each region they advertise in.

## Headers a request names

| Header | When (*Making your first call*, *Get started with Amazon Ads API v1*) |
|---|---|
| `Amazon-Advertising-API-Scope` | The profile id, for campaign management and most sponsored ads requests. Every call but `/v2/profiles` reaches one profile. |
| `Amazon-Ads-AccountId` | The advertising account id, for reporting across ad products and for cross-product calls. |
| `Accept`, `Content-Type` | The versioned media type an operation names, as `application/vnd.spCampaign.v3+json`; without `Accept` Amazon answers `application/json`. |

The door composes no `content-type`: a body goes with the headers the request names. It sends its own `user-agent` when the request names none.

## Profiles

`GET /v2/profiles` lists the advertising accounts the grant reaches in the origin's region, one profile a marketplace: `profileId`, `countryCode`, `currencyCode`, `timezone` and `accountInfo` (`marketplaceStringId`, `id`, `type`, `name`). An empty list means no account there with View and Edit permission; the `accessLevel` query of the Profiles specification lists view-only ones too (*Retrieve a profile ID*). It does not list Amazon DSP advertiser accounts.

## Campaigns, ad groups, ads and targets

- Lists, a `POST` with a filter body: Sponsored Products `POST /sp/campaigns/list` under `application/vnd.spCampaign.v3+json`, Sponsored Brands `POST /sb/v4/campaigns/list` under `application/vnd.sbcampaignresource.v4+json` (*Making your first call*).
- Ads API v1 creates across ad products: `POST /adsApi/v1/create/campaigns`, `/adsApi/v1/create/adGroups`, `/adsApi/v1/create/ads` and `/adsApi/v1/create/targets`, a keyword being a target; a create answers `207` with `success` and `error`, each entry naming its `index` in the request (*Sponsored Products campaigns*, *Sponsored Products ad groups*, *Get started with manual campaigns*).
- Recommendations: `POST /sp/targets/keywords/recommendations`, `POST /sp/targets/products/recommendations`, `POST /sp/targets/bid/recommendations`, `GET /sp/targets/categories`.
- A path is one Amazon's reference lists, never a guess; an id in a path or a body is one read from a reply or named by the seller.

## Budgets

A campaign's budget in Ads API v1 is a list: `budgets: [{ budgetType: "MONETARY", budgetValue: { monetaryBudgetValue: { monetaryBudget: { value } } }, recurrenceTimePeriod: "DAILY" }]`, in the profile's currency (*Sponsored Products campaigns*). A budget is changed by the campaign's update operation in Amazon's reference, sent as written; there is no write switch, and a change is sent as a read is.

## Reports

Reporting v3 is asynchronous, in three calls (*Get started with version 3 reports*):

1. `POST /reporting/reports` under `Content-Type: application/vnd.createasyncreportrequest.v3+json`, with `name`, `startDate`, `endDate` and a `configuration` of `adProduct` (`SPONSORED_PRODUCTS`, …), `groupBy`, `columns`, `reportTypeId` (`spCampaigns`, …), `timeUnit` (`DAILY`, with `date` among the columns, or `SUMMARY`, with `startDate` and `endDate`) and `format` `GZIP_JSON`. It answers `200` with a `reportId`. A request identical to one still generating answers `425`, too soon.
2. `GET /reporting/reports/{reportId}` until `status` is `COMPLETED`; `PENDING` and `PROCESSING` mean not yet. Generation takes up to three hours, and repeated status calls may be answered `429`; Amazon's page asks for a delay between them.
3. The `url` of the completed report is an S3 address: the box's own download, outside the door, gzipped JSON rows.

Amazon deprecates reporting v3 on 2027-06-30 for its new reporting API.

## The reply

- A reply outside 2xx that the door returns lands with its status, its headers and as much of its body as came, and the call ends `failed`, exit 1: the line reads `the source answered HTTP 403`, with the status and the reply's opening under it; a returned `429` is `provider_rate_limit`. A redirect is followed nowhere and nothing of it lands: a read ends `failed`, a change reads `sent, outcome unknown`.
- A reply cut short ends `failed`, exit 1, whatever its status, with the bytes that came landed.
- A `429` is Amazon's answer; its `Retry-After` header, where present, gives the seconds to wait (*Rate limiting*). The door adds no wait and retries nothing. Amazon's *Rate limiting* page recommends exponential backoff where `429`s recur, and longer backoff for report generation.
- A list sent as a `POST` is a change to the gate: lost after it left, it reads `sent, outcome unknown`, though a list changes nothing at Amazon.
