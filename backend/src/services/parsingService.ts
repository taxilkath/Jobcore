// backend/src/services/parsingService.ts
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

export const parseResume = async (buffer: Buffer, mimeType: string): Promise<string> => {
  try {
    if (mimeType === 'application/pdf') {
      const data = await pdf(buffer);
      return data.text;
    }

    if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || // .docx
      mimeType === 'application/msword' // .doc
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }

    // Fallback for plain text files
    if (mimeType === 'text/plain') {
      return buffer.toString('utf-8');
    }

    // If the file type is not supported, return an empty string or throw an error
    console.warn(`Unsupported file type for parsing: ${mimeType}`);
    return '';
  } catch (error) {
    console.error('Error parsing resume file:', error);
    throw new Error('Failed to parse resume content.');
  }
};