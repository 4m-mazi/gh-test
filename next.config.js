/** @type {import('next').NextConfig} */
const { PHASE_EXPORT } = require("next/constants");

module.exports = (phase, { defaultConfig }) => {
  if (process.env.CF_PAGES_BRANCH === "main") {
    return {
      reactStrictMode: true,
      images: {
        loader: "imgix",
        path: "https://mogyuchi.imgix.net/",
      },
    };
  } else if (phase === PHASE_EXPORT) {
    return {
      reactStrictMode: true,
      images: {
        loader: "imgix",
        path: "",
      },
    };
  } else return { reactStrictMode: true };
};
