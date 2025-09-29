import React, { useEffect, useMemo, useState } from "react";
import { Card } from "@progress/kendo-react-layout";

type Question = {
  id: number;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
};

const QUESTIONS: Question[] = [
  {
    id: 1,
    prompt: "Which planet has the largest volcano in the Solar System?",
    options: ["Earth", "Venus", "Mars", "Mercury"],
    correctIndex: 2,
    explanation: "Olympus Mons on Mars is ~22 km high — three times Everest.",
  },
  {
    id: 2,
    prompt: "What primarily powers the Sun?",
    options: ["Gravitational collapse", "Nuclear fission", "Chemical combustion", "Nuclear fusion"],
    correctIndex: 3,
    explanation: "Hydrogen nuclei fuse into helium in the Sun’s core.",
  },
  {
    id: 3,
    prompt: "Which of these is NOT a type of galaxy?",
    options: ["Elliptical", "Spiral", "Irregular", "Transversal"],
    correctIndex: 3,
    explanation: "Transversal isn’t a galaxy class; the other three are.",
  },
  {
    id: 4,
    prompt: "What causes the Moon’s phases?",
    options: [
      "Earth’s shadow covering the Moon",
      "Changing distance to Earth",
      "Different portions of the Moon’s sunlit half visible from Earth",
      "Clouds in Earth’s atmosphere",
    ],
    correctIndex: 2,
    explanation: "We see varying fractions of the sunlit hemisphere during its orbit.",
  },
  {
    id: 5,
    prompt: "Which planet has the strongest surface gravity?",
    options: ["Jupiter", "Neptune", "Saturn", "Earth"],
    correctIndex: 0,
    explanation: "Jupiter’s mass dominates the Solar System; surface gravity leads the pack.",
  },
];

type StoredResult = {
  bestScore: number;
  attempts: number;
  lastTs: number;
};

const KEY = "cosmoscope.quiz.v1";

const QuizPanel: React.FC = () => {
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [submitted, setSubmitted] = useState(false);
  const [stats, setStats] = useState<StoredResult>({ bestScore: 0, attempts: 0, lastTs: 0 });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setStats(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const total = QUESTIONS.length;

  const score = useMemo(() => {
    if (!submitted) return 0;
    return QUESTIONS.reduce((acc, q) => (answers[q.id] === q.correctIndex ? acc + 1 : acc), 0);
  }, [submitted, answers]);

  const allAnswered = useMemo(
    () => QUESTIONS.every((q) => Number.isInteger(answers[q.id] as number)),
    [answers]
  );

  const selectAnswer = (qid: number, idx: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qid]: idx }));
  };

  const submit = () => {
    if (!allAnswered) return;
    setSubmitted(true);
    const newScore = QUESTIONS.reduce((acc, q) => (answers[q.id] === q.correctIndex ? acc + 1 : acc), 0);
    const next: StoredResult = {
      bestScore: Math.max(stats.bestScore, newScore),
      attempts: stats.attempts + 1,
      lastTs: Date.now(),
    };
    setStats(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const reset = () => {
    setSubmitted(false);
    setAnswers({});
  };

  return (
    <div className="space-y-4">
      {/* Header / Summary */}
      <Card className="p-4 bg-white/5 border border-white/10 rounded-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-lg font-semibold text-sky-300">🧠 Space Quiz</div>
            <div className="text-sm text-slate-300/80">
              5 quick questions. Test your cosmic chops. No pressure, just photons.
            </div>
          </div>
          <div className="flex gap-3">
            <div className="px-3 py-2 rounded-lg bg-white/10 text-slate-100 text-sm">
              Best: <span className="font-semibold">{stats.bestScore}/{total}</span>
            </div>
            <div className="px-3 py-2 rounded-lg bg-white/10 text-slate-100 text-sm">
              Attempts: <span className="font-semibold">{stats.attempts}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Questions */}
      <div className="grid gap-4 md:grid-cols-2">
        {QUESTIONS.map((q) => {
          const chosen = answers[q.id];
          const isCorrect = submitted && chosen === q.correctIndex;
          const isWrong = submitted && chosen != null && chosen !== q.correctIndex;

          return (
            <Card key={q.id} className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <div className="mb-3 font-medium text-slate-100">
                Q{q.id}. {q.prompt}
              </div>

              <div className="flex flex-col gap-2">
                {q.options.map((opt, idx) => {
                  const selected = chosen === idx;
                  let ring = "ring-0";
                  if (submitted && idx === q.correctIndex) ring = "ring-2 ring-emerald-400/70";
                  if (submitted && selected && idx !== q.correctIndex) ring = "ring-2 ring-rose-400/70";

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => selectAnswer(q.id, idx)}
                      className={[
                        "text-left px-3 py-2 rounded-lg border transition-all",
                        "bg-white/5 border-white/15 hover:bg-white/10",
                        selected ? "outline  outline-sky-400/60" : "",
                        ring,
                      ].join(" ")}
                      aria-pressed={selected}
                    >
                      <span className="text-slate-100">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanations after submit */}
              {submitted && (
                <div className="mt-3 text-sm">
                  {isCorrect && <div className="text-emerald-300">Correct ✅</div>}
                  {isWrong && (
                    <div className="text-rose-300">
                      Not quite. Correct: <b>{q.options[q.correctIndex]}</b>
                    </div>
                  )}
                  {q.explanation && <div className="mt-1 text-slate-300/80">{q.explanation}</div>}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Actions */}
      <Card className="p-4 bg-white/5 border border-white/10 rounded-xl">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="text-slate-300">
            {submitted ? (
              <span>
                Score: <span className="font-semibold text-sky-300">{score}</span> / {total}
              </span>
            ) : (
              <span className="text-slate-400">Select an answer for each question.</span>
            )}
          </div>

          <div className="flex gap-3">
            {!submitted ? (
              <button
                disabled={!allAnswered}
                onClick={submit}
                className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-semibold"
              >
                Submit
              </button>
            ) : (
              <button
                onClick={reset}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default QuizPanel;
