const { middleware, Client } = require('@line/bot-sdk');
const { Router } = require('express');
const { fetchCurrentWeather } = require('./weather');
const { buildMessage } = require('./message');
const { analyzeFoodImage, buildFoodReply } = require('./food');

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

function createWebhookRouter() {
  const router = Router();
  const client = new Client(lineConfig);

  router.post('/', middleware(lineConfig), (req, res) => {
    res.status(200).send('OK');

    const events = req.body.events || [];
    events.forEach((event) => handleEvent(client, event).catch(console.error));
  });

  return router;
}

async function handleEvent(client, event) {
  if (event.type !== 'message') return;

  if (event.message.type === 'image') {
    await client.replyMessage(event.replyToken, {
      type: 'text',
      text: '🔍 กำลังวิเคราะห์อาหาร รอแป๊บนึงนะครับ...',
    });
    try {
      const stream = await client.getMessageContent(event.message.id);
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      const imageBuffer = Buffer.concat(chunks);
      const result = await analyzeFoodImage(imageBuffer);
      const reply = buildFoodReply(result);
      await client.pushMessage(event.source.groupId || event.source.userId, {
        type: 'text',
        text: reply,
      });
    } catch (err) {
      console.error('[FOOD] Analysis failed:', err.message);
      await client.pushMessage(event.source.groupId || event.source.userId, {
        type: 'text',
        text: `❌ วิเคราะห์ไม่ได้: ${err.message}`,
      });
    }
    return;
  }

  if (event.message.type !== 'text') return;

  const text = event.message.text.trim().toLowerCase();
  const sourceType = event.source.type;

  if (text === '!getid') {
    if (sourceType === 'group') {
      const groupId = event.source.groupId;
      console.log(`[WEBHOOK] !getid — Group ID: ${groupId}`);
      await client.replyMessage(event.replyToken, {
        type: 'text',
        text: `Group ID:\n${groupId}\n\nนำไปใส่ใน .env ที่ LINE_GROUP_ID ได้เลยครับ 🎉`,
      });
    } else {
      const userId = event.source.userId;
      console.log(`[WEBHOOK] !getid — User ID: ${userId}`);
      await client.replyMessage(event.replyToken, {
        type: 'text',
        text: `User ID ของคุณคือ:\n${userId}\n\nนำไปใส่ใน .env ที่ LINE_GROUP_ID ได้เลยครับ (ใช้ทดสอบในแชทส่วนตัวได้เลย) 🎉`,
      });
    }
  }

  if (text === '/test') {
    console.log(`[WEBHOOK] /test called from ${sourceType}`);
    try {
      const weather = await fetchCurrentWeather();
      const message = buildMessage(weather);
      await client.replyMessage(event.replyToken, { type: 'text', text: message });
    } catch (err) {
      console.error('[WEBHOOK] /test failed:', err.message);
      await client.replyMessage(event.replyToken, {
        type: 'text',
        text: `❌ เกิดข้อผิดพลาด: ${err.message}`,
      });
    }
  }
}

module.exports = { createWebhookRouter };
