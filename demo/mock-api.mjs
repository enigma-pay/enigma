import http from "http";

const PORT = 4000;

const routes = {
  "GET /weather/current": () => ({
    city: "San Francisco",
    temp_c: 18,
    condition: "Partly cloudy",
    humidity: 72,
    wind_kph: 14,
  }),
  "GET /weather/forecast": () => ({
    city: "San Francisco",
    days: [
      { date: "2026-06-01", high_c: 20, low_c: 13, condition: "Sunny" },
      { date: "2026-06-02", high_c: 17, low_c: 11, condition: "Foggy" },
      { date: "2026-06-03", high_c: 22, low_c: 14, condition: "Clear" },
    ],
  }),
  "GET /crypto/price": () => ({
    symbol: "SOL",
    price_usd: 142.37,
    change_24h: 3.21,
    volume_24h: 1_200_000_000,
  }),
};

const server = http.createServer((req, res) => {
  const key = `${req.method} ${req.url.split("?")[0]}`;
  const handler = routes[key];

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (handler) {
    res.writeHead(200);
    res.end(JSON.stringify(handler()));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: "not found", path: req.url }));
  }
});

server.listen(PORT, () => {
  console.log(`Mock API running on http://localhost:${PORT}`);
  console.log("Endpoints:");
  Object.keys(routes).forEach((r) => console.log(" ", r));
});
