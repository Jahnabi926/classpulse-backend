const buildQuizPrompt = ({ topic, gradeLevel, numQuestions, difficulty }) => {
  return `You are an experienced teacher creating a quiz for ${gradeLevel} students.

Create ${numQuestions} multiple-choice questions on the topic: "${topic}".
Difficulty: ${difficulty}.

Rules:
- Each question has exactly 4 options.
- Exactly one option is correct.
- Wrong options must be plausible, based on common student mistakes, not silly guesses.
- Keep the wording clear and age-appropriate for ${gradeLevel}.

Respond with JSON only, no extra text, in exactly this shape:
{
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctIndex": 0
    }
  ]
}
correctIndex is the position (0 to 3) of the correct option in the options array.`;
};

module.exports = buildQuizPrompt;
