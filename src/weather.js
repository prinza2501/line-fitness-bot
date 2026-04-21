const axios = require('axios');

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';

const WMO_MAP = {
  0:  { th: 'ท้องฟ้าแจ่มใส',                      emoji: '☀️' },
  1:  { th: 'แจ่มใสเป็นส่วนใหญ่',                 emoji: '🌤️' },
  2:  { th: 'มีเมฆบางส่วน',                       emoji: '⛅' },
  3:  { th: 'มีเมฆมาก',                           emoji: '☁️' },
  45: { th: 'หมอกลง',                             emoji: '🌫️' },
  48: { th: 'หมอกเยือกแข็ง',                      emoji: '🌫️' },
  51: { th: 'ฝนปรอยเบา',                          emoji: '🌦️' },
  53: { th: 'ฝนปรอยปานกลาง',                     emoji: '🌦️' },
  55: { th: 'ฝนปรอยหนัก',                         emoji: '🌦️' },
  61: { th: 'ฝนเบา',                              emoji: '🌧️' },
  63: { th: 'ฝนปานกลาง',                          emoji: '🌧️' },
  65: { th: 'ฝนหนัก',                             emoji: '🌧️' },
  80: { th: 'ฝนตกเป็นช่วง (เบา)',                emoji: '🌦️' },
  81: { th: 'ฝนตกเป็นช่วง (ปานกลาง)',            emoji: '🌧️' },
  82: { th: 'ฝนตกเป็นช่วง (หนักมาก)',            emoji: '⛈️' },
  95: { th: 'พายุฝนฟ้าคะนอง',                    emoji: '⛈️' },
  96: { th: 'พายุฝนฟ้าคะนองพร้อมลูกเห็บ',        emoji: '⛈️' },
  99: { th: 'พายุฝนฟ้าคะนองพร้อมลูกเห็บหนัก',   emoji: '⛈️' },
};

function getWeatherDescription(code) {
  return WMO_MAP[code] || { th: 'สภาพอากาศไม่ทราบ', emoji: '🌡️' };
}

async function fetchCurrentWeather() {
  const response = await axios.get(OPEN_METEO_URL, {
    params: {
      latitude: 8.663,
      longitude: 100.013,
      current: 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code',
      timezone: 'Asia/Bangkok',
      forecast_days: 1,
    },
    timeout: 10000,
  });

  const current = response.data.current;
  const { th, emoji } = getWeatherDescription(current.weather_code);

  return {
    temperature: Math.round(current.temperature_2m),
    feelsLike: Math.round(current.apparent_temperature),
    humidity: current.relative_humidity_2m,
    description: th,
    emoji,
  };
}

module.exports = { fetchCurrentWeather };
