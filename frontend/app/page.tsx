"use client";

import { useState, useEffect } from "react";
import { supabase } from '../lib/supabase';

type AgentStatus = "pending" | "running" | "done" | "error";

interface PipelineState {
    claudeRepoAnalyzer: AgentStatus;
    perplexitySubtitles: AgentStatus;
    geminiResults: AgentStatus;
    chatgptStyle: AgentStatus;
    antigravityLatex: AgentStatus;
    emailAuthors: AgentStatus;
}

const AGENTS = [
    { key: "claudeRepoAnalyzer", label: "Claude Repo Analyzer", desc: "GitHub → JSON" },
    { key: "perplexitySubtitles", label: "Perplexity Subtitles", desc: "LNCS headings" },
    { key: "geminiResults", label: "Gemini Results", desc: "LaTeX tables" },
    { key: "chatgptStyle", label: "ChatGPT Style", desc: "97% voice clone" },
    { key: "antigravityLatex", label: "Antigravity LaTeX", desc: "LNCS → PDF" },
    { key: "emailAuthors", label: "Email Dispatcher", desc: "Notify Co-authors" },
] as const;

const PIPELINE_STEPS = [
    { number: "1", title: "Paste GitHub URL", description: "Enter any public GitHub repository URL" },
    { number: "2", title: "AI Analysis", description: "5 agents process your repo in parallel" },
    { number: "3", title: "LaTeX Assembly", description: "LNCS template with 2.5cm margins" },
    { number: "4", title: "Download PDF", description: "Publication-ready Springer paper" },
    { number: "5", title: "Email Authors", description: "Dispatch to all co-authors" },
];

