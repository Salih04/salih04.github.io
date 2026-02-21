# Portfolio Website

Personal portfolio website built with HTML, CSS, and JavaScript.

## Project Structure

- `index.html` – main landing page
- `education.html` – education and certifications overview
- `experiences.html` – professional experience and journey
- `projects.html` – projects showcase
- `skills.html` – technical skills
- `activities.html` – activities and involvement
- `assets/css/styles.css` – global styles
- `assets/js/main.js` – interactive behavior
- `assets/images/` – static image assets

## Local Development

Because this is a static website, you can run it locally by opening `index.html` in a browser.

For a better dev workflow, use a local static server (example):

```bash
python3 -m http.server 8000
```

Then open: `http://localhost:8000`

## Deploy to GitHub Pages

1. Push this repository to GitHub.
2. Open repository **Settings** → **Pages**.
3. Under **Build and deployment**, choose:
	- **Source**: `Deploy from a branch`
	- **Branch**: `main` (or your default branch), folder `/ (root)`
4. Save and wait for deployment.
5. Your site will be available at:
	- `https://<username>.github.io/<repository-name>/`

If you use a repository named `<username>.github.io`, the site URL becomes:

- `https://<username>.github.io/`

## License

For personal portfolio use.
