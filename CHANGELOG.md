# Changelog

## 0.1.5

- `comchatx.source` names each field's label in English and Chinese, as the account's page draws it: "Client identifier", "Client secret" and "Refresh token". The page used the field's own key.
- `comchatx.source.lines` holds the page's words for the ad-account list, in English and Chinese: the add button, the connected line, the line saying a removed refresh token takes its ad accounts with it, and the lines for a token Amazon no longer accepts, for no ad account listed and for a region Amazon did not answer for. They are the words of the signed prototype.
- Where the account holds several grants, a call goes on the grant that reaches the profile its `Amazon-Advertising-API-Scope` names, and a call naming none, `GET /v2/profiles` among them, is refused with the accounts listed, each by its profile id, name and country. The door's reference and the skill said a call named its grant with `x-cx-store`; that stays only for a grant Amazon has listed no account for yet.

## 0.1.4

- The door's reference says the platform may hold a grant for each Amazon sign-in, under a name, that a call names one with `x-cx-store` where there are several, and how cx learns the names: the refusal of a call that names none lists them. It said one refresh token was saved for every region. The skill's own line on what the platform holds says the same.
- The door's reference says how a Reporting v1 report is asked for: its create, retrieve and delete operations, how a request names the accounts, its statuses, its parts and how often Amazon says to ask, each read on Amazon's pages on 2026-11-10; on its limits it says Amazon's pages disagree, per client id or per advertiser. It said so for v3 alone.
- The test holds the card's Chinese line and the skill's Chinese line, which it passed without before, and the report facts of v3 and v1 in the door's reference.

## 0.1.3

- The card's line and the Overview, in English and Chinese, are the words signed on 2026-11-10: "Pauses keywords that don't sell, and tunes budgets and bids." as npm's `description`, and 「暂停只花钱不出单的关键词，替你调整预算和竞价。」 as `comchatx.about`. They said "Reads and updates your own Amazon ads." and 「读取并更新你自己的亚马逊广告。」.
- `DEVELOPING.md` holds the install line, `pi install npm:@comchatx/cx-amazon-ads`.

## 0.1.2

- The card's Chinese line is `comchatx.about`, the field the Plugins page reads, in place of `comchatx.description.zh`. Its words are unchanged.

## 0.1.1

- cx judges when to ask you before it changes a campaign, as ComChatX's decision D233 rules. The out-of-budget and wasted-keywords templates still ask for a suggestion, and no longer end on "Change nothing until I say so."
