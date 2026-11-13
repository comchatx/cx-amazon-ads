import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DefaultResourceLoader, SettingsManager } from "@earendil-works/pi-coding-agent";
import { afterEach, expect, it } from "vitest";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const manifest = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as { pi: unknown; files: unknown; comchatx: { skills: Record<string, unknown>; prompts: Record<string, unknown> } };
const scratches: string[] = [];
afterEach(() => { for (const scratch of scratches.splice(0)) rmSync(scratch, { recursive: true, force: true }); });

const walk = (directory: string): string[] => readdirSync(directory, { withFileTypes: true }).flatMap((entry) => (entry.isDirectory() ? walk(join(directory, entry.name)) : [join(directory, entry.name)]));

it("the pinned pi lists the package's skills and templates as its manifest names them, with nothing it could not read", async () => {
  const home = mkdtempSync(join(tmpdir(), "pi-package-"));
  scratches.push(home);
  const agentDir = join(home, "agent");
  const cwd = join(home, "project");
  for (const directory of [agentDir, cwd]) mkdirSync(directory);
  writeFileSync(join(agentDir, "settings.json"), JSON.stringify({ defaultProjectTrust: "always", packages: [ROOT] }));
  const loader = new DefaultResourceLoader({ cwd, agentDir, settingsManager: SettingsManager.create(cwd, agentDir) });
  await loader.reload();
  const { skills, diagnostics } = loader.getSkills();
  expect(diagnostics).toEqual([]);
  expect(manifest.pi).toEqual({ skills: ["./skills"], prompts: ["./prompts"] });
  // The Plugins page names a package's skills from its `comchatx` field alone.
  expect(skills.map((skill) => skill.name).sort()).toEqual(Object.keys(manifest.comchatx.skills).sort());
  for (const skill of skills) expect(skill.description.trim(), skill.name).not.toBe("");
  // Its Try it cards are its templates, each named in the field for its Chinese, each with words pi reads from its front matter.
  const { prompts, diagnostics: unread } = loader.getPrompts();
  expect(unread).toEqual([]);
  expect(prompts.map((prompt) => prompt.name).sort()).toEqual(Object.keys(manifest.comchatx.prompts).sort());
  for (const prompt of prompts) expect(prompt.description.trim(), prompt.name).not.toBe("");
});

it("ships its skills, its templates, its READMEs and its license, and nothing else", () => {
  type Packed = { files: { path: string }[] };
  // npm 11 answers a list of packs and npm 12 an object keyed by the package's name.
  const answer = JSON.parse(execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: ROOT, encoding: "utf8" })) as Packed[] | Record<string, Packed>;
  const packed = Array.isArray(answer) ? answer : Object.values(answer);
  const shipped = ["skills", "prompts"].flatMap((directory) => walk(join(ROOT, directory)).map((path) => relative(ROOT, path)));
  expect(packed[0]!.files.map((file) => file.path).sort()).toEqual(["LICENSE", "README.md", "README.zh-CN.md", "package.json", ...shipped].sort());
  expect(manifest.files).toEqual(["skills", "prompts", "README.zh-CN.md"]);
});

it("holds the Chinese words the catalogue reads: the card's line and the skill's line, each in Chinese", () => {
  const field = manifest.comchatx as unknown as { about?: unknown; skills: Record<string, { zh?: unknown }> };
  const chinese = (value: unknown): boolean => typeof value === "string" && value.trim() === value && /\p{Script=Han}/u.test(value);
  expect(chinese(field.about), "comchatx.about").toBe(true);
  expect(chinese(field.skills["amazon-ads"]?.zh), "comchatx.skills.amazon-ads.zh").toBe(true);
});

