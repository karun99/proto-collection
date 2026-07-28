import React, { useState } from 'react';
import { BrainCircuit, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { generateQuiz } from '../../lib/api-client';

export const QuizGenerator = () => {
  const [topic, setTopic] = useState('');
  const [gradeLevel, setGradeLevel] = useState('High School');
  const [questionCount, setQuestionCount] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || localStorage.getItem('openrouter_key') || 'dummy-key';
      const prompt = `Generate a quiz about "${topic}" for grade level "${gradeLevel}". 
      Provide ${questionCount} multiple choice questions in JSON format:
      [
        {
          "question": "text",
          "options": ["a", "b", "c", "d"],
          "correctIndex": 0,
          "explanation": "why"
        }
      ]`;
      
      const result = await generateQuiz(topic, gradeLevel, 'openai/gpt-3.5-turbo', apiKey, prompt);
      setQuiz(result);
    } catch (err) {
      setError(err.message || 'Failed to generate quiz. Please check your API key.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-purple-100 dark:bg-purple-900/30 rounded-2xl mb-4">
          <BrainCircuit className="w-8 h-8 text-purple-600" />
        </div>
        <h1 className="text-4xl font-bold dark:text-white mb-4">AI Quiz Generator</h1>
        <p className="text-gray-600 dark:text-gray-400">Create comprehensive quizzes in seconds using advanced AI.</p>
      </div>

      <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none mb-12">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Subject or Topic</label>
            <input 
              type="text" 
              placeholder="e.g. Quantum Physics, Spanish Verbs, Ancient Rome..."
              className="w-full px-4 py-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 transition"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Grade Level</label>
              <select 
                className="w-full px-4 py-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-purple-500"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
              >
                <option>Elementary</option>
                <option>Middle School</option>
                <option>High School</option>
                <option>University</option>
                <option>Professional</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Question Count</label>
              <select 
                className="w-full px-4 py-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-purple-500"
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
              >
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
              </select>
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isLoading || !topic}
            className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-purple-700 transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Generating Magic...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                <span>Generate Quiz</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 text-center mb-8">
          {error}
        </div>
      )}

      {quiz && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold dark:text-white mb-4 flex items-center">
            <CheckCircle2 className="w-6 h-6 text-green-500 mr-2" />
            Generated Quiz Preview
          </h2>
          {quiz.map((q, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <p className="font-bold dark:text-white mb-4">{idx + 1}. {q.question}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {q.options.map((opt, optIdx) => (
                  <div 
                    key={optIdx} 
                    className={`p-3 rounded-lg border text-sm ${optIdx === q.correctIndex ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400' : 'border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400'}`}
                  >
                    {opt}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-gray-500 italic">Explanation: {q.explanation}</p>
            </div>
          ))}
          <div className="flex gap-4 pt-4">
            <button className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-black py-4 rounded-xl font-bold">
              Save to Bank
            </button>
            <button className="flex-1 border border-gray-200 dark:border-gray-800 dark:text-white py-4 rounded-xl font-bold">
              Export as PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