export default function Home() {
    const [githubUrl, setGithubUrl] = useState("");
    const [targetPages, setTargetPages] = useState<number | "">(10);
    const [domain, setDomain] = useState("Computer Science");
    const [projectOverview, setProjectOverview] = useState("");
    const [styleReference, setStyleReference] = useState("");
    const [authors, setAuthors] = useState<{ name: string, affiliation: string, email: string }[]>([
        { name: "Rajani-Meet", affiliation: "Research Institution", email: "rajani-meet@research.edu" }
    ]);

    const handleAuthorChange = (index: number, field: string, value: string) => {
        const newAuthors = [...authors];
        newAuthors[index] = { ...newAuthors[index], [field]: value };
        setAuthors(newAuthors);
    };

    const addCoAuthor = () => {
        setAuthors([...authors, { name: "", affiliation: "", email: "" }]);
    };

    const removeAuthor = (index: number) => {
        const newAuthors = [...authors];
        newAuthors.splice(index, 1);
        setAuthors(newAuthors);
    };

    // Supabase Auth State
    const [session, setSession] = useState<any>(null);
    const [authEmail, setAuthEmail] = useState("");
    const [authPassword, setAuthPassword] = useState("");
    const [authLoading, setAuthLoading] = useState(false);
    const [authError, setAuthError] = useState("");
    const [authMode, setAuthMode] = useState<"login" | "register">("login");
    const [generations, setGenerations] = useState<any[]>([]);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) fetchGenerations(session.user.id);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) fetchGenerations(session.user.id);
        });

        return () => subscription.unsubscribe();
    }, []);

    async function fetchGenerations(userId: string) {
        const { data, error } = await supabase
            .from('generations')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (data) setGenerations(data);
    }

    async function handleAuth(e: React.FormEvent) {
        e.preventDefault();
        setAuthLoading(true);
        setAuthError("");
        try {
            if (authMode === "login") {
                const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
                if (error) throw error;
            } else {
                const { data, error } = await supabase.auth.signUp({ email: authEmail, password: authPassword });
                if (error) throw error;

                // If user is created but session is null, email confirmation is turned on in Supabase
                if (data.user && !data.session) {
                    setAuthError("Registration successful! Please check your email to confirm your account, or disable 'Confirm email' in your Supabase Authentication settings.");
                }
            }
        } catch (error: any) {
            setAuthError(error.message);
        } finally {
            setAuthLoading(false);
        }
    }

    async function handleLogout() {
        await supabase.auth.signOut();
    }

    const [isProcessing, setIsProcessing] = useState(false);
    const [pdfReady, setPdfReady] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [zipUrl, setZipUrl] = useState<string | null>(null);
    const [pipeline, setPipeline] = useState<PipelineState>({
        claudeRepoAnalyzer: "pending",
        perplexitySubtitles: "pending",
        geminiResults: "pending",
        chatgptStyle: "pending",
        antigravityLatex: "pending",
        emailAuthors: "pending",
    });

    const N8N_WEBHOOK = "/api/n8n";

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!githubUrl.trim()) return;

        setIsProcessing(true);
        setPdfReady(false);
        setPdfUrl(null);
        setZipUrl(null);

        // Simulate pipeline progression
        setPipeline((p) => ({ ...p, claudeRepoAnalyzer: "running" }));

        try {
            const res = await fetch(`${N8N_WEBHOOK}/github-to-pdf`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    github_url: githubUrl,
                    branch: "main",
                    target_pages: targetPages,
                    domain: domain,
                    project_overview: projectOverview,
                    style_reference: styleReference,
                    authors: authors
                }),
            });

            if (!res.ok) throw new Error(`Pipeline failed: ${res.statusText}`);

            const data = await res.json();

            setPipeline({
                claudeRepoAnalyzer: "done",
                perplexitySubtitles: "done",
                geminiResults: "done",
                chatgptStyle: "done",
                antigravityLatex: "done",
                emailAuthors: "running",
            });

            // Auto-email all authors
            try {
                await fetch('/api/agents/email-dispatcher', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        authors: authors,
                        pdf_url: data.pdf_url || "#",
                        domain: domain
                    })
                });
                setPipeline(p => ({ ...p, emailAuthors: "done" }));
            } catch (err) {
                console.error("Email agent failed", err);
                setPipeline(p => ({ ...p, emailAuthors: "error" }));
            }

            setPdfUrl(data.pdf_url || "#");
            setZipUrl(data.zip_url || "#");
            setPdfReady(true);

            // Save to cloud if logged in
            if (session) {
                const { error: dbError } = await supabase.from('generations').insert([
                    {
                        user_id: session.user.id,
                        github_url: githubUrl,
                        pdf_url: data.pdf_url || "#",
                        zip_url: data.zip_url || "#",
                        created_at: new Date().toISOString()
                    }
                ]);
                if (!dbError) fetchGenerations(session.user.id);
            }

        } catch (err) {
            console.error("Pipeline error:", err);
            setPipeline((prev) => {
                const updated = { ...prev };
                (Object.keys(updated) as (keyof PipelineState)[]).forEach((key) => {
                    if (updated[key] === "running") updated[key] = "error";
                });
                return updated;
            });
        } finally {
            setIsProcessing(false);
        }
    }

    if (!session) {
        return (
            <main className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <div className="glass-card" style={{ padding: '40px', maxWidth: '400px', width: '100%' }}>
                    <h2 style={{ marginBottom: '20px', textAlign: 'center', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        AI-Springer Cloud Access
                    </h2>
                    <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label className="form-label">Email</label>
                            <input type="email" className="url-input" style={{ width: '100%' }} value={authEmail} onChange={e => setAuthEmail(e.target.value)} required />
                        </div>
                        <div>
                            <label className="form-label">Password</label>
                            <input type="password" className="url-input" style={{ width: '100%' }} value={authPassword} onChange={e => setAuthPassword(e.target.value)} required />
                        </div>
                        {authError && <p style={{ color: 'var(--error)', fontSize: '0.85rem' }}>{authError}</p>}
                        <button type="submit" className="submit-btn" disabled={authLoading}>
                            {authLoading ? "Loading..." : (authMode === "login" ? "Sign In" : "Register")}
                        </button>
                    </form>
                    <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {authMode === "login" ? "Don't have an account?" : "Already have an account?"}
                        <button onClick={() => setAuthMode(authMode === "login" ? "register" : "login")} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', marginLeft: '5px' }}>
                            {authMode === "login" ? "Register here" : "Sign in here"}
                        </button>
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="container">
            <header style={{ display: 'flex', justifyContent: 'flex-end', padding: '20px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Logged in as {session.user.email}</span>
                    <button onClick={handleLogout} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '6px 12px', borderRadius: 'var(--radius-xs)', cursor: 'pointer' }}>Sign Out</button>
                </div>
            </header>

            {/* Hero */}
            <section className="hero" style={{ paddingTop: '20px' }}>
                <h1>AI-Springer</h1>
                <p className="subtitle">Universal Publication Engine: GitHub | PDF | Docs | ZIP → Springer LNCS PDF</p>
            </section>

            {/* URL Input */}
            <section className="input-section fade-in">
                <form onSubmit={handleSubmit}>
                    <div className="input-wrapper">
                        <input
                            id="github-url-input"
                            type="text"
                            className="url-input"
                            placeholder="https://github.com/user/repo OR Drive/Dataset Link"
                            value={githubUrl}
                            onChange={(e) => setGithubUrl(e.target.value)}
                            disabled={isProcessing}
                            required
                        />
                        <button
                            id="convert-btn"
                            type="submit"
                            className="submit-btn"
                            disabled={isProcessing || !githubUrl.trim()}
                        >
                            {isProcessing ? "Processing..." : "Generate PDF"}
                        </button>
                    </div>

                    <div className="form-grid">
                        <div className="form-grid-2">
                            <div>
                                <label className="form-label">Target Page Length (e.g. 10)</label>
                                <input type="number" className="url-input" value={targetPages} onChange={e => setTargetPages(e.target.value === "" ? "" : parseInt(e.target.value))} style={{ width: "100%", padding: "12px" }} />
                            </div>
                            <div>
                                <label className="form-label">Research Domain</label>
                                <select className="url-input" value={domain} onChange={e => setDomain(e.target.value)} style={{ width: "100%", padding: "12px", appearance: "none", cursor: "pointer" }}>
                                    <option value="Computer Science">Computer Science & Software</option>
                                    <option value="Medicine & Clinical Research">Medicine & Clinical Research</option>
                                    <option value="Biology & Genomics">Biology & Genomics</option>
                                    <option value="Physics & Engineering">Physics & Engineering</option>
                                    <option value="Business & Analytics">Business & Analytics</option>
                                    <option value="Humanities & Social Sciences">Humanities & Social Sciences</option>
                                </select>
                            </div>
                        </div>

                        {authors.map((author, idx) => (
                            <div key={idx} style={{ padding: '16px', background: 'var(--bg-card-hover)', borderRadius: 'var(--radius-sm)', position: 'relative' }}>
                                <h4 style={{ marginBottom: '12px', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{idx === 0 ? "First Author" : `Co-Author ${idx}`}</h4>
                                {idx > 0 && (
                                    <button type="button" onClick={() => removeAuthor(idx)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: '0.8rem' }}>Remove</button>
                                )}
                                <div className="form-grid-2" style={{ marginBottom: '12px' }}>
                                    <div>
                                        <label className="form-label">Name</label>
                                        <input type="text" className="url-input" value={author.name} onChange={e => handleAuthorChange(idx, "name", e.target.value)} style={{ width: "100%", padding: "12px" }} required />
                                    </div>
                                    <div>
                                        <label className="form-label">Email</label>
                                        <input type="email" className="url-input" value={author.email} onChange={e => handleAuthorChange(idx, "email", e.target.value)} style={{ width: "100%", padding: "12px" }} required />
                                    </div>
                                </div>
                                <div>
                                    <label className="form-label">Affiliation</label>
                                    <input type="text" className="url-input" value={author.affiliation} onChange={e => handleAuthorChange(idx, "affiliation", e.target.value)} style={{ width: "100%", padding: "12px" }} required />
                                </div>
                            </div>
                        ))}

                        <button type="button" onClick={addCoAuthor} style={{ padding: '10px', background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' }}>
                            + Add Co-Author
                        </button>

                        <div>
                            <label className="form-label">Project Overview (Optional: Define what the paper should focus on)</label>
                            <textarea className="textarea-input" value={projectOverview} onChange={e => setProjectOverview(e.target.value)} placeholder="e.g. This project focuses on real-time web sync using WebRTC..."></textarea>
                        </div>

                        <div>
                            <label className="form-label">Style Reference (Optional: Paste a paragraph of academic text to mimic)</label>
                            <textarea className="textarea-input" value={styleReference} onChange={e => setStyleReference(e.target.value)} placeholder="e.g. We propose a radically highly distributed algorithmic architecture..."></textarea>
                        </div>
                    </div>
                </form>
            </section>

            {/* Pipeline Steps */}
            <section className="pipeline fade-in">
                {PIPELINE_STEPS.map((step) => (
                    <div key={step.number} className="glass-card pipeline-step">
                        <div className="step-number">{step.number}</div>
                        <h3>{step.title}</h3>
                        <p>{step.description}</p>
                    </div>
                ))}
            </section>

            {/* Agent Status */}
            {isProcessing && (
                <section className="status-section glass-card fade-in">
                    {AGENTS.map((agent) => (
                        <div key={agent.key} className="status-item">
                            <span className={`status-dot ${pipeline[agent.key]}`} />
                            <span className="status-label">{agent.label}</span>
                            <span className="status-detail">{agent.desc}</span>
                        </div>
                    ))}
                </section>
            )}

            {/* Download */}
            {pdfReady && (
                <section className="download-section fade-in" style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                    {pdfUrl && pdfUrl !== "#" && (
                        <a href={pdfUrl} download>
                            <button id="download-pdf-btn" className="download-btn">
                                📄 Download Springer PDF
                            </button>
                        </a>
                    )}
                    {zipUrl && zipUrl !== "#" && (
                        <a href={zipUrl} download>
                            <button id="download-zip-btn" className="download-btn" style={{ background: 'var(--accent)' }}>
                                📦 Download Overleaf ZIP
                            </button>
                        </a>
                    )}
                </section>
            )}

            {/* Cloud Storage History */}
            <section className="fade-in" style={{ marginTop: '60px', paddingBottom: '60px' }}>
                <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', color: 'var(--text-primary)' }}>Your Cloud Library</h3>
                {generations.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No PDFs generated yet. Generate your first paper above!</p>
                ) : (
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {generations.map((gen, idx) => (
                            <div key={idx} className="glass-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>{gen.github_url}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(gen.created_at).toLocaleString()}</div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {gen.pdf_url && gen.pdf_url !== "#" && (
                                        <a href={gen.pdf_url} download style={{ textDecoration: 'none' }}>
                                            <button style={{ background: 'var(--success)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 'var(--radius-xs)', cursor: 'pointer', fontWeight: '500' }}>
                                                PDF
                                            </button>
                                        </a>
                                    )}
                                    {gen.zip_url && gen.zip_url !== "#" && (
                                        <a href={gen.zip_url} download style={{ textDecoration: 'none' }}>
                                            <button style={{ background: 'var(--accent)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 'var(--radius-xs)', cursor: 'pointer', fontWeight: '500' }}>
                                                ZIP
                                            </button>
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
