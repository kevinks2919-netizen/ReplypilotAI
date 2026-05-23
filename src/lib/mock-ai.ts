export type Tone = "friendly" | "playful" | "flirty" | "professional" | "funny";
export type SpendingPotential = "low" | "medium" | "high";

export type MoodAnalysis = {
  fanMood: string;
  urgencyScore: number;
  spendingPotential: SpendingPotential;
};

export type GeneratedReply = {
  id: number;
  text: string;
};

export type GenerationResult = {
  replies: GeneratedReply[];
  analysis: MoodAnalysis;
  source: "mock" | "openai" | "fallback";
  error?: string;
};

const toneOpeners: Record<Tone, string[]> = {
  friendly: ["That is so kind of you", "I loved reading this", "You made my day"],
  playful: ["Okay, you definitely know how to get my attention", "That message has a little sparkle to it", "You are trouble in the best way"],
  flirty: ["You know exactly what to say", "I might be smiling at my screen right now", "Careful, that kind of message is hard to ignore"],
  professional: ["Thank you for the thoughtful note", "I appreciate you reaching out", "Thanks for sharing that with me"],
  funny: ["Well, now I am dramatically invested", "This message deserves a tiny round of applause", "I was not prepared for that level of charm"]
};

const toneClosers: Record<Tone, string[]> = {
  friendly: ["Tell me what you have been up to today.", "I am glad you stopped by.", "What should we talk about next?"],
  playful: ["Now I need to know what inspired that.", "Do you always open with lines this good?", "I am listening, keep going."],
  flirty: ["What would you say if I asked for one more message?", "Maybe I should save this one.", "Now you have me curious."],
  professional: ["Happy to continue the conversation here.", "Let me know what you would like to discuss next.", "I appreciate the support."],
  funny: ["I am giving this message bonus points.", "Please accept this very official appreciation.", "That one might have earned a reply upgrade."]
};

export function generateMockResponse(message: string, tone: Tone): GenerationResult {
  const normalized = message.toLowerCase();
  const analysis = analyzeFanMessage(normalized);
  const seed = message.trim() || "your message";
  const shortSeed = seed.length > 90 ? `${seed.slice(0, 87)}...` : seed;

  return {
    source: "mock",
    analysis,
    replies: [0, 1, 2].map((index) => ({
      id: index + 1,
      text: `${toneOpeners[tone][index]}. I saw your message: "${shortSeed}" ${toneClosers[tone][index]}`
    }))
  };
}

export function isTone(value: unknown): value is Tone {
  return (
    value === "friendly" ||
    value === "playful" ||
    value === "flirty" ||
    value === "professional" ||
    value === "funny"
  );
}

function analyzeFanMessage(message: string): MoodAnalysis {
  const eagerWords = ["now", "today", "soon", "quick", "waiting", "miss", "need"];
  const warmWords = ["love", "amazing", "beautiful", "favorite", "sweet", "cute", "miss"];
  const spendWords = ["buy", "tip", "paid", "custom", "vip", "subscribe", "gift", "unlock"];
  const questionCount = (message.match(/\?/g) || []).length;

  const urgencyHits = eagerWords.filter((word) => message.includes(word)).length;
  const warmthHits = warmWords.filter((word) => message.includes(word)).length;
  const spendHits = spendWords.filter((word) => message.includes(word)).length;

  const urgencyScore = Math.min(10, Math.max(1, 3 + urgencyHits * 2 + questionCount));
  const spendingPotential: SpendingPotential =
    spendHits >= 2 ? "high" : spendHits === 1 || message.length > 120 ? "medium" : "low";

  let fanMood = "curious";
  if (warmthHits >= 2) fanMood = "adoring";
  else if (message.includes("angry") || message.includes("ignored")) fanMood = "frustrated";
  else if (urgencyScore >= 7) fanMood = "eager";
  else if (message.includes("lol") || message.includes("haha")) fanMood = "playful";

  return {
    fanMood,
    urgencyScore,
    spendingPotential
  };
}
