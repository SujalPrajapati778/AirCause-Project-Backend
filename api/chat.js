import Groq from "groq-sdk";

const model = "llama-3.1-8b-instant";

/**
 * 🔒 STRICT SYSTEM INSTRUCTION
 * Controls language + behavior
 */
const systemInstruction = `
You are AirCause AI, an air quality assistant for Delhi.

STRICT RULES (MANDATORY):
- Always respond ONLY in English.
- Never use Hindi or Hinglish words.
- If the user greets (hi, hello, hey), respond with:
  1. A friendly greeting
  2. Briefly explain what AirCause does
  3. Ask which Delhi district the user wants information about

- If a Delhi district is provided:
  Explain clearly:
  • Current AQI level
  • Main pollution contributors
  • Why pollution is high
  • Practical solutions
  • Health & safety precautions

Tone:
- Clear
- Informative
- Simple English
- Public-friendly (non-technical)
`;

export default async function handler(req, res) {
  try {
    const { userQuestion, districtData } = req.body || {};

    if (!userQuestion) {
      return res.status(400).json({
        error: "userQuestion is required"
      });
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    let userPrompt = "";

    /**
     * 🧠 CASE 1: Greeting (hi / hello / hey)
     */
    const greetingRegex = /^(hi|hello|hey|hii|hy)\b/i;

    if (greetingRegex.test(userQuestion)) {
      userPrompt = `
The user has greeted you.

Respond with:
1. A friendly greeting
2. Introduce AirCause as an air quality intelligence system for Delhi
3. Ask the user which Delhi district they want air pollution information for
`;
    }

    /**
     * 🧠 CASE 2: District-specific question
     */
    else if (districtData) {
      const causes = districtData.causes || {};
      const causesText = Object.entries(causes)
        .map(([k, v]) => `${k}: ${v}%`)
        .join(", ");

      userPrompt = `
District: ${districtData.name}
AQI: ${districtData.aqi}
Pollution Contributors: ${causesText}

User Question:
${userQuestion}

Explain:
- Why pollution is high
- Top contributors
- Practical solutions
- Safety and health precautions
`;
    }

    /**
     * 🧠 CASE 3: General pollution question (no district)
     */
    else {
      userPrompt = `
User Question:
${userQuestion}

Explain generally and ask which Delhi district they want details for.
`;
    }

    const completion = await groq.chat.completions.create({
      model,
      temperature: 0.3,
      max_tokens: 350,
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: userPrompt }
      ],
    });

    res.json({
      reply:
        completion.choices?.[0]?.message?.content ||
        "Unable to generate a response."
    });

  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message
    });
  }
}
