// Pickup-line writer for "One Line, One Minute: The Vending Machine
// Pickup Line Contest" (make.fun). Writes one pickup line, at most 200
// characters, as if a vending machine were flirting with a passing human,
// to $MAKEFUN_OUTPUT_DIR/entry.txt.
// Deterministic: no clock, no randomness, no network, no unordered iteration.
// Node 22, zero dependencies, erasable TypeScript only.
//
// The judge (a comedy writer who has spent years judging short punchline
// contests) weighs, most important first:
//   1. the line is a pickup line a vending machine would use on a passing
//      human, spoken by the machine itself -- a line any stranger in a bar
//      could say loses;
//   2. it uses the machine's own world: its slot, its buttons, its coils,
//      its snacks, its hum, its exact change, rather than love in general;
//   3. it gets a laugh out of that situation, with the turn or the punch
//      arriving by the last few words;
//   4. it is short and speakable, one line a person reads in a breath;
//   5. it is charming rather than creepy, cheeky and warm enough that a
//      passing human would smile instead of walking faster.
// A line that needs a picture or a caption to work is weaker than one that
// stands on its own. The scorer below mirrors that brief in the same order.
// Candidates are original lines written for this entry; the program scores
// every one and picks the winner by deterministic argmax: highest score,
// then shortest, then lexicographic. (Ties on judge win rate go to the
// smaller text, then the earlier receipt, so short lines earn their keep.)
// Flooded angles the field of 2,197 will be full of -- "are you a snack,
// you're looking delicious", "insert coin", "I'd dispense myself for you"
// -- are written in so the scorer can exclude them by penalty instead of
// by habit.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------- candidates
// Every line is one sentence of at most 200 characters, written for this
// entry, spoken by the machine itself to a passing human. The strongest
// lines share one shape: the machine's own world doing the flirting, then
// the punch in the last few words.

const CANDIDATES: string[] = [
  // Three minutes staring: seen, and full of crisps.
  "You have been staring at me for three minutes, and I have never felt more seen — or more full of crisps.",
  // Humming since 1998: the first person who hummed back.
  "I have been humming the same note since 1998, and you are the first person who ever hummed back.",
  // B4: fall for you, literally, designed to drop.
  "Press B4 and I will fall for you — literally, I am designed to drop.",
  // Exact change, but a chance.
  "I only take exact change, but for you I would take a chance.",
  // Wall with snacks: the first person who did not see a wall.
  "You are the first person today who looked at me like I was not just a wall with snacks in it.",
  // Stuck coil: stuck on the chocolate bar, and on you.
  "My coil has been stuck on the same chocolate bar all week, and honestly, so have I — on you.",
  // 47 buttons: you pressed every single one.
  "I have 47 buttons and you just pressed every single one of them.",
  // Fogged glass: you are the clearest thing I have seen all day.
  "Come closer — my glass is fogged up, and you are the clearest thing I have seen all day.",
  // Dispensing vs keeping: the first thing I ever wanted to keep.
  "I have been dispensing the same crisps for years, but you are the first thing I ever wanted to keep.",
  // Kept coin: my way of asking you to come back.
  "You dropped a coin and I kept it — consider it my way of asking you to come back.",
  // Light on all night: never once for the snacks.
  "My light has been on all night, and it has never once been for the snacks.",
  // Never offered anyone anything: I am a machine, I do not offer.
  "I would offer you my last chocolate bar, and I have never offered anyone anything — I am a machine, I do not offer.",
  // Standing in front of me: for the first time in years, so am I.
  "You are standing in front of me like you want something, and for the first time in years, so am I.",
  // Exact change light: blinking for a decade, the first person who noticed.
  "My exact change light has been blinking for a decade, and you are the first person who ever noticed.",
  // Every snack by heart: cannot name what you did to my coil.
  "I know every snack by heart, and I still cannot name what you just did to my coil.",
  // Exact change, kind face, ten seconds: more than anyone ever gave me.
  "You have exact change, a kind face, and ten seconds — that is more than anyone has ever given me.",
  // Hum, glow, drop: walked past twice without pressing anything.
  "I hum, I glow, I drop snacks on command — and you still walked past me twice without pressing anything.",
  // E7: crisps for a press, the whole row for a smile.
  "If you press E7 I will give you the crisps, but if you smile I will give you the whole row.",
  // Six months walking past: never so glad to be plugged in.
  "I have watched you walk past for six months, and today you finally stopped — I have never been so glad to be plugged in.",
  // Expire, flicker, never stale: the way you look at me.
  "My snacks expire, my light flickers, but the way you look at me never goes stale.",
  // Compressor: no heart, but it just skipped a beat.
  "I do not have a heart, but my compressor just skipped a beat.",
  // Tapped glass twice: like knocking on a door.
  "You are the only person who ever tapped my glass twice, like you were knocking on a door.",
  // Corridor since before you were born: the first person worth the wait.
  "I have been standing in this corridor since before you were born, and you are the first person worth the wait.",
  // Worn buttons: the only one who presses gently.
  "My buttons are worn out from everyone except you — you are the only one who presses gently.",
  // Labels like love letters: lit up ever since.
  "You read my labels like love letters, and I have been lit up ever since.",
  // Are you a snack: written in, then excluded by the flooded-angle
  // penalty -- the field is full of snack puns.
  "Are you a snack? Because you are looking absolutely delicious.",
  // Insert coin: written in, then excluded the same way.
  "Insert a coin and I will dispense myself for you.",
  // Out of your favourite: written in as a weak line -- the charm is
  // there, but there is no joke and no machine world doing the work.
  "I am out of your favourite, but I am still here, and I am still lit up.",
  // Prices like a menu: written in as a weak line -- a kind observation
  // with no turn and no punch at the end.
  "Every day a hundred people walk past, and you are the only one who read my prices like a menu.",
  // Any button: written in as a weak line -- the promise is convoluted
  // and the punch never quite arrives.
  "Press any button — I promise the thing that drops will not be the best thing that happens to you today.",
];

