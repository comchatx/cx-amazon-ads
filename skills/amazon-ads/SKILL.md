---
name: amazon-ads
description: The seller's own Amazon Ads accounts through Amazon's Ads API — profiles, Sponsored Products, Sponsored Brands and Sponsored Display campaigns, ad groups, ads, keywords and targets, budgets, bids and reports, read and changed, in each region the seller authorised. Use before the first call that reads or changes the seller's own Amazon advertising. Needs cx-sources; if no cx-sources skill is listed, it is not installed, and the seller installs it in Plugins.
---

Amazon Ads is an open door through `cx raw`; read cx-sources first. The door carries any method, path, query, header and body to the origin the request names, attaches the seller's token and client id, and lands Amazon's reply as Amazon gave it, at no charge. If Amazon Ads is off, the seller turns its plugin on in Plugins.

```sh
cx raw amazon-ads --origin https://advertising-api.amazon.com --method GET --path /v2/profiles
```

Amazon's reference: <https://advertising.amazon.com/API/docs/en-us>.

## Origins and connections

| Origin | Region | Marketplaces |
|---|---|---|
| `https://advertising-api.amazon.com` | `na` | US, CA, MX, BR |
| `https://advertising-api-eu.amazon.com` | `eu` | UK, FR, IT, ES, DE, NL, AE, PL, TR, EG, SA, SE, BE, IN, ZA |
| `https://advertising-api-fe.amazon.com` | `fe` | JP, AU, SG |

The platform holds the client pair, `client_id` and `client_secret`, and the seller's connections, each a store, its region and its `refresh_token`; the box holds none. A call goes on its origin region's connection; where the region holds several, `--header x-cx-store=<store>` names one, and Amazon never sees it. Without the client pair or that connection, the door refuses `key_required`, naming what is missing, before anything is sent. A request naming `Authorization`, `Amazon-Advertising-API-ClientId` or `Amazon-Ads-ClientId` is refused.

## Profiles

Nearly every call names one advertising account in one marketplace: `--header Amazon-Advertising-API-Scope=<profileId>`. Read the ids from `GET /v2/profiles` at the region's origin, never ask the seller for them; each profile's `countryCode` names its marketplace. An empty list means the grant works but reaches no account there with View and Edit permission.

## The door

- A `429` is Amazon's answer: the door adds no wait.
- Many lists are a `POST`; the gate reads a `POST` as a change, so one whose reply was lost reads `sent, outcome unknown`.
- A `GET` or `HEAD` with a body, `TRACE`, `CONNECT` and `TRACK` are not sent.
- A report's `url` is the box's own download, outside the door.

Paths, media types, reports, budgets and failures: [references/door.md](references/door.md).
