# XZAI Digital Business Card

A static, mobile-first digital profile for NFC business cards. It uses plain HTML, CSS, JavaScript, and per-customer JSON files—so it can be published on GitHub Pages with no backend.

## Quick start

Upload this whole folder to a static host, then open `index.html?profile=john`. On GitHub Pages, the full URL will resemble `https://yourname.github.io/repository/?profile=john`.

> Do not double-click `index.html` to test it: browsers often block JSON `fetch()` from local files. Use a local static server or publish it to GitHub Pages.

## How it works

`index.html`, `style.css`, and `script.js` are the reusable template. `script.js` reads the profile name from `?profile=...` and loads the matching file from `profiles/`.

For `?profile=john`, it loads `profiles/john.json`. The template automatically hides any field that is blank or missing.

## Add a customer

1. Copy `profiles/example.json` and rename the copy with a simple lowercase slug, for example `profiles/maria.json`.
2. Edit only that JSON file with the customer’s information.
3. Put their photo in `assets/profile/`, for example `assets/profile/maria.jpg`.
4. Set `"profileImage": "assets/profile/maria.jpg"` in the JSON.
5. Their shareable/NFC URL is `https://your-domain/?profile=maria`.

Use lowercase letters, numbers, hyphens, or underscores in profile filenames. The page has an initials placeholder if a photo is absent or fails to load.

## Edit contact and social links

Enter full URLs in the `socials` object. Empty values or omitted keys do not render a button. `phone` automatically becomes a `tel:` link and `email` becomes a `mailto:` link. For Viber, paste the customer’s exact Viber deep link, such as `viber://chat?number=%2B639171234567`.

Add as many custom links as desired:

```json
"customLinks": [
  { "title": "My Portfolio", "url": "https://example.com/portfolio" },
  { "title": "Book an Appointment", "url": "https://calendly.com/example" }
]
```

Optional `location` (or `address`), `birthday`, and `businessHours` fields appear only when supplied. The company and job title are included in the visual profile and generated vCard.

## Save Contact

The **Save Contact** button makes a `.vcf` vCard directly in the browser. It includes the customer’s name, phone, email, company, title, and website. No information is sent to a server.

## Deploy to GitHub Pages

1. Create a GitHub repository and upload these files, preserving folders.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**, choose `main` and `/ (root)`, then save.
4. Wait for GitHub’s Pages URL and test `?profile=john`.

## Custom domain and NFC

Later, add your domain under **Settings → Pages → Custom domain**, then follow your domain registrar’s DNS instructions. Keep each customer URL stable: for example, program an NFC card once with `https://xzai.ph/?profile=john`. You can update `profiles/john.json` at any time without rewriting the card.

If your host supports a rewrite/fallback rule, you may also point `/john` to `index.html`; the script recognizes the final path segment. GitHub Pages does not provide configurable rewrites, so its reliable Version 1 format is `?profile=john`.

## Before launching

Test every customer URL on a phone. Check that their photo loads, missing fields remain hidden, each social URL opens the correct destination, Viber opens with its supplied deep link, Call/Email open their apps, and Save Contact downloads a usable contact file.
