/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        const n8nBase = process.env.N8N_BASE_URL || 'http://n8n:5678';
        return [
            {
                source: '/api/n8n/:path*',
                destination: `${n8nBase}/webhook/:path*`
            }
        ]
    }
}

export default nextConfig;
