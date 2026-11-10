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

it("says what the product does today of grants: the platform holds each under a name, and cx learns the names from the door's refusal", () => {
  const door = readFileSync(join(ROOT, "skills/amazon-ads/references/door.md"), "utf8");
  const grants = door.split(/^## /m).find((part) => part.startsWith("Grants\n")) ?? "";
  expect(grants).toContain("A grant is one Amazon sign-in's refresh token, which the platform holds for the account under a name");
  expect(grants).toContain("That line is how cx learns the names");
  // No form the page does not draw: the Settings that save a named grant are not built.
  expect(grants).not.toMatch(/Settings|they choose|may save/);
});
