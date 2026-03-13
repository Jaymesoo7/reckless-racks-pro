import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const DB_PATH = path.join(process.cwd(), 'data', 'database.json');

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `
      You are an expert data extractor. Analyze these APA 9-Ball team roster screenshots.
      Extract the player statistics for both teams and return ONLY a valid, raw JSON object.
      Do not include any markdown formatting, backticks, or conversational text.
      The JSON MUST have three keys: "matchLocation", "team", and "opponents".
      CRITICAL INSTRUCTION 1: Find the match location from the image headers or banners. Text like "Eagle's Lodge" or "Eagles Lodge @ 7:00 PM" is the location. Map just the name, e.g., "Eagle's Lodge", to the "matchLocation" key.
      CRITICAL INSTRUCTION 2: The team named "Reckless Racks" MUST ALWAYS be mapped to the "team" key. The other team in the screenshot MUST ALWAYS be mapped to the "opponents" key.
      Each array MUST contain objects with these exact keys and types:
      - id (number, generate a sequential ID if not present)
      - name (string, First and Last)
      - sl (number, Skill Level)
      - mp (number, Matches Played)
      - won (number, Matches Won)
      - winPct (number, Win Percentage, e.g., 50.0)
      - ppm (number, Points Per Match, e.g., 10.5)
      Combine data across all images to form complete team rosters. Remove duplicate players if they appear in overlapping screenshots.
    `;

    const imageParts = await Promise.all(files.map(async (file) => {
      const bytes = await file.arrayBuffer();
      return {
        inlineData: {
          data: Buffer.from(bytes).toString('base64'),
          mimeType: file.type
        }
      };
    }));

    const result = await model.generateContent([prompt, ...imageParts]);
    const responseText = result.response.text().trim().replace(/```json/g, '').replace(/```/g, '');
    const extractedData = JSON.parse(responseText);

    let db = { matchLocation: "", team: [], opponents: [], history: {} as Record<string, any> };
    if (fs.existsSync(DB_PATH)) {
      db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    }

    if (extractedData.matchLocation) db.matchLocation = extractedData.matchLocation;
    if (extractedData.team && extractedData.team.length > 0) db.team = extractedData.team;
    if (extractedData.opponents && extractedData.opponents.length > 0) db.opponents = extractedData.opponents;
    
    [...db.team, ...db.opponents].forEach((p: any) => {
      db.history[p.name] = p;
    });

    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

    return NextResponse.json({ success: true, data: db });
  } catch (error: any) {
    console.error('OCR Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
