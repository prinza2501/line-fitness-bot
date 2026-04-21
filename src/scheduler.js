const cron = require('node-cron');
const SunCalc = require('suncalc');
const { sendDailyMessage } = require('./message');

const LAT = 8.663;
const LON = 100.013;

let pendingTimeout = null;

function getSunsetMinus1Hour(date) {
  const times = SunCalc.getTimes(date, LAT, LON);
  return new Date(times.sunset.getTime() - 60 * 60 * 1000);
}

function scheduleForToday() {
  const now = new Date();
  const fireTime = getSunsetMinus1Hour(now);
  const delayMs = fireTime.getTime() - now.getTime();

  if (delayMs <= 0) {
    console.log('[SCHEDULER] Sunset -1h already passed today. Will reschedule at midnight.');
    return;
  }

  const fireTimeStr = fireTime.toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });
  console.log(`[SCHEDULER] Next message scheduled for: ${fireTimeStr} (in ${Math.round(delayMs / 60000)} minutes)`);

  if (pendingTimeout) clearTimeout(pendingTimeout);

  pendingTimeout = setTimeout(async () => {
    console.log('[SCHEDULER] Firing sunset message...');
    await sendDailyMessage();
  }, delayMs);
}

function startScheduler() {
  cron.schedule('1 0 * * *', () => {
    console.log('[SCHEDULER] Midnight — recalculating sunset time...');
    scheduleForToday();
  }, { timezone: 'Asia/Bangkok' });

  console.log('[SCHEDULER] Starting up — calculating today\'s sunset...');
  scheduleForToday();
}

module.exports = { startScheduler };
