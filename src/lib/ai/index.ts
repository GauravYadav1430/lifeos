import { GoogleGenerativeAI } from "@google/generative-ai";

// Ensure we have a fallback for client-side or build time
const apiKey = process.env.GEMINI_API_KEY || "dummy-key-for-build";
const genAI = new GoogleGenerativeAI(apiKey);

export type AIProvider = "gemini" | "anthropic";

export interface AIResponse {
  content: string;
  success: boolean;
}

export class AIService {
  private provider: AIProvider;

  constructor(provider: AIProvider = "gemini") {
    this.provider = provider;
  }

  async getDailyInsights(tasksCompleted: number, streak: number): Promise<AIResponse> {
    if (this.provider === "gemini") {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `You are a productivity AI coach inside a gamified dashboard. 
      The user has completed ${tasksCompleted} tasks today and is on a ${streak} day streak. 
      Give a short, motivational insight (max 2 sentences) focusing on avoiding burnout and building momentum.`;
      
      try {
        const result = await model.generateContent(prompt);
        return { content: result.response.text(), success: true };
      } catch {
         return { content: "Keep up the momentum! You're doing great.", success: false };
      }
    }
    
    // Future Anthropic implementation
    return { content: "Placeholder for other provider", success: false };
  }

  async parseNaturalLanguageTask(input: string): Promise<Record<string, unknown> | undefined> {
     // Parses "Remind me to buy milk tomorrow at 5pm" into JSON
     if (this.provider === "gemini") {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Extract the task details from this input: "${input}". 
        Return a JSON object with: title, priority (LOW, MEDIUM, HIGH, BOSS), and type (NORMAL, HABIT).
        Only return the raw JSON.`;
        
        try {
          const result = await model.generateContent(prompt);
          const text = result.response.text().replace(/```json/g, '').replace(/```/g, '');
          return JSON.parse(text);
        } catch {
           return { title: input, priority: "MEDIUM", type: "NORMAL" };
        }
     }
  }
}

export const aiService = new AIService("gemini");

export type AIMessage = {
  role: "user" | "model";
  content: string;
};

/**
 * Single-turn generation for insights, summaries, etc.
 */
export async function generateInsight(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * Multi-turn chat for the AI assistant page.
 */
export async function chatWithAI(
  history: AIMessage[],
  userMessage: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const chat = model.startChat({
    history: history.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    })),
  });

  const result = await chat.sendMessage(userMessage);
  return result.response.text();
}

/**
 * Generate a weekly productivity summary from user data.
 */
export async function generateWeeklySummary(userData: {
  tasksCompleted: number;
  totalXp: number;
  currentStreak: number;
  habitsCompleted: number;
  journalEntries: number;
  topCategory: string;
}): Promise<string> {
  const prompt = `You are LifeOS, a gamified productivity AI assistant. Generate a concise, motivating weekly summary for a user with these stats:

- Tasks completed: ${userData.tasksCompleted}
- XP earned this week: ${userData.totalXp}
- Current streak: ${userData.currentStreak} days
- Habits completed: ${userData.habitsCompleted}
- Journal entries: ${userData.journalEntries}
- Top productivity category: ${userData.topCategory}

Write a brief (3-4 paragraphs) summary that:
1. Celebrates wins with RPG language (like "You crushed it, Commander!")
2. Identifies patterns and gives one actionable tip
3. Detects potential burnout if activity is too high
4. Ends with a motivating call-to-action for next week

Keep it under 200 words. Use emoji sparingly.`;

  return generateInsight(prompt);
}

/**
 * Smart task prioritization — takes a list of tasks and returns them prioritized.
 */
export async function prioritizeTasks(
  tasks: { title: string; priority: string; dueDate?: string }[]
): Promise<string> {
  const taskList = tasks
    .map(
      (t, i) =>
        `${i + 1}. "${t.title}" (Priority: ${t.priority}${t.dueDate ? `, Due: ${t.dueDate}` : ""})`
    )
    .join("\n");

  const prompt = `You are LifeOS, a productivity AI. Given these tasks, return them reordered by optimal execution order with brief reasoning:

${taskList}

Consider: urgency, importance, energy levels (hard tasks first in morning), and dependencies.
Return as a numbered list with one-line reasoning per task. Be concise.`;

  return generateInsight(prompt);
}

/**
 * Burnout detection based on user patterns.
 */
export async function detectBurnout(patterns: {
  avgDailyTasks: number;
  avgMood: number;
  streakLength: number;
  recentJournalSentiment: string;
}): Promise<{ risk: "LOW" | "MEDIUM" | "HIGH"; advice: string }> {
  const prompt = `You are a wellness-aware productivity AI. Analyze these user patterns for burnout risk:

- Average daily tasks completed: ${patterns.avgDailyTasks}
- Average mood (1-5 scale): ${patterns.avgMood}
- Current streak length: ${patterns.streakLength} days
- Recent journal sentiment: ${patterns.recentJournalSentiment}

Respond in EXACTLY this JSON format (no markdown, no code fences):
{"risk": "LOW|MEDIUM|HIGH", "advice": "One sentence of actionable advice"}`;

  const response = await generateInsight(prompt);
  
  try {
    const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return { risk: "LOW", advice: "Keep up the great work! Your patterns look healthy." };
  }
}
