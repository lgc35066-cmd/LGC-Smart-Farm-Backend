const app = require("./app");

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`LGC Smart Farm backend running on http://localhost:${PORT}`);
});
