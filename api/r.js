const LOCATION = "Bora Sailing Belgrade, Kej Oslobođenja, Novi Beograd https://maps.app.goo.gl/r1UWvRG3PVG7vY3L6";
const DESCRIPTION = "Bora Sailing Belgrade";
const TIMEZONE = "Europe/Belgrade";

module.exports = (req, res) => {
  const { t, d, s, e } = req.query;

  if (!t || !d || !s || !e) {
    return res.status(400).send("Параметры: t=название, d=YYYYMMDD, s=HHMM, e=HHMM");
  }

  const dates = `${d}T${s}00/${d}T${e}00`;

  const calUrl =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    `&text=${encodeURIComponent(t)}` +
    `&dates=${dates}` +
    `&ctz=${encodeURIComponent(TIMEZONE)}` +
    `&location=${encodeURIComponent(LOCATION)}` +
    `&details=${encodeURIComponent(DESCRIPTION)}`;

  res.writeHead(302, { Location: calUrl });
  res.end();
};
