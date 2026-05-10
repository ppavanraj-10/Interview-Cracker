const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})


const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {


    const prompt = `Generate an interview report for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        Requirements:
                        1. Provide exactly 10 technical questions.
                        2. Provide exactly 10 behavioral questions.
                        3. For each question, include the interviewer intention and the best way to answer it.
                        4. Return only valid JSON matching the schema with fields: matchScore, technicalQuestions, behavioralQuestions, skillGaps, preparationPlan, title.
                        5. Do not include any extra explanation outside the JSON object.
`

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(interviewReportSchema),
        }
    })

    return JSON.parse(response.text)


}



async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage();
    
    // Set viewport for A4
    await page.setViewport({ width: 794, height: 1123 })
    
    // Wrap content with strict page-break CSS
    const wrappedHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { 
                    font-family: Arial, Helvetica, sans-serif; 
                    font-size: 10pt; 
                    line-height: 1.2;
                    width: 794px; 
                    height: 1123px;
                    overflow: hidden;
                }
                @page { 
                    size: A4; 
                    margin: 10mm; 
                }
            </style>
        </head>
        <body style="overflow: hidden;">
            ${htmlContent}
        </body>
        </html>
    `
    
    await page.setContent(wrappedHtml, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        preferCSSPageSize: true,
        margin: {
            top: "10mm",
            bottom: "10mm",
            left: "10mm",
            right: "10mm"
        }
    })

    await browser.close()

    return pdfBuffer
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })

    const prompt = `Generate a STRICTLY one-page professional resume for a candidate with the following details:
                        Original Resume: ${resume}
                        Self Description: ${selfDescription}
                        Target Job Description: ${jobDescription}

                        STRICT REQUIREMENTS - FOLLOW EXACTLY:
                        1. The resume MUST be exactly ONE page - NO EXCEPTIONS. This is critical.
                        2. Use compact, concise content - every line must earn its place.
                        3. Maximum 5-6 bullet points per job, 2-3 key achievements max.
                        4. Skills section: List only top 8-12 most relevant skills matching the job description.
                        5. Professional Summary: Maximum 2-3 sentences.
                        6. Work Experience: List only 1-2 most relevant positions with concise bullet points.
                        7. Education: Just degree, university, year - no details needed.
                        8. Use minimal spacing, smaller font sizes (10-11pt body, 14-16pt headings).
                        9. Use a clean, ATS-friendly single-column layout with inline CSS.
                        10. Tailor EVERY piece of content to match the job description requirements.
                        11. Content must sound human-written, not AI-generated.
                        12. Use Arial or Helvetica font for ATS compatibility.
                        
                        The response should be a JSON object with a single field "html" containing the complete HTML content.
                    `

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumePdfSchema),
        }
    })


    const jsonContent = JSON.parse(response.text)

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

    return pdfBuffer

}

module.exports = { generateInterviewReport, generateResumePdf }