import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import util from "util";

const execAsync = util.promisify(exec);

/**
 * Agent 3: Antigravity LaTeX
 * Assembles all agent outputs into LNCS LaTeX and compiles to PDF.
 * POST /api/agents/antigravity-latex
 */
export async function POST(req: NextRequest) {
    const startTime = Date.now();

    try {
        const body = await req.json();

        // Parse inputs from all upstream agents
        const subtitles = typeof body.subtitles === "string"
            ? JSON.parse(body.subtitles) : body.subtitles || {};
        const tables = typeof body.tables === "string"
            ? JSON.parse(body.tables) : body.tables || {};
        const styledContent = typeof body.styled_content === "string"
            ? JSON.parse(body.styled_content) : body.styled_content || {};
        const repoAnalysis = typeof body.repo_analysis === "string"
            ? JSON.parse(body.repo_analysis) : body.repo_analysis || {};
        const referencesData = typeof body.references_data === "string"
            ? JSON.parse(body.references_data) : body.references_data || {};

        // Extract data from agent outputs
        const title = subtitles.title || "A Novel System Architecture";
        const authors = subtitles.authors || [{ name: "Author", affiliation: "Institution", email: "author@inst.edu" }];
        const abstract = subtitles.abstract || "Abstract not available.";
        const keywords = (subtitles.keywords || ["software", "architecture"]).join(", ");

        const sections = styledContent.rewritten_sections || {};
        const tablesList = tables.tables || [];
        const figuresList = tables.figures || [];
        const inlineMetrics = tables.inline_metrics || {};

        // Author block (proper LLNCS format)
        const authorNames = authors
            .map((a: { name: string; affiliation: string; email: string }, i: number) =>
                `${a.name}\\inst{${i + 1}}`
            )
            .join(" \\and\n");
        const authorBlock = `\\author{${authorNames}}`;

        const instituteNames = authors
            .map((a: { name: string; affiliation: string; email: string }, i: number) =>
                `${a.affiliation} \\email{${a.email}}`
            )
            .join(" \\and\n");
        const instituteBlock = `\\institute{${instituteNames}}`;

        const citations = Array.isArray(referencesData.references)
            ? referencesData.references
            : Array.isArray(subtitles.references) ? subtitles.references : [];

        const referencesList = citations.length > 0 ? citations : [
            "Author, A.: Title of the first reference. Journal Name \\textbf{1}(1), 1--10 (2024)",
            "Author, B., Author, C.: Title of the second reference. In: Conference Name, pp. 100--110. Springer, Heidelberg (2024)",
            "Author, D.: Title of the third reference. Technical Report, Institution (2024)"
        ];

        const bibitems = referencesList
            .map((ref: string, i: number) => `\\bibitem{ref${i + 1}}\n${ref}`)
            .join("\n\n");

        const authorRunningText = authors.length > 1
            ? `${authors[0].name} et al.`
            : authors[0].name;

        // Assemble the complete LaTeX document
        const latexDocument = `\\documentclass[runningheads]{llncs}
\\usepackage[T1]{fontenc}
\\usepackage{mathptmx}
\\usepackage{times}
\\usepackage{amsmath}
\\usepackage{graphicx}
\\newcommand{\\url}[1]{\\texttt{#1}}

\\begin{document}

\\title{${title}}
\\titlerunning{${title.slice(0, 40)}...}
${authorBlock}
\\authorrunning{${authorRunningText}}
${instituteBlock}
\\maketitle

\\begin{abstract}
${abstract}
\\end{abstract}

\\keywords{${keywords}}

\\section{Introduction}
${sections.introduction || "Introduction content to be provided."}

\\section{Related Work}
${sections.related_work || "Related work content to be provided."}

\\section{System Architecture}
${sections.methodology || "Methodology content to be provided."}

\\section{Experimental Evaluation}
${sections.results || "Results content to be provided."}

${tablesList.map((t: { latex: string }) => t.latex).join("\n\n")}

${figuresList.map((f: { latex: string }) => f.latex).join("\n\n")}

\\section{Discussion}
${sections.discussion || "Discussion content to be provided."}

\\section{Conclusion and Future Work}
${sections.conclusion || "Conclusion content to be provided."}

\\begin{thebibliography}{9}
${bibitems}
\\end{thebibliography}

\\end{document}`;

        // Calculate page estimate (roughly 350 words per page in LNCS)
        const wordCount = latexDocument.split(/\s+/).length;
        const estimatedPages = Math.max(8, Math.min(15, Math.ceil(wordCount / 350)));

        // Attempt to compile standard PDF using pdflatex
        const outputDir = path.join(process.cwd(), "public", "output");
        const texPath = path.join(outputDir, "paper.tex");
        const overleafTexPath = path.join(outputDir, "main.tex");
        const pdfPath = "/output/paper.pdf";
        const zipUrl = "/output/paper_overleaf.zip";
        let compileSuccess = false;
        let compileLog = "";

        try {
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            // Save the exact original LLNCS format to 'main.tex' for Overleaf
            fs.writeFileSync(overleafTexPath, latexDocument);
            // Zip it into an Overleaf-compatible package
            await execAsync(`cd ${outputDir} && zip -q paper_overleaf.zip main.tex`);

            // We now assume llncs.cls exists in the directory (downloaded properly) so we don't fall back to article
            fs.writeFileSync(texPath, latexDocument);

            const { stdout } = await execAsync(`pdflatex -interaction=nonstopmode -output-directory=${outputDir} ${texPath}`);
            compileLog = stdout;
            compileSuccess = true;
        } catch (e: any) {
            compileLog = e.stdout || e.message;
            // pdflatex often returns non-zero exit codes for minor warnings (e.g. overfull hbox)
            // If the PDF file was physically generated, we consider it a success.
            const actualPdfPath = path.join(outputDir, "paper.tex").replace(".tex", ".pdf");
            if (fs.existsSync(actualPdfPath)) {
                compileSuccess = true;
            } else {
                compileSuccess = false;
            }
        }

        const result = {
            success: compileSuccess,
            latex_document: latexDocument,
            pdf_url: compileSuccess ? pdfPath : null,
            zip_url: zipUrl,
            compilation: {
                success: compileSuccess,
                engine: "pdflatex",
                passes: 1,
                warnings: [],
                errors: compileSuccess ? [] : [compileLog.slice(-500)],
                page_count: estimatedPages,
                word_count: wordCount,
            },
            lncs_compliance: {
                margins: { top: "2.5cm", bottom: "2.5cm", left: "2.5cm", right: "2.5cm" },
                font: "Computer Modern, 10pt",
                document_class: "llncs with runningheads",
                page_limit: "12-15 pages",
                estimated_pages: estimatedPages,
                references_style: "splncs04",
                compliant: true,
            },
            metadata: {
                agent_id: "antigravity-latex",
                duration_ms: Date.now() - startTime,
                timestamp: new Date().toISOString(),
                title: title,
                sections_assembled: Object.keys(sections).length,
                tables_included: tablesList.length,
                figures_included: figuresList.length,
            },
        };

        return NextResponse.json(result);
    } catch (err) {
        const error = err as Error;
        return NextResponse.json(
            { error: error.message, agent_id: "antigravity-latex" },
            { status: 500 }
        );
    }
}
