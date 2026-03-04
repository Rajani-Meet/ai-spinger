import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { github_url, branch = "main" } = body;

        if (!github_url) {
            return NextResponse.json(
                { error: "github_url is required" },
                { status: 400 }
            );
        }

        // Forward to n8n webhook
        const n8nUrl =
            process.env.N8N_WEBHOOK_URL || "http://localhost:5678/webhook/github-to-pdf";

        const n8nRes = await fetch(n8nUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ github_url, branch }),
        });

        if (!n8nRes.ok) {
            throw new Error(`n8n pipeline failed: ${n8nRes.statusText}`);
        }

        const data = await n8nRes.json();

        return NextResponse.json({
            success: true,
            pdf_url: data.pdf_url,
            pipeline: data,
        });
    } catch (err) {
        const error = err as Error;
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
