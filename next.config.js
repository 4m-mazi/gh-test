/** @type {import('next').NextConfig} */
const { PHASE_EXPORT, PHASE_PRODUCTION_BUILD } = require("next/constants");

module.exports = (phase, { defaultConfig }) => {
  if (process.env.CF_PAGES_BRANCH === "main") {
    return {
      reactStrictMode: true,
      images: {
        loader: "imgix",
        path: "https://mogyuchi.imgix.net/",
      },
    };
  } else if (process.env.CF_PAGES == 1 && (phase === PHASE_PRODUCTION_BUILD || phase === PHASE_EXPORT)) {
    return {
      reactStrictMode: true,
      images: {
        loader: "custom",
      },
      env: {
        isPreview: true,
      }
    };
  } else return { reactStrictMode: true };
};
