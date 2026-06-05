MagicBento Integration (trimmed)

This folder contains a lightweight, React-ready version of the MagicBento component adapted to Shree Trading's theme.

Files:
- `MagicBento.jsx` — React component (trimmed example)
- `MagicBento.css` — styles adapted for the site's primary color (orange)

To fully enable the original MagicBento behaviour (particles, spotlight, tilt, etc):
1. Install `gsap` in your React project:

   npm install gsap

2. Copy the full MagicBento source (or the trimmed `MagicBento.jsx`) into your React component tree and import the CSS:

   import MagicBento from './components/MagicBento/MagicBento'
   import './components/MagicBento/MagicBento.css'

3. Render where desired:

   <MagicBento enableStars={true} enableSpotlight={true} glowColor="255,111,0" />

Notes:
- The trimmed component here uses `glowColor: '255,111,0'` (site primary). Adjust props to match your use.
- This repository is primarily a static HTML site. Convert to or integrate with a React app (CRA, Vite, Next.js) to use this component.
