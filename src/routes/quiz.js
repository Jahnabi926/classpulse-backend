const OpenAI = require("openai");
const express = require("express");
const { userAuth } = require("../middlewares/auth");
const buildQuizPrompt = require("../utils/generateQuizPrompt");

const quizRouter = express.Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || "gpt - 6 - luna";
const MAX_QUESTIONS = 10;
const DIFFICULTIES = ["easy", "medium", "hard"];

const MOCK_QUESTIONS = [
  {
    question: "What is 1/2 + 1/4?",
    options: ["1/6", "3/4", "2/6", "1/4"],
    correctIndex: 1,
  },
  {
    question: "Which fraction is equivalent to 2/3?",
    options: ["4/6", "3/4", "2/6", "6/4"],
    correctIndex: 0,
  },
  {
    question: "What is 6/8 in simplest form?",
    options: ["2/3", "3/4", "6/4", "1/2"],
    correctIndex: 1,
  },
  {
    question: "Which fraction is the greatest?",
    options: ["1/2", "2/3", "3/5", "3/4"],
    correctIndex: 3,
  },
  {
    question: "What is 3/5 of 20?",
    options: ["8", "15", "12", "10"],
    correctIndex: 2,
  },
];

const isValidQuestion = (q) => {
  return (
    q &&
    typeof q.question === "string" &&
    q.question.trim() !== "" &&
    Array.isArray(q.options) &&
    q.options.length === 4 &&
    q.options.every((o) => typeof o === "string" && o.trim() !== "") &&
    Number.isInteger(q.correctIndex) &&
    q.correctIndex >= 0 &&
    q.correctIndex <= 3
  );
};

quizRouter.post("/api/quiz/generate", userAuth, async (req, res) => {
  try {
    // 1. Only teachers
    if (req.user.role !== "teacher") {
      return res.status(403).send("ERROR: Only teachers can generate quizzes");
    }
    // 2. Validate input
    const { topic, gradeLevel, numQuestions, difficulty } = req.body;
    const count = Number(numQuestions);

    if (typeof topic !== "string" || !topic.trim()) {
      throw new Error("Topic is required");
    }
    if (typeof gradeLevel !== "string" || !gradeLevel.trim()) {
      throw new Error("Grade Level is required");
    }
    if (!Number.isInteger(count) || count < 1 || count > MAX_QUESTIONS) {
      throw new Error(
        `Number of questions must be between 1 and ${MAX_QUESTIONS}`,
      );
    }
    if (!DIFFICULTIES.includes(difficulty)) {
      throw new Error("Difficulty must be easy, medium or hard");
    }
    // 3. Build prompt, call AI, parse and validate (failures here are NOT the client's fault)
    let questions;

    try {
      let parsed;

      if (process.env.MOCK_AI === "true") {
        console.log("MOCK_AI is on: skipping OpenAI");
        parsed = { questions: MOCK_QUESTIONS.slice(0, count) };
      } else {
        const prompt = buildQuizPrompt({
          topic: topic.trim(),
          gradeLevel: gradeLevel.trim(),
          numQuestions: count,
          difficulty,
        });

        const completion = await openai.chat.completions.create({
          model: MODEL,
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
        });

        parsed = JSON.parse(completion.choices[0].message.content);
      }
      questions = parsed.questions;
      if (
        !Array.isArray(questions) ||
        questions.length === 0 ||
        questions.length !== count ||
        !questions.every(isValidQuestion)
      ) {
        throw new Error("AI returned an invalid quiz format");
      }
    } catch (aiError) {
      console.error("Quiz generation failed:", aiError.message);
      return res
        .status(502)
        .send("ERROR: Could not generate quiz. Please try again");
    }
    // 4. Send the draft back for the teacher to review
    res.json({ questions });
  } catch (error) {
    res.status(400).send("ERROR: " + error.message);
  }
});

module.exports = quizRouter;
