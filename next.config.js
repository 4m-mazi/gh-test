/** @type {import('next').NextConfig} */
const { PHASE_PRODUCTION_BUILD,  PHASE_EXPORT} = require('next/constants')

module.exports = (phase, { defaultConfig }) => {
  if (phase === PHASE_PRODUCTION_BUILD || phase === PHASE_EXPORT) {
    return {
      reactStrictMode: true,
      images: {
        loader: "imgix",
        path: "https://mogyuchi.imgix.net/",
      },
    };
  } else return { reactStrictMode: true };
};