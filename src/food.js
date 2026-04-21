const axios = require('axios');
const FormData = require('form-data');

const BASE = 'https://api.logmeal.es/v2';

async function analyzeFoodImage(imageBuffer) {
  const token = process.env.LOGMEAL_API_TOKEN;
  const headers = { Authorization: `Bearer ${token}` };

  const form = new FormData();
  form.append('image', imageBuffer, { filename: 'food.jpg', contentType: 'image/jpeg' });

  const recRes = await axios.post(`${BASE}/image/segmentation/complete`, form, {
    headers: { ...headers, ...form.getHeaders() },
  });

  const imageId = recRes.data.imageId;
  const segments = recRes.data.segmentation_results || [];
  const topResults = segments.flatMap((s) => s.recognition_results || []);
  topResults.sort((a, b) => b.prob - a.prob);
  const foodNames = topResults.slice(0, 2).map((r) => r.name).join(', ') || 'ไม่ทราบ';

  const nutRes = await axios.post(
    `${BASE}/nutrition/recipe/nutritionalInfo`,
    { imageId },
    { headers }
  );

  const n = nutRes.data.nutritional_info || {};
  const nutrients = n.totalNutrients || {};

  return {
    foodNames,
    calories: n.calories ?? 0,
    protein: nutrients.PROCNT?.quantity ?? 0,
    carbs: nutrients.CHOCDF?.quantity ?? 0,
    fat: nutrients.FAT?.quantity ?? 0,
    fiber: nutrients.FIBTG?.quantity ?? 0,
  };
}

function buildFoodReply({ foodNames, calories, protein, carbs, fat, fiber }) {
  return [
    `🍽️ วิเคราะห์อาหาร`,
    `📌 ${foodNames}`,
    ``,
    `🔥 แคลอรี่: ${Math.round(calories)} kcal`,
    `💪 โปรตีน: ${protein.toFixed(1)} g`,
    `🍞 คาร์บ: ${carbs.toFixed(1)} g`,
    `🥑 ไขมัน: ${fat.toFixed(1)} g`,
    `🌿 ใยอาหาร: ${fiber.toFixed(1)} g`,
  ].join('\n');
}

module.exports = { analyzeFoodImage, buildFoodReply };
