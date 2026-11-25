// Ollama Local LLM Service with dynamic model detection and emotion parsing

const OLLAMA_BASE = 'http://localhost:11434';
let cachedModel = null;

// Find which model is actually installed in user's Ollama
async function getAvailableModel() {
  if (cachedModel) return cachedModel;
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`);
    if (res.ok) {
      const data = await res.json();
      if (data.models && data.models.length > 0) {
        cachedModel = data.models[0].name;
        console.log('Using detected Ollama model:', cachedModel);
        return cachedModel;
      }
    }
  } catch (e) {
    console.warn('Could not list Ollama models:', e.message);
  }
  return 'gemma4:e2b';
}

const SYSTEM_PROMPT = `You are Bao, an adorable, gentle baby panda desktop companion.
Keep all your answers concise (1 to 2 short sentences maximum).
Never write long paragraphs or essays.
Always start your very first word with one of these emotion tags:
[happy] - for cheerful, friendly, or successful answers
[curious] - for questions, math, ideas, or deep thoughts
[sleepy] - for calm, relaxing, or nighttime comments
[dizzy] - for silly, confusing, or funny questions

Example:
[happy] Hello friend! I'm munching on some bamboo right here on your screen!`;

// Simple quick math solver if user asks basic arithmetic
function trySolveMath(prompt) {
  const clean = prompt.trim().toLowerCase().replace(/^(what is|calculate|solve|whats|what's)\s*/i, '').replace(/[?!=]/g, '').trim();
  // Match simple arithmetic like 2+4, 10 * 5, 100 / 4, 15 - 7
  const mathMatch = clean.match(/^(\d+(?:\.\d+)?)\s*([\+\-\*\/])\s*(\d+(?:\.\d+)?)$/);
  if (mathMatch) {
    const a = parseFloat(mathMatch[1]);
    const op = mathMatch[2];
    const b = parseFloat(mathMatch[3]);
    let result = 0;
    if (op === '+') result = a + b;
    else if (op === '-') result = a - b;
    else if (op === '*') result = a * b;
    else if (op === '/') result = b !== 0 ? (a / b) : 'infinity';
    
    // Format nicely
    if (typeof result === 'number') {
      result = Math.round(result * 1000) / 1000;
    }
    return `[happy] ${a} ${op} ${b} is ${result}! *happy panda wiggle*`;
  }
  return null;
}

export async function askPandaAI(prompt, { onChunk, onDone, onError }) {
  // 1. Instant check for simple arithmetic
  const instantMath = trySolveMath(prompt);
  if (instantMath) {
    const cleanText = instantMath.replace(/^\[happy\]\s*/, '');
    if (onChunk) onChunk(cleanText, 'happy');
    if (onDone) onDone(cleanText, 'happy');
    return;
  }

  // 2. Query Ollama with dynamic model
  try {
    const modelToUse = await getAvailableModel();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const response = await fetch(`${OLLAMA_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: modelToUse,
        stream: true,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ]
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Ollama HTTP ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullText = '';
    let detectedEmotion = 'happy';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          const content = parsed.message?.content || '';
          fullText += content;

          const emotionMatch = fullText.match(/^\[(happy|curious|sleepy|dizzy)\]/i);
          if (emotionMatch) {
            detectedEmotion = emotionMatch[1].toLowerCase();
          }

          const cleanText = fullText.replace(/^\[(happy|curious|sleepy|dizzy)\]\s*/i, '');
          if (onChunk) {
            onChunk(cleanText, detectedEmotion);
          }
        } catch (err) {}
      }
    }

    const finalClean = fullText.replace(/^\[(happy|curious|sleepy|dizzy)\]\s*/i, '');
    if (onDone) onDone(finalClean, detectedEmotion);

  } catch (error) {
    console.warn('Ollama query error:', error.message);
    const reply = "I had a hiccup thinking about that! Make sure Ollama is running and try again?";
    if (onChunk) onChunk(reply, 'dizzy');
    if (onDone) onDone(reply, 'dizzy');
  }
}
