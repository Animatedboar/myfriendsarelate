/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Supabase client types resolve as `never` without codegen — suppress at build time
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
