// src/ai/core/tools.ts

export const mentorTools = [
  {
    name: "get_daily_status",
    description: "Fetches the user's active focus pairs for today and checks if they have breached their 2-trade daily execution limit.",
    parameters: {
      type: "OBJECT",
      properties: {}, // No parameters needed. The server automatically uses the current date and secure user ID.
      required: []
    }
  },
  {
    name: "get_discipline_and_leaks",
    description: "Analyzes the user's execution history to find their most common mistakes (catalysts) and imperfect executions over a specific timeframe.",
    parameters: {
      type: "OBJECT",
      properties: {
        timeframe: {
          type: "STRING",
          description: "The timeframe to analyze. Must be one of: 'WEEK', 'MONTH', 'ALL'."
        }
      },
      required: ["timeframe"]
    }
  },
  {
    name: "get_playbook_performance",
    description: "Retrieves the strike rate and net yield (RR) grouped by the user's specific trading playbooks to determine which setups are most profitable.",
    parameters: {
      type: "OBJECT",
      properties: {
        timeframe: {
          type: "STRING",
          description: "The timeframe to analyze. Must be one of: 'WEEK', 'MONTH', 'ALL'."
        }
      },
      required: ["timeframe"]
    }
  },
  {
    name: "get_trade_autopsy",
    description: "Fetches the specific details, structural thesis, and outcome of a recent trade based on the asset ticker symbol.",
    parameters: {
      type: "OBJECT",
      properties: {
        symbol: {
          type: "STRING",
          description: "The financial asset ticker symbol (e.g., 'XAUUSD', 'GBPUSD', 'BTCUSD')."
        }
      },
      required: ["symbol"]
    }
  }
];
