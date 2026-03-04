/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/n8n/:path*',
                destination: 'http://n8n:5678/webhook/:path*'
            }
        ]
    }
}

export default nextConfig;
