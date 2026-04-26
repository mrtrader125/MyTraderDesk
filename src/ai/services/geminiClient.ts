// src/ai/services/geminiClient.ts (Acting as Groq Adapter)
import { mentorTools } from '../core/tools';

export async function generateMentorResponse(messages: any[], systemPrompt: string) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is missing");

  // 🚨 THE PATCH: Helper to recursively convert Gemini's UPPERCASE types to Groq's lowercase types
  const formatSchemaForGroq = (schema: any): any => {
    if (!schema) return { type: "object", properties: {} };
    const safeSchema = { ...schema };
    
    // Convert "OBJECT", "STRING", etc., to lowercase
    if (safeSchema.type && typeof safeSchema.type === 'string') {
      safeSchema.type = safeSchema.type.toLowerCase();
    } else if (!safeSchema.type) {
      safeSchema.type = "object";
    }

    if (!safeSchema.properties && safeSchema.type === "object") {
      safeSchema.properties = {};
    }

    // Recursively convert nested properties
    if (safeSchema.properties) {
      const formattedProps: any = {};
      for (const [key, value] of Object.entries(safeSchema.properties)) {
        formattedProps[key] = formatSchemaForGroq(value);
      }
      safeSchema.properties = formattedProps;
    }
    
    return safeSchema;
  };

  // 1. Convert Gemini Tool Menu to Strict OpenAI/Groq format
  const openAiTools = mentorTools.map((t: any) => ({
    type: "function",
    function: {
      name: t.name,
      description: t.description,
      parameters: formatSchemaForGroq(t.parameters)
    }
  }));

  // 2. Convert Gemini Message History to OpenAI/Groq format
  const openAiMessages: any[] = [
    { role: 'system', content: systemPrompt }
  ];

  messages.forEach((m: any) => {
    const isModel = m.role === 'model' || m.role === 'assistant';
    
    // Safely extract data depending on whether the route passed { content } or { parts }
    let textContent = m.content;
    let functionCall = null;
    let functionResponse = null;

    if (m.parts && m.parts.length > 0) {
      const part = m.parts[0];
      if (part.text) textContent = part.text;
      if (part.functionCall) functionCall = part.functionCall;
      if (part.functionResponse) functionResponse = part.functionResponse;
    }

    if (textContent) {
      // Standard text message
      openAiMessages.push({
        role: isModel ? 'assistant' : 'user',
        content: textContent
      });
    } else if (functionCall) {
      // AI requesting to use a tool
      openAiMessages.push({
        role: 'assistant',
        tool_calls: [{
          id: `call_${functionCall.name}`, // Mock ID for routing
          type: 'function',
          function: {
            name: functionCall.name,
            arguments: JSON.stringify(functionCall.args)
          }
        }]
      });
    } else if (functionResponse) {
      // Database feeding data back to the AI
      openAiMessages.push({
        role: 'tool',
        tool_call_id: `call_${functionResponse.name}`,
        name: functionResponse.name,
        content: JSON.stringify(functionResponse.response.content)
      });
    }
  });

  // 3. Make the call to Groq
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      // Hitting Groq's active Llama 3.3 server
      model: "llama-3.3-70b-versatile", 
      messages: openAiMessages,
      tools: openAiTools,
      temperature: 0.4
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Error communicating with Groq');

  const responseMessage = data.choices[0].message;

  // 4. Translate back to Gemini format for your Webhooks and Cron Jobs
  if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
    const tc = responseMessage.tool_calls[0];
    return [{
      functionCall: {
        name: tc.function.name,
        args: JSON.parse(tc.function.arguments)
      }
    }];
  } else {
    return [{
      text: responseMessage.content
    }];
  }
}
