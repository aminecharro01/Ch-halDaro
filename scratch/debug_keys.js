const API_KEY = "8448768588";
const ID = "133602";

async function debug() {
  const url = `https://www.thesportsdb.com/api/v1/json/${API_KEY}/lookup_all_players.php?id=${ID}`;
  const res = await fetch(url);
  const data = await res.json();
  console.log(`Keys found: ${Object.keys(data)}`);
  if (data.player) console.log(`'player' key found. Length: ${data.player.length}`);
  if (data.players) console.log(`'players' key found. Length: ${data.players.length}`);
}

debug();
