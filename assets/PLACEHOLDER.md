# /assets — expected files

Place these files here, using the exact filenames referenced in index.html:

## Video
- hero-loop.mp4       — background loop for the hero (muted, short, looping)
- hero-poster.jpg     — static poster for the hero (shown before video loads, and in reduced-motion)
- video-poster.jpg    — thumbnail for the output video player
- output.mp4          — the main project video (section 02)

## Images (sections 04)
- img1.jpg … img6.jpg     — full-size images (recommended: 1600 px wide, JPEG)
- img1@2x.jpg … img6@2x.jpg  — @2x HiDPI versions (srcset, same as above at 2× res)

## Branding
- school-logo.svg     — already present as placeholder; replace with actual logo SVG

## Notes
- All images are lazy-loaded; no extra JS needed.
- srcset sizes are already wired up in index.html — just supply both 1× and 2× files.
- For the OG/Twitter share image, `hero-poster.jpg` is used — make it 1200×630 px.