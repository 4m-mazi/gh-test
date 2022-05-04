/** @type {import('next').NextConfig} */
const { PHASE_PRODUCTION_BUILD } = require('next/constants')

module.exports = (phase, { defaultConfig }) => {
  if (phase === PHASE_PRODUCTION_BUILD) {
    return {
      reactStrictMode: true,
      images: {
        loader: "imgix",
        path: "https://mogyuchi.imgix.net/",
      },
    };
  } else return { reactStrictMode: true };
};