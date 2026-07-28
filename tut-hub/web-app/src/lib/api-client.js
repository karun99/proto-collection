export async function callAI(prompt, model, apiKey) {
  const response = await fetch('/.netlify/functions/ai-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, model, apiKey }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to call AI');
  }

  return data;
}

export async function generateQuiz(topic, gradeLevel, model, apiKey, customPrompt) {
  const prompt = customPrompt || `Generate a quiz about "${topic}" for grade level "${gradeLevel}". 
  Provide 5 multiple choice questions in JSON format:
  [
    {
      "question": "text",
      "options": ["a", "b", "c", "d"],
      "correctIndex": 0,
      "explanation": "why"
    }
  ]`;

  const result = await callAI(prompt, model, apiKey);
  const content = result.choices[0].message.content;
  
  try {
    // Attempt to extract JSON array if wrapped in markdown or extra text
    const jsonMatch = content.match(/\[\s*{[\s\S]*}\s*\]/);
    const jsonString = jsonMatch ? jsonMatch[0] : content;
    return JSON.parse(jsonString);
  } catch (e) {
    console.error('Failed to parse AI response as JSON:', content);
    throw new Error('The AI generated an invalid response format. Please try again.');
  }
}
