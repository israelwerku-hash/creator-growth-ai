import Groq from "groq-sdk";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-20b";

// 🚀 BYPASS SWITCH: Set to true to test for free without API keys or limits
const MOCK_MODE = false; 

export async function executeFanSegmentationAI(fanId: string) {
  const fan = await prisma.fan.findUnique({ where: { id: fanId } });
  if (!fan) throw new Error("Fan structure target reference missing.");

  let insights;

  if (MOCK_MODE) {
    // Simulate network processing delay for UI loading spinners
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    insights = {
      segment: "Potential Whale",
      confidenceScore: 92,
      revenuePotential: 350,
      churnRiskScore: 8,
      opportunityScore: 95,
      aiRecommendation: "[MOCK DATA] Fan exhibits extremely high-intent engagement patterns. High response rates coupled with consistent interaction histories suggest readiness for personalized premium dynamic PPV offers."
    };
  } else {
    const analysisPrompt = `
      Analyze this creator's fan data and categorize them into exactly one of these segments:
      - Whale (High spender, frequent purchases, high engagement)
      - Loyal Fan (Consistent engagement, regular purchases, long-term)
      - Potential Whale (Engages heavily, opens messages, low spend yet, high conversion potential)
      - Ghost Fan (Rarely interacts, opens few messages, low activity)
      - Churn Risk (Previously active, engagement dropping, subscription likely to expire)
      - Time Waster (Constant messaging, little or no spending, high support time cost)

      Fan Profile Attributes to Process:
      - Total Spend: $${fan.totalSpend}
      - Average Spend Per Interaction: $${fan.averageSpend}
      - Subscription Age: ${fan.subscriptionAge} days
      - Message Frequency: ${fan.messageFrequency} msg/week
      - Total Purchases: ${fan.purchaseCount} items
      - PPV Content Purchases: ${fan.ppvPurchases}
      - Creator Response Rate: ${fan.responseRate}%
      - Monthly Login Activity: ${fan.loginActivity} times

      Return the result strictly as a clean JSON object with these exact keys:
      {
        "segment": "string",
        "confidenceScore": number,
        "revenuePotential": number,
        "churnRiskScore": number,
        "opportunityScore": number,
        "aiRecommendation": "string"
      }
    `;

    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: analysisPrompt }],
        model: MODEL,
        temperature: 0.2, // Low temp for strictly structured JSON analysis
        response_format: { type: "json_object" },
      });

      const responseText = completion.choices[0]?.message?.content ?? "";
      const cleanedJsonString = responseText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      
      insights = JSON.parse(cleanedJsonString);
    } catch (error) {
      console.error("Critical AI Segment Parsing Execution Failure:", error);
      throw error;
    }
  }

  // Save insights directly to the database row
  return await prisma.fan.update({
    where: { id: fanId },
    data: {
      segment: insights.segment,
      confidenceScore: insights.confidenceScore,
      revenuePotential: insights.revenuePotential,
      churnRiskScore: insights.churnRiskScore,
      opportunityScore: insights.opportunityScore,
      aiRecommendation: insights.aiRecommendation,
      lastSegmentedAt: new Date(),
    },
  });
}