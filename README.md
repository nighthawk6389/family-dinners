# The Family Table

A mobile-friendly kosher family cookbook powered by the master dinner history.

## Website

Planned URL: https://nighthawk6389.github.io/family-dinners/

To activate the site, visit Settings -> Pages -> Build and deployment -> Source and choose GitHub Actions. Then visit Actions -> Publish Family Dinner Website -> Run workflow if it does not start automatically.

Private repository Pages publishing requires an eligible paid GitHub plan. GitHub Pages sites are generally publicly accessible even when the source repository is private. If this option is unavailable, either make the repository public (only if comfortable) or use an eligible plan.

## Structure

- site/index.html, styles.css, app.js and favicon.svg: responsive static website.
- data/dinners.json: master history, source of truth.
- recipes/: one JSON file per numbered recipe.
- .github/workflows/pages.yml: deployment of the site and the latest dinner JSON after commits to the main branch.

Features: keyword search, kosher-category filters, Shabbat filter, saved favorites in the browser, printable instructions, shareable recipe detail links, and mobile layout.

Only the newer entries (#82–95) contain complete structured ingredients and instructions. The earlier records are displayed as historical dinner ideas, rather than invented recipe steps.

With Pages enabled, new GitHub commits to the dinner JSON will automatically trigger a deployment. The existing ChatGPT daily task is set up to update this repository.
