// backend/src/services/aiService.ts
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai'; // We will use the more basic 'generateText' function

const openai = createOpenAI({
  // The API key is automatically read from the OPENAI_API_KEY environment variable
});

export const parseResumeToJson = async (textContent: string): Promise<any> => {
  try {
    // --- THE FIX IS HERE ---
    // We construct a detailed prompt that asks the AI to return a JSON string.
    // This gives us direct control and bypasses the schema validation issue.
    const prompt = `
      You are an expert resume parsing API. Your sole task is to convert the following resume text into a single, valid JSON object. Do not include any text before or after the JSON object. Do not use markdown backticks like \`\`\`json.

      The JSON object should have the following structure:
      {
        "contact": { "name": "", "email": "", "phone": "", "location": "", "linkedin": "", "github": "", "portfolio": "" },
        "summary": "",
        "experience": [{ "title": "", "company": "", "startDate": "", "endDate": "", "duties": [""] }],
        "education": [{ "degree": "", "school": "", "date": "" }],
        "skills": { "frontend": [], "backend": [], "databases": [], "devops": [], "testing": [] },
        "projects": [],
        "certifications": []
      }

      If a field or section is not present in the resume, omit the key entirely from the JSON object.

      Here is the resume text to parse:
      ---
      ${textContent}
      ---
    `;

    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: prompt,
      // We can add parameters to encourage better JSON output
      temperature: 0,
      maxTokens: 2048,
    });
    
    // Manually parse the JSON string returned by the AI
    return JSON.parse(text);

  } catch (error) {
    console.error("Error parsing resume with Vercel AI SDK:", error);
    // This will give us more detailed logs if the AI's output is not valid JSON
    if (error instanceof SyntaxError) {
      console.error("AI returned invalid JSON:", error.message);
    }
    throw new Error("The AI service failed to parse the resume. Please check the backend logs.");
  }
};