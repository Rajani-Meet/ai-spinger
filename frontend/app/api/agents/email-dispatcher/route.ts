import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

/**
 * Agent 6: Email Dispatcher
 * Automatically emails the completed Springer PDF paper to all co-authors using Gmail.
 * POST /api/agents/email-dispatcher
 */
export async function POST(req: NextRequest) {
    const startTime = Date.now();

    try {
        const body = await req.json();
        const { authors = [], pdf_url = "", domain = "Computer Science" } = body;

        console.log(`[Email Dispatcher Agent] Initiating logic for ${authors.length} authors...`);

        const gmailUser = process.env.GMAIL_USER;
        const gmailPass = process.env.GMAIL_PASS;

        if (!gmailUser || !gmailPass) {
            console.warn("[Email Dispatcher Agent] GMAIL_USER or GMAIL_PASS environment variables are missing! Falling back to simulation mode.");
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: gmailUser,
                pass: gmailPass
            }
        });

        const emailReceipts = [];

        const validAuthors = authors.filter((a: any) => a.email && a.email.includes("@"));

        if (validAuthors.length > 0) {
            const primaryAuthor = validAuthors[0];
            const coAuthors = validAuthors.slice(1);
            const ccEmails = coAuthors.map((a: any) => a.email).join(", ");
            const ccNames = coAuthors.map((a: any) => a.name).join(", ");

            console.log(`[SMTP Relay] Sending ${domain} Paper link to ${primaryAuthor.name} (CC: ${ccEmails})...`);

            if (gmailUser && gmailPass) {
                try {
                    await transporter.sendMail({
                        from: `"AI-Springer Systems" <${gmailUser}>`,
                        to: primaryAuthor.email,
                        cc: ccEmails,
                        subject: `[AI-Springer] Your ${domain} Paper is Ready for Publication`,
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #fcfcfc;">
                                <div style="text-align: center; margin-bottom: 20px;">
                                    <h1 style="color: #6366f1; margin-bottom: 5px;">AI-Springer</h1>
                                    <p style="color: #888; font-size: 14px; margin-top: 0;">Universal Publication Engine</p>
                                </div>
                                <h2 style="color: #333;">Hello ${primaryAuthor.name},</h2>
                                <p style="color: #444; line-height: 1.6;">
                                    Great news! Your research data has been successfully analyzed and synthesized into a publication-ready Springer LNCS formatted PDF by the AI-Springer system.
                                </p>
                                <div style="background-color: #fff; padding: 15px; border-radius: 8px; border: 1px solid #eee; margin: 20px 0;">
                                    <p style="margin: 5px 0;"><strong>📚 Research Domain:</strong> ${domain}</p>
                                    <p style="margin: 5px 0;"><strong>👤 Primary Author:</strong> ${primaryAuthor.name} (${primaryAuthor.affiliation})</p>
                                    ${coAuthors.length > 0 ? `<p style="margin: 5px 0;"><strong>👥 Co-Authors (CC'd):</strong> ${ccNames}</p>` : ''}
                                </div>
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="http://localhost:3000${pdf_url}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                                        � Download Formatted PDF
                                    </a>
                                </div>
                                <div style="border-top: 1px solid #eaeaea; padding-top: 20px; text-align: center; color: #888; font-size: 12px;">
                                    <p>This is an automated message from the AI-Springer Intelligent Pipeline.</p>
                                    <p>Accelerating academic research universally.</p>
                                </div>
                            </div>
                        `
                    });

                    emailReceipts.push({
                        author: primaryAuthor.name,
                        email: primaryAuthor.email,
                        role: "Primary",
                        status: "sent-live",
                        timestamp: new Date().toISOString()
                    });

                    coAuthors.forEach((ca: any) => {
                        emailReceipts.push({
                            author: ca.name,
                            email: ca.email,
                            role: "Co-Author (CC)",
                            status: "sent-live",
                            timestamp: new Date().toISOString()
                        });
                    });

                } catch (err: any) {
                    console.error(`[SMTP Relay] Failed to send email to ${primaryAuthor.email}:`, err.message);
                    emailReceipts.push({
                        author: primaryAuthor.name,
                        email: primaryAuthor.email,
                        status: "failed",
                        error: err.message,
                        timestamp: new Date().toISOString()
                    });
                }
            } else {
                // Simulation fallback
                await new Promise(resolve => setTimeout(resolve, 500));
                emailReceipts.push({
                    author: primaryAuthor.name,
                    email: primaryAuthor.email,
                    role: "Primary",
                    status: "simulated-success",
                    timestamp: new Date().toISOString()
                });
            }
        }

        console.log(`[Email Dispatcher Agent] Processed ${emailReceipts.length} emails with attachment link: ${pdf_url}`);

        return NextResponse.json({
            success: true,
            receipts: emailReceipts,
            metadata: {
                agent_id: "email-dispatcher",
                duration_ms: Date.now() - startTime,
                timestamp: new Date().toISOString(),
                mode: (gmailUser && gmailPass) ? "live" : "simulated"
            }
        });

    } catch (err) {
        const error = err as Error;
        console.error("[Email Dispatcher Agent] Failed to dispatch emails:", error);
        return NextResponse.json(
            { error: error.message, agent_id: "email-dispatcher" },
            { status: 500 }
        );
    }
}
