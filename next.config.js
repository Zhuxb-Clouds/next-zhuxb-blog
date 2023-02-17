/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  distDir: "build",
  images: {
    loader: "akamai",
    path: "",
  },
};
