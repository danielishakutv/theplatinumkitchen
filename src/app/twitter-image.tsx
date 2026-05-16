// Twitter falls back to og:image when twitter:image is absent, but providing
// the same card explicitly makes summary_large_image render reliably across
// X clients, iMessage, and link-unfurlers that lift twitter:* meta first.
export { default, alt, size, contentType } from "./opengraph-image";
