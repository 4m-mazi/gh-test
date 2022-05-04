/** @type {import('next').NextConfig} */

module.exports = (phase, { defaultConfig }) => {
  if (phase === PHASE_EXPORT) {
    return {
      reactStrictMode: true,
      images: {
        loader: "imgix",
        path: "https://mogyuchi.imgix.net/",
      },
    };
  } else return { reactStrictMode: true };
};
