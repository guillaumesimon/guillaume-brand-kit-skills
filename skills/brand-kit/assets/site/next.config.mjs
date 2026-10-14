import createMDX from "@next/mdx";

// Static export: `npm run build` writes a plain folder (out/) that opens
// anywhere — Vercel, any static host, or `npm start` locally.
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  pageExtensions: ["ts", "tsx", "md", "mdx"],
};

export default createMDX({})(nextConfig);
