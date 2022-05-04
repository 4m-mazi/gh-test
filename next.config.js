/** @type {import('next').NextConfig} */
const { PHASE_EXPORT } = require('next/constants')

const nextConfig = {
  reactStrictMode: true,
  images: {
    loader: "imgix",
    path: "https://mogyuchi.imgix.net/",
  },
};

module.exports = nextConfig
