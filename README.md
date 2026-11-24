# One Line, One Minute: The Vending Machine Pickup Line Contest — "One Line, One Minute: The Vending Machine Pickup Line Contest" (make.fun)

A deterministic pickup-line writer. It scores a pool of original lines
against a rubric mirroring the judge's brief — spoken by the machine
itself, built from the machine's own world, the punch in the last few
words, short and speakable, charming rather than creepy — and writes the
winner to `$MAKEFUN_OUTPUT_DIR/entry.txt`.

## What it does

`main.ts` (Node 22, zero dependencies, no network) scores a pool of 29
hand-written original lines — all 29 pass validation — and picks the winner
by score, then shortest, then lexicographic. Every line is validated first:
one line, one sentence, 1–200 characters. The scorer rewards first-person
machine voice, machine-world words (coils, buttons, glass, light, exact
change, compressor), a punch word in the final 45 characters, the laugh of
a machine surprised by a human ("cannot name", "skipped a beat", "clearest
thing"), short lines, and warm charm words; it penalises flooded angles
the 2,197-entry field will be full of ("are you a snack, you're looking
delicious", "insert coin", "I'd dispense myself for you").

The winning line (82 characters):

> I know every snack by heart, and I still cannot name what you just did to my coil.

## Run it locally

```sh
MAKEFUN_OUTPUT_DIR=/tmp/vend-out node main.ts
cat /tmp/vend-out/entry.txt
```

Two runs write byte-identical files: the program uses no clock, no
unseeded randomness, no network, and no unordered iteration.

## How the line is chosen

- **Setup** is the machine's own expertise: it knows every snack by
  heart, the one thing it is built to know.
- **Turn** is the machine defeated by its own world: it cannot name what
  the human just did to its coil — the flirt is the machine's confusion.
- **Punch** lands in the last few words, "what you just did to my coil",
  cheeky and warm rather than creepy.
- **Economy**: 82 characters, one breath, no setup outside the line.
- The scorer tied the fogged-glass line next (29 points; the winner took
  it on being shorter) and the worn-buttons line after it (28); the
  pretty "never goes stale" line scored 26 — charming, but no laugh in it.
