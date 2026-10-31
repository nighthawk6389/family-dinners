# Recipe JSON schema (informal)

`data/dinners.json` is an object with `schema_version`, `exported_at`, `title`, `description`, `preferences`, `counts`, and a `dinners` array.

Each entry in `dinners` is also stored under `recipes/NNN-slug.json`.

## Required fields

- `number` — stable integer, 1-based; never renumber.
- `title` — human-friendly dinner name.
- `slug` — stable URL slug prefixed by zero-padded number.
- `kosher_category` — `meat`, `dairy`, `pareve`, or `fish_pareve`.
- `primary_category` — e.g., `chicken`, `fish`, `turkey`, `dairy_vegetarian`, `pareve_vegetarian`.
- `shabbat_friendly` — boolean.
- `meal_formats` — string tags.
- `components_from_title` — short title-derived meal components; **not** a complete ingredient list.
- `summary` — short website description.

## Full-recipe fields (optional on the legacy records, required for new records)

- `ingredients` — array of amounts + ingredients.
- `instructions` — ordered array of cooking steps.
- `estimated_total_minutes`, `estimated_active_minutes` — numbers.
- `child_friendly_modifications`, `leftovers` — strings.

## Historical caveats

Legacy #1–81 mostly lack complete recipe fields. Don't invent them from titles. `possible_related_or_duplicate_of` flags related or duplicated historical entries.

## New-entry validation

Check consecutive numbering, unique slug, compatible kosher ingredients, realistic timing, and duplicates against the **entire** master catalog. Refresh `counts.total_dinners`, `counts.by_primary_category`, `counts.by_kosher_category`, and `counts.shabbat_friendly_count`. Keep all historical records intact.
