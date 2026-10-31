# Family Dinners

A versioned collection of **95 kosher family dinner ideas** for a future recipe website.

## Files

- **[`data/dinners.json`](data/dinners.json)** — complete numbered catalog with preferences and category counts.
- **[`recipes/`](recipes/)** — one JSON file per dinner, with the stable dinner number and URL-friendly slug in its filename.
- **[`docs/RECIPE_SCHEMA.md`](docs/RECIPE_SCHEMA.md)** — field definitions and workflow.

## Data completeness

**Dinners #1–81:** Mostly a title, summary, ingredients *inferred from the title only as named components*, category and tags. These are historical records; don't treat them as complete recipes.

**Dinners #82–95:** Contain ingredient lists, cooking directions, time estimates, child-friendly adjustments and leftover notes.

The catalog preserves prior exact and near-duplicate dinner suggestions, including their original numbers, for history fidelity. Some entries have `possible_related_or_duplicate_of`.

## Daily update workflow

The ChatGPT daily dinner task is intended to:
1. Read the live `data/dinners.json` from this repository before choosing a recipe.
2. Choose a genuinely new dinner respecting kosher meat/dairy separation, meal rotation, and the full history.
3. Assign the next consecutive `number`.
4. Commit **both** `recipes/NNN-slug.json` and the appended record in `data/dinners.json`, refreshing summary counts.
5. Read back both files to verify success. If the GitHub write cannot be completed, explicitly say the recipe has **not been saved**.

Future recipes should include full ingredients, instructions, total/active minutes, kids' modifications and leftovers, with appropriate Shabbat notes on Fridays. No dinner suggestions on Saturdays.

The repository is private; GitHub commit history tracks all changes.
