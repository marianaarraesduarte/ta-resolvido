/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // fotos comprimidas viram data URL em base64 (~33% maior que o arquivo)
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
