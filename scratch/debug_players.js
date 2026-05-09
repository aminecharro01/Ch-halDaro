const API_KEY = "8448768588";
const TEAM_NAME = "Liverpool";

async function debug() {
  const url = `https://www.thesportsdb.com/api/v1/json/${API_KEY}/searchplayers.php?t=${TEAM_NAME}`;
  const res = await fetch(url);
  const data = await res.json();
  console.log(`Players found for ${TEAM_NAME}: ${data.player?.length || 0}`);
  if (data.player?.[0]) {
    console.log(`First player: ${data.player[0].strPlayer}`);
  }
}

debug();
