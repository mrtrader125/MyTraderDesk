// src/ai/core/tools.ts

export const mentorTools = [
  // --- YOUR ORIGINAL ANALYTICAL TOOLS ---
  {
    name: "get_daily_status",
    description: "Fetches the user's active focus pairs for today and checks if they have breached their 2-trade daily execution limit.",
    parameters: { type: "OBJECT", properties: {}, required: [] }
  },
  {
    name: "get_discipline_and_leaks",
    description: "Analyzes the user's execution history to find their most common mistakes.",
    parameters: {
      type: "OBJECT",
      properties: { timeframe: { type: "STRING", description: "Must be: 'WEEK', 'MONTH', 'ALL'." } },
      required: ["timeframe"]
    }
  },
  {
    name: "get_playbook_performance",
    description: "Retrieves the strike rate and net yield (RR) grouped by playbooks.",
    parameters: {
      type: "OBJECT",
      properties: { timeframe: { type: "STRING", description: "Must be: 'WEEK', 'MONTH', 'ALL'." } },
      required: ["timeframe"]
    }
  },
  {
    name: "get_trade_autopsy",
    description: "Fetches the specific details of a recent trade.",
    parameters: {
      type: "OBJECT",
      properties: { symbol: { type: "STRING", description: "Ticker symbol (e.g., 'XAUUSD')." } },
      required: ["symbol"]
    }
  },
  // --- THE NEW MUTATION TOOLS ---
  {
    name: "pause_user",
    description: "Pauses the user's trading routine and accountability tracking.",
    parameters: {
      type: "OBJECT",
      properties: { days: { type: "NUMBER", description: "Number of days to pause." } },
      required: ["days"]
    }
  },
  {
    name: "resume_user",
    description: "Reactivates the user's trading routine after a pause.",
    parameters: { type: "OBJECT", properties: {}, required: [] }
  },
  {
    name: "mark_prep_done",
    description: "Logs that the user has completed their pre-market preparation.",
    parameters: { type: "OBJECT", properties: {}, required: [] }
  },
  {
    name: "log_trade",
    description: "Logs a trade execution against their daily limit.",
    parameters: { type: "OBJECT", properties: {}, required: [] }
  }
];