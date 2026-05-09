const API_KEY = "8448768588";
const MATCH_ID = "2267427";

async function debug() {
  const url = `https://www.thesportsdb.com/api/v1/json/${API_KEY}/lookupevent.php?id=${MATCH_ID}`;
  const res = await fetch(url);
  const data = await res.json();
  const event = data.events?.[0];
  if (event) {
    console.log(`Match: ${event.strEvent}`);
    console.log(`strStatus: ${event.strStatus}`);
    console.log(`strProgress: ${event.strProgress || "EMPTY"}`);
    console.log(`All keys: ${Object.keys(event).filter(k => k.toLowerCase().includes('time') || k.toLowerCase().includes('progress'))}`);
  }
}

debug();
