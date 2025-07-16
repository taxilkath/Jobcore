// backend/src/controllers/tailoringController.ts
import { Request, Response } from 'express';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

const openai = createOpenAI();

export const tailorResume = async (req: Request, res: Response): Promise<any> => {
  const { resumeJson, jobDescription } = req.body;

  if (!resumeJson || !jobDescription) {
    return res.status(400).json({ message: 'Resume JSON and job description are required.' });
  }

  try {
    const prompt = `
      You are an expert career coach and resume writer. Your task is to analyze the provided resume (in JSON format) and the job description.
      Generate specific, actionable suggestions to tailor the resume for this job. For each suggestion, provide the original text, the suggested revision, and a brief explanation.

      Return your response as a single JSON array of suggestion objects, following this exact format:
      [
        {
          "type": "revision" | "addition" | "highlight",
          "section": "summary" | "experience" | "skills" | "projects",
          "originalText": "The original text from the resume to be changed.",
          "suggestedText": "The new, improved text.",
          "explanation": "A brief explanation of why this change improves the resume's match to the job."
        }
      ]
      
      Do not include any text before or after the JSON array.

      ---
      RESUME JSON:
      ${JSON.stringify(resumeJson, null, 2)}
      ---
      JOB DESCRIPTION:
      ${jobDescription}
      ---
    `;

    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: prompt,
    });

    // The AI's response is the JSON string
    res.status(200).json(JSON.parse(text));

  } catch (error) {
    console.error("AI tailoring error:", error);
    res.status(500).json({ message: "Failed to generate resume suggestions." });
  }
};