const asyncHandler = require('../middleware/asyncHandler');

const buildFallbackResponse = ({ title, description, goal }) => {
  const summary = description || `Complete \"${title}\" with clear deliverables and deadline.`;
  const plan = [
    'Clarify exact output and success criteria.',
    'Break work into 2-4 actionable subtasks.',
    'Start with highest-impact subtask first.',
    'Review and mark status updates daily.',
  ];
  const tags = ['focus', 'delivery', 'execution'];

  return {
    summary,
    plan,
    tags,
    goal: goal || 'Execute the task efficiently',
    source: 'fallback',
  };
};

const taskAssist = asyncHandler(async (req, res) => {
  const { title, description, goal } = req.body;

  if (!process.env.OPENAI_API_KEY) {
    return res.status(200).json(buildFallbackResponse({ title, description, goal }));
  }

  const prompt = `You are a project execution assistant.\nTask title: ${title}\nTask description: ${description || 'N/A'}\nGoal: ${goal || 'N/A'}\n\nReturn strict JSON with keys:\nsummary (string),\nplan (array of max 4 short steps),\ntags (array of max 5 one-word tags).`;

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
        input: prompt,
        max_output_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI request failed: ${response.status}`);
    }

    const data = await response.json();
    const text = data.output_text || '{}';

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (error) {
      parsed = buildFallbackResponse({ title, description, goal });
      parsed.summary = text.slice(0, 400) || parsed.summary;
    }

    res.status(200).json({
      summary: parsed.summary || '',
      plan: Array.isArray(parsed.plan) ? parsed.plan.slice(0, 4) : [],
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [],
      goal: goal || '',
      source: 'openai',
    });
  } catch (error) {
    const fallback = buildFallbackResponse({ title, description, goal });
    res.status(200).json({ ...fallback, source: 'fallback-error' });
  }
});

module.exports = { taskAssist };