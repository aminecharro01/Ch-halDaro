const API_KEY = "8448768588";
const MATCH_ID = "2267427";

async function debug() {
  const url = `https://www.thesportsdb.com/api/v1/json/${API_KEY}/lookuptimeline.php?id=${MATCH_ID}`;
  const res = await fetch(url);
  const data = await res.json();
  const timeline = data.timeline || [];
  console.log(`Timeline events: ${timeline.length}`);
  if (timeline[0]) {
    console.log("Keys in first event:", Object.keys(timeline[0]));
    console.log(`First event time: ${timeline[0].intTime || timeline[0].time || "NOT FOUND"}`);
    console.log(`Full first event:`, JSON.stringify(timeline[0]));
  }
}

debug();
