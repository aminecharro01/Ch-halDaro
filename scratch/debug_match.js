const API_KEY = "8448768588";
const MATCH_ID = "2267427";

async function debug() {
  const matchUrl = `https://www.thesportsdb.com/api/v1/json/${API_KEY}/lookupevent.php?id=${MATCH_ID}`;
  const res = await fetch(matchUrl);
  const data = await res.json();
  const event = data.events?.[0];
  if (!event) {
    console.log("Match not found");
    return;
  }
  console.log(`Match: ${event.strHomeTeam} vs ${event.strAwayTeam}`);
  console.log(`Home Team ID: ${event.idHomeTeam}`);
  console.log(`Away Team ID: ${event.idAwayTeam}`);

  const squadUrl = `https://www.thesportsdb.com/api/v1/json/${API_KEY}/lookup_all_players.php?id=${event.idHomeTeam}`;
  const squadRes = await fetch(squadUrl);
  const squadData = await squadRes.json();
  console.log(`Home Squad Players Count: ${squadData.players?.length || 0}`);
}

debug();
