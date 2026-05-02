const { Telegraf } = require('telegraf');

const TOKEN = process.env.BOT_TOKEN;
const SHORT_BASE = process.env.SHORT_BASE || 'https://bora-calendar.vercel.app/r';

const LOCATION = "Bora Sailing Belgrade, Kej Oslobođenja, Novi Beograd https://maps.app.goo.gl/r1UWvRG3PVG7vY3L6";
const DESCRIPTION = "Bora Sailing Belgrade";
const TIMEZONE = "Europe/Belgrade";

const HELP_TEXT = `Отправь мне сообщение в формате:

Название
ДД.ММ.ГГГГ
ЧЧ:ММ-ЧЧ:ММ

Примеры:
Тренировка по парусному спорту
23.04.2026
17:00-19:00

Форматы времени: 17:00-19:00 · 17.00-19.00 · 1700-1900 · 17-19
Форматы даты:   23.04.2026 · 23/04/2026`;

function parseTime(t) {
  t = t.trim();
  if (/^\d{3,4}$/.test(t)) {
    t = t.padStart(4, '0');
    return [parseInt(t.slice(0, 2)), parseInt(t.slice(2))];
  }
  t = t.replace(':', '.').replace(',', '.');
  const parts = t.split('.');
  return [parseInt(parts[0]), parts.length > 1 ? parseInt(parts[1]) : 0];
}

function parseDate(dateStr) {
  const parts = dateStr.trim().replace(/\//g, '.').split('.');
  if (parts.length !== 3) throw new Error(`Неверный формат даты: ${dateStr}`);
  let [day, month, year] = parts.map(Number);
  if (year < 100) year += 2000;
  return [day, month, year];
}

function makeShortUrl(title, dateStr, startStr, endStr) {
  const [day, month, year] = parseDate(dateStr);
  const [sh, sm] = parseTime(startStr);
  const [eh, em] = parseTime(endStr);

  const d = `${year}${String(month).padStart(2,'0')}${String(day).padStart(2,'0')}`;
  const s = `${String(sh).padStart(2,'0')}${String(sm).padStart(2,'0')}`;
  const e = `${String(eh).padStart(2,'0')}${String(em).padStart(2,'0')}`;

  return `${SHORT_BASE}?t=${encodeURIComponent(title)}&d=${d}&s=${s}&e=${e}`;
}

const bot = new Telegraf(TOKEN);

bot.start(ctx => ctx.reply(HELP_TEXT));

bot.on('text', async ctx => {
  const lines = ctx.message.text.trim().split('\n').map(l => l.trim()).filter(Boolean);

  if (lines.length < 3) return ctx.reply(HELP_TEXT);

  const [title, dateStr, timeStr] = lines;

  if (!timeStr.includes('-')) return ctx.reply('❌ Укажи время в формате: 17:00-19:00');

  const [startStr, endStr] = timeStr.split('-');

  try {
    const url = makeShortUrl(title, dateStr, startStr, endStr);
    await ctx.reply(`\`${url}\``, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [[
          { text: '📅 Добавить в Google Calendar', url }
        ]]
      }
    });
  } catch (e) {
    await ctx.reply(`❌ Ошибка: ${e.message}\n\n${HELP_TEXT}`);
  }
});

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    await bot.handleUpdate(req.body);
    res.status(200).end();
  } else {
    res.status(200).send('Bora Calendar Bot — OK');
  }
};