it("the door says how a report is asked for, in v3 and in v1, as Amazon's pages say it", () => {
  const door = readFileSync(join(ROOT, "skills/amazon-ads/references/door.md"), "utf8");
  const section = (title: string): string => door.split(/^## /m).find((part) => part.startsWith(`${title}\n`)) ?? "";
  const v3 = section("Reports");
  for (const fact of ["`POST /reporting/reports`", "application/vnd.createasyncreportrequest.v3+json", "`GET /reporting/reports/{reportId}`", "`COMPLETED`", "`PENDING` and `PROCESSING`", "answers `425`", "2027-06-30"]) expect(v3, fact).toContain(fact);
  const v1 = section("Reports, v1");
  for (const fact of [
    "`POST /adsApi/v1/create/reports`", "`POST /adsApi/v1/retrieve/reports`", "`POST /adsApi/v1/delete/reports`", "answering `207`",
    "`accessRequestedAccounts`, a list of 1 to 2,000 accounts", '"advertiserAccountId"', '"managerAccountId"', "no `Amazon-Advertising-API-Scope` header",
    "`PENDING`, `PROCESSING`, `COMPLETED` and `FAILED`", "`completedReportParts`, up to 100 parts", "once per minute", "no `425`",
    "Amazon's pages disagree", "per client id", "release note of 2026-09-30", "one concurrent report per advertiser",
  ]) expect(v1, fact).toContain(fact);
});

it("says what the product does today of grants: a call goes on the grant that reaches its profile, and cx learns the profiles from the door's refusal", () => {
  const door = readFileSync(join(ROOT, "skills/amazon-ads/references/door.md"), "utf8");
  const skill = readFileSync(join(ROOT, "skills/amazon-ads/SKILL.md"), "utf8");
  const grants = door.split(/^## /m).find((part) => part.startsWith("Grants\n")) ?? "";
  expect(grants).toContain("a call goes on the grant whose accounts, as Amazon listed them at that grant's last check, include the profile the call names in `Amazon-Advertising-API-Scope`");
  expect(grants).toContain("That line is how cx learns the profiles");
  expect(grants).toContain("A v1 report names its accounts in its body: sent with no profile, with several grants it is refused as a call naming none is");
  // The header named twice is refused as the gate refuses it: out of scope, with no list.
  expect(grants).toContain("`out_of_scope: the Amazon-Advertising-API-Scope header is named at most once`");
  // The one road left by name: a grant Amazon has listed no account for yet.
  expect(grants.match(/x-cx-store/g)?.length).toBe(1);
  expect(skill).not.toContain("x-cx-store");
  // No form the page does not draw: the Settings that save a named grant are not built.
  expect(grants).not.toMatch(/Settings|they choose|may save/);
});

const HOLDS = { removedWith: ["names"], silent: ["regions"] };

it("declares its source in the shape the platform's catalogue reads: each field's label under `label`, each line in English and Chinese", () => {
  const source = (JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as { comchatx: { source: { fields: Record<string, Record<string, unknown>>; lines: Record<string, unknown>; regions: Record<string, unknown> } } }).comchatx.source;
  const words = (value: unknown): boolean => typeof value === "object" && value !== null && Object.keys(value).sort().join() === "en,zh"
    && Object.values(value).every((one) => typeof one === "string" && one.length > 0);
  expect(Object.keys(source.fields)).toEqual(["client_id", "client_secret", "refresh_token"]);
  for (const [field, declared] of Object.entries(source.fields)) {
    // The catalogue reads `label` and `help` under a field and nothing else: a field declared otherwise drops the whole source.
    expect(Object.keys(declared).every((key) => key === "label" || key === "help"), field).toBe(true);
    expect(words(declared["label"]), field).toBe(true);
  }
  expect(Object.keys(source.lines)).toEqual(["add", "connected", "removedWith", "refused", "none", "silent", "connect", "canChange", "rows", "foundNone", "checking"]);
  for (const [place, line] of Object.entries(source.lines)) expect(words(line), place).toBe(true);
  // The catalogue fills a line's one placeholder and refuses a line that holds any other: "Sells in {places}" holds its places once in each language.
  const holds = (line: unknown): readonly string[] => Object.values(line as Record<string, string>).map((said) => [...said.matchAll(/\{([a-z]+)\}/g)].map((one) => one[1]).join());
  expect(Object.fromEntries(Object.entries(source.lines).map(([place, line]) => [place, [...new Set(holds(line))]]).filter(([, held]) => (held as string[]).join() !== ""))).toEqual(HOLDS);
  // Amazon's three regions, each named in English and Chinese, in the door's order.
  expect(Object.keys(source.regions)).toEqual(["na", "eu", "fe"]);
  for (const [region, named] of Object.entries(source.regions)) expect(words(named), region).toBe(true);
});
