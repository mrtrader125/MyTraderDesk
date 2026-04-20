// src/ai/utils/telegram.ts

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export const sendTelegramMessage = async (chatId: string, text: string) => {
  if (!TELEGRAM_BOT_TOKEN) throw new Error('Telegram Bot Token is missing');

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown' // Allows Gemini to use bolding and lists
    })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Telegram API Error:', error);
    throw new Error('Failed to send Telegram message');
  }

  return response.json();
};
