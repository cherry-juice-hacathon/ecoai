import {NextRequest, NextResponse} from "next/server";

interface AdvisorRequestBody {
    country: string;
    model: string;
    historyData: Array<{ year: number; [key: string]: number }>;
    footprintSeries: Array<{ year: number; value: number }>;
}

const OPENAI_MODEL = "gpt-4o-mini";
const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";

export async function POST(req: NextRequest) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: "Missing OPENAI_API_KEY env variable." }, { status: 500 });
    }

    let body: AdvisorRequestBody;
    try {
        body = await req.json();
    } catch (error) {
        return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
    }

    const { country, model, historyData, footprintSeries } = body;
    if (!historyData || historyData.length === 0) {
        return NextResponse.json({ error: "Provide at least one year of historical data." }, { status: 400 });
    }

    const userPrompt = `You are EcoAdvisor, an expert in sustainable IT operations. Using the structured data below, craft exactly three actionable recommendations to lower the company's carbon footprint.
    
DATA
- Country: ${country}
- Forecast model: ${model}
- Historical metrics per year: ${JSON.stringify(historyData)}
- Total footprint trajectory: ${JSON.stringify(footprintSeries)}

RESPONSE FORMAT (JSON ONLY)
{
  "entries": [
    {
      "title": string,            // short impact area headline
      "action": string,           // concrete next step (1-2 sentences)
      "benefit": string,          // qualitative or directional benefit
      "priority": "high" | "medium" | "low"
    },
    ... exactly three entries total ...
  ],
  "summary": string              // one sentence overall takeaway
}

Do not include explanations outside the JSON. Keep the tone pragmatic and inspirational.`;

    try {
        const response = await fetch(OPENAI_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: OPENAI_MODEL,
                temperature: 0.6,
                max_tokens: 600,
                messages: [
                    {
                        role: "system",
                        content:
                            "You are EcoAdvisor, a sustainability strategist focusing on actionable, enterprise-ready guidance.",
                    },
                    { role: "user", content: userPrompt },
                ],
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        const rawContent = data?.choices?.[0]?.message?.content?.trim();
        let recommendation = null;

        if (rawContent) {
            try {
                recommendation = JSON.parse(rawContent);
            } catch (error) {
                console.warn("EcoAdvisor: failed to parse JSON, returning raw text");
            }
        }

        return NextResponse.json({ recommendation: recommendation ?? rawContent ?? "No guidance available right now. Please tweak your inputs and try again." });
    } catch (error) {
        console.error("EcoAdvisor failure", error);
        return NextResponse.json({ error: "EcoAdvisor could not generate insights. Try again later." }, { status: 500 });
    }
}
