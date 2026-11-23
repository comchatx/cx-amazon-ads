# Changelog

## 0.1.10

- The tile's mark on the Plugins page is the signed drawing.

## 0.1.9

- The `spend-this-week`, `out-of-budget` and `wasted-keywords` templates send their Try it sentence, word for word, then the words you type after the template's name.

## 0.1.8

- The README's first paragraph, in Chinese, is the one signed on 2026-11-18 (「把你的亚马逊广告账户连到 cx，……覆盖商品推广、品牌推广和展示型推广。」), and in English the paragraph of the same meaning ("Connect your Amazon advertising account to cx … for Sponsored Products, Brands and Display.").
- The README's "What it needs" section leaves, in both languages, heading and all, as signed on 2026-11-18. The Plugins page draws what installs with it.
- `comchatx.builds` names `cx-amazon-seller` as optional, with the reason signed on 2026-11-18: "Tells cx from the start that you sell on Amazon." / 「用于让 cx 从第一条消息起就知道你在亚马逊开店。」
- The skill's line is the one signed on 2026-11-17, in `comchatx.skills.amazon-ads` as `zh` 「读取和调整你的亚马逊广告：活动、关键词、预算和竞价。」 and `en` "Reads and changes your Amazon ads: campaigns, keywords, budgets and bids.". `SKILL.md`'s `description` is unchanged.

## 0.1.7

- The card's name is the one signed on 2026-11-17: "Amazon Ads API" on the English page (`comchatx.name`) and 「亚马逊广告接口」 on the Chinese page (`comchatx.nameZh`).
- The README names each other plugin it speaks of by the card's name in its own language, a link to that plugin's page on npm, never by the npm name.

## 0.1.6

- `comchatx.source.lines` holds five more of the page's words for the ad-account list, in English and Chinese: the heading of the first form, "Connect your ad accounts", the line under it on what cx can do once connected, the list's heading, "Ad accounts", the form's alert when a refresh token reaches no ad account, and "Checking with Amazon…" while Amazon is asked. They are the platform's signed words for those places, moved as they are.
- `comchatx.source.regions` names Amazon's three regions, North America, Europe and Far East, in English and Chinese, as the page names them.

## 0.1.5

- `comchatx.source.fields.<field>.label` names each field in English and Chinese, as the account's page draws it: "Client identifier", "Client secret" and "Refresh token". The page used the field's own key.
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
