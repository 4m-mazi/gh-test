/** @type {import('next').NextConfig} */
const imgConfig = (phase, { defaultConfig }) => {
  if (phase === PHASE_EXPORT) {
    return {
      images: {
        loader: "imgix",
        path: "https://mogyuchi.imgix.net/",
      },
    };
  }
};

const nextConfig = {
  reactStrictMode: true,
  imgConfig,
};

module.exports = nextConfig;
