import { Survey } from "@/hooks/useForetell";

export const dummySurvey: Survey = {
  surveyId: "dummy123",
  title: "What is your sentiment about AI in 2024?",
  description: "Share your thoughts on the impact of AI this year.",
  createdBy: "user_abc",
  createdAt: new Date().toISOString(),
  expiry: "2024-12-31T23:59:59Z",
  maxResponses: 100,
  responses: [
    {
      uid: "user1",
      polarity: 1,
      score: 0.85,
      intensity: 0.9,
      answer: "AI is making life easier!",
    },
    {
      uid: "user2",
      polarity: -1,
      score: 0.1,
      intensity: 0.8,
      answer: "I'm worried about job loss.",
    },
    {
      uid: "user3",
      polarity: 0,
      score: 0.5,
      intensity: 1,
      answer: "It's a mixed bag.",
    },
  ],
};
