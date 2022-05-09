/** @type {import('next').NextConfig} */

module.exports = () => {
  if (process.env.CF_PAGES_BRANCH === "main") {
    return {
      reactStrictMode: true,
      images: {
        loader: "imgix",
        path: "https://mogyuchi.imgix.net/",
      },
    };
  } else if (process.env.CF_PAGES == 1) {
    return {
      reactStrictMode: true,
      images: {
        loader: "custom",
      },
      env: {
        isPreview: true,
      },
    };
  } else return { reactStrictMode: true };
};
