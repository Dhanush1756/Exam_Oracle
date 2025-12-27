
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { StudySource, StudyGuideResponse, Quiz, Concept, ChatMessage, SimplifiedExplanation } from "../types";

export const generateStudyGuide = async (sources: StudySource[]): Promise<StudyGuideResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `You are the 'Exam Oracle,' a world-class tutor.
  Analyze these sources (Syllabus, Notes, Textbook) and find concepts that overlap in at least TWO categories.
  
  ALSO: Use your search tool to find 3-5 high-quality, reliable external web references (e.g., Wikipedia, official government legal portals like India Code for IT acts, educational platforms like Khan Academy or Coursera) that provide deeper context for the identified core concepts.
  
  Document Manifest:
  ${sources.map(s => `- Category: ${s.category}, File: ${s.fileName}`).join('\n')}
  `;

  const parts: any[] = [{ text: prompt }];
  
  for (const source of sources) {
    if (source.type === 'file') {
      const base64Data = source.content.split(',')[1] || source.content;
      parts.push({
        inlineData: {
          mimeType: source.mimeType,
          data: base64Data
        }
      });
      parts.push({ text: `Context: ${source.category} category. Filename: ${source.fileName}` });
    } else {
      parts.push({ text: `Text content from ${source.category} (${source.fileName}): \n ${source.content}` });
    }
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { parts },
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          guideTitle: { type: Type.STRING },
          oracleMessage: { type: Type.STRING },
          highPriorityConcepts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                sourcesFoundIn: { type: Type.ARRAY, items: { type: Type.STRING } },
                priorityReasoning: { type: Type.STRING },
                tips: { type: Type.STRING },
                overlapIndex: { type: Type.NUMBER }
              },
              required: ["name", "description", "sourcesFoundIn", "priorityReasoning"]
            }
          },
          suggestedStudyPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
          estimatedStudyTime: { type: Type.STRING },
          externalReferences: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                url: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["title", "url", "description"]
            }
          }
        },
        required: ["guideTitle", "oracleMessage", "highPriorityConcepts", "suggestedStudyPlan", "estimatedStudyTime", "externalReferences"]
      }
    }
  });

  const jsonStr = response.text;
  if (!jsonStr) throw new Error("The Oracle remained silent.");
  return JSON.parse(jsonStr);
};

export const generateSimpleExplanations = async (concepts: Concept[], sources: StudySource[]): Promise<SimplifiedExplanation[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `You are the 'Exam Oracle.' Your job is to take complex academic concepts and explain them in "Plain English" so anyone could understand them immediately.
  
  For each concept provided:
  1. Define it in extremely simple, jargon-free English. Avoid long sentences.
  2. Provide a creative Analogy that uses a common household object or activity.
  3. Provide a Modern, Real-Time Real-World Example (e.g., if it's Law, mention a famous case or common scenario; if it's Tech, mention an app people use).
  
  Concepts to simplify based on the uploaded documents:
  ${concepts.map(c => c.name).join(', ')}
  `;

  const parts: any[] = [{ text: prompt }];
  // Add context from sources for better grounding
  for (const source of sources.slice(0, 5)) {
    if (source.type === 'file') {
      const base64Data = source.content.split(',')[1] || source.content;
      parts.push({ inlineData: { mimeType: source.mimeType, data: base64Data } });
    } else {
      parts.push({ text: source.content });
    }
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            conceptName: { type: Type.STRING },
            simpleDefinition: { type: Type.STRING },
            analogy: { type: Type.STRING },
            realWorldExample: { type: Type.STRING }
          },
          required: ["conceptName", "simpleDefinition", "analogy", "realWorldExample"]
        }
      }
    }
  });

  const result = JSON.parse(response.text || "[]");
  return result;
};

export const chatWithOracle = async (sources: StudySource[], history: ChatMessage[], message: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const parts: any[] = [
    { text: "You are the 'Exam Oracle' Chatbot. Answer the user's questions strictly based on the provided documents. If the information is not in the documents, use your general knowledge but clearly state that it is supplementary to the provided scrolls. Be helpful, concise, and academic." }
  ];

  for (const source of sources) {
    if (source.type === 'file') {
      const base64Data = source.content.split(',')[1] || source.content;
      parts.push({
        inlineData: { mimeType: source.mimeType, data: base64Data }
      });
      parts.push({ text: `Provided document category: ${source.category}, filename: ${source.fileName}` });
    } else {
      parts.push({ text: `Provided document text (${source.category}): ${source.content}` });
    }
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [
      { role: 'user', parts },
      ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.text }] })),
      { role: 'user', parts: [{ text: message }] }
    ]
  });

  return response.text;
};

export const generateQuiz = async (sources: StudySource[], concepts: Concept[], preferredDifficulty: string): Promise<Quiz> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Create a 15-question quiz (5 easy, 5 moderate, 5 hard) based on: ${concepts.map(c => c.name).join(', ')}. Path: ${preferredDifficulty}.`;
  const parts: any[] = [{ text: prompt }];
  for (const source of sources) {
    if (source.type === 'file') {
      const base64Data = source.content.split(',')[1] || source.content;
      parts.push({ inlineData: { mimeType: source.mimeType, data: base64Data } });
    } else {
      parts.push({ text: source.content });
    }
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctOptionIndex: { type: Type.NUMBER },
                explanation: { type: Type.STRING },
                difficulty: { type: Type.STRING, enum: ["easy", "moderate", "difficult"] }
              },
              required: ["question", "options", "correctOptionIndex", "explanation", "difficulty"]
            }
          }
        },
        required: ["title", "questions"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};
