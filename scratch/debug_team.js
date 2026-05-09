const API_KEY = "8448768588";
const ID = "133602";

async function debug() {
  const url = `https://www.thesportsdb.com/api/v1/json/${API_KEY}/lookupteam.php?id=${ID}`;
  const res = await fetch(url);
  const data = await res.json();
  console.log(`Team: ${data.teams?.[0]?.strTeam || "Not found"}`);
}

debug();
