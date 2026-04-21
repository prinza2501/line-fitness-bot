const { Client } = require('@line/bot-sdk');
const { fetchCurrentWeather } = require('./weather');
const { getDailyQuote } = require('./quotes');

function buildMessage(weather) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('th-TH', {
    timeZone: 'Asia/Bangkok',
    hour: '2-digit',
    minute: '2-digit',
  });
  const dateStr = now.toLocaleDateString('th-TH', {
    timeZone: 'Asia/Bangkok',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const quote = getDailyQuote();

  return [
    `${weather.emoji} สภาพอากาศช่วงเย็น — ท่าศาลา`,
    `⏰ อีก 1 ชม. ก่อนพระอาทิตย์ตก`,
    `📅 ${dateStr}  🕐 ${timeStr} น.`,
    ``,
    `🌡️ อุณหภูมิ: ${weather.temperature}°C  (รู้สึกเหมือน ${weather.feelsLike}°C)`,
    `💧 ความชื้น: ${weather.humidity}%`,
    `🌤 สภาพอากาศ: ${weather.description}`,
    ``,
    `─────────────────────`,
    quote,
    `─────────────────────`,
    ``,
    `🏃 ไปออกกำลังกายกันได้เลย! 💪`,
  ].join('\n');
}

async function sendDailyMessage() {
  const groupId = process.env.LINE_GROUP_ID;

  if (!groupId || groupId === 'C_your_group_id_here') {
    console.error('[MESSAGE] LINE_GROUP_ID not configured in .env — skipping send.');
    return;
  }

  const client = new Client({
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET,
  });

  try {
    const weather = await fetchCurrentWeather();
    const text = buildMessage(weather);

    await client.pushMessage(groupId, { type: 'text', text });

    console.log('[MESSAGE] Daily message sent successfully.');
    console.log('[MESSAGE] Preview:\n' + text);
  } catch (err) {
    console.error('[MESSAGE] Failed to send message:', err.message);
  }
}

module.exports = { sendDailyMessage, buildMessage };