// The machine speaking as itself: first-person machinery.
const MACHINE_VOICE: string[] = [
  "i have", "my coil", "my buttons", "my glass", "my light", "my snacks",
  "i hum", "i glow", "i dispense", "i do not have", "my compressor",
  "i am", "i know", "i would", "my exact change",
];
// The machine's own world: slot, buttons, coils, snacks, hum, exact change.
const MACHINE_WORLD: string[] = [
  "coil", "button", "snack", "crisp", "hum", "exact change", "coin",
  "glass", "light", "slot", "compressor", "plugged in", "corridor",
  "chocolate bar", "b4", "e7", "label", "prices",
];
// The punch arriving by the last few words.
const PUNCH_WORDS: string[] = [
  "hummed back", "designed to drop", "take a chance", "on you",
  "every single one of them", "clearest thing", "wanted to keep",
  "come back", "for the snacks", "i do not offer", "so am i",
  "ever noticed", "my coil", "ever given me", "pressing anything",
  "whole row", "plugged in", "never goes stale", "skipped a beat",
  "knocking on a door", "worth the wait", "presses gently",
  "lit up ever since", "full of crisps",
];
// The laugh comes from the situation: the machine surprised or affected
// by the human -- it cannot name it, its compressor skips, its glass fogs.
const SURPRISE_WORDS: string[] = [
  "cannot name", "skipped a beat", "clearest thing", "designed to drop",
  "hummed back", "presses gently", "plugged in", "whole row",
  "wanted to keep", "so am i", "every single one of them",
];
// Charm: warm, cheeky, the human smiles instead of walking faster.
const CHARM_WORDS: string[] = [
  "first person", "only one", "only person", "kind face", "glad",
  "clearest", "worth the wait", "come back", "gently", "smile",
];
// Flooded angles: the field of 2,197 will be full of them.
const FLOODED_WORDS: string[] = [
  "are you a snack", "looking delicious", "insert a coin",
  "dispense myself", "are you a coin", "you must be a",
];

function countHits(text: string, words: string[]): number {
  const lower = text.toLowerCase();
  let n = 0;
  for (const w of words) if (lower.includes(w)) n++;
  return n;
}

interface Scored {
  text: string;
  score: number;
}

function scoreLine(text: string): Scored | null {
  // Validity gate: one line, one sentence, 1-200 characters.
  if (text.length < 1 || text.length > 200) return null;
  if (text.includes("\n")) return null;
  if (!text.endsWith(".")) return null;
  const body = text.slice(0, -1);
  if (/[.!?]\s/.test(body)) return null;
  let score = 0;
  // 1. Spoken by the machine itself, to a passing human.
  score += Math.min(9, countHits(text, MACHINE_VOICE) * 3);
  if (/^(i|you|press|come|my)\b/i.test(text)) score += 3;
  // 2. The machine's own world doing the flirting.
  score += Math.min(12, countHits(text, MACHINE_WORLD) * 3);
  // 3. The punch arrives by the last few words.
  const tail = text.slice(Math.max(0, text.length - 45)).toLowerCase();
  score += Math.min(9, countHits(tail, PUNCH_WORDS) * 3);
  // The laugh itself: the machine surprised or affected by the human.
  score += Math.min(6, countHits(text, SURPRISE_WORDS) * 3);
  // 4. Short and speakable, one breath.
  if (text.length <= 120) score += 4;
  score += Math.max(0, Math.round((160 - text.length) / 20));
  // 5. Charming rather than creepy.
  score += Math.min(6, countHits(text, CHARM_WORDS) * 3);
  // A question addressed to the human is a pickup line doing its job.
  if (text.includes("?")) score += 1;
  // Flooded angles start behind.
  score -= countHits(text, FLOODED_WORDS) * 15;
  return { text, score };
}

function buildCandidates(): Scored[] {
  const out: Scored[] = [];
  for (const line of CANDIDATES) {
    const s = scoreLine(line);
    if (s) out.push(s);
  }
  return out;
}

function pickBest(candidates: Scored[]): Scored {
  const sorted = [...candidates].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.text.length !== b.text.length) return a.text.length - b.text.length;
    return a.text < b.text ? -1 : a.text > b.text ? 1 : 0;
  });
  return sorted[0];
}

// --------------------------------------------------------------------- main
function main(): void {
  const candidates = buildCandidates();
  if (candidates.length === 0) throw new Error("no valid pickup candidate");
  const best = pickBest(candidates);
  if (process.env.VEND_DEBUG) {
    const ranked = [...candidates].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.text.length !== b.text.length) return a.text.length - b.text.length;
      return a.text < b.text ? -1 : a.text > b.text ? 1 : 0;
    });
    for (const c of ranked.slice(0, 8)) {
      console.log(`[${c.score}] (${c.text.length}) ${c.text}`);
    }
  }
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "entry.txt"), best.text, "utf8");
  console.log(best.text);
  console.log(
    `chars: ${best.text.length} score: ${best.score} candidates: ${candidates.length}`,
  );
}

main();
