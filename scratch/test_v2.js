const API_KEY = "8448768588";
const endpoints = [
  `https://www.thesportsdb.com/api/v2/json/${API_KEY}/leagues.php`,
  `https://www.thesportsdb.com/api/v1/json/${API_KEY}/all_leagues.php`
];

async function test() {
  for (const url of endpoints) {
    try {
      console.log(`Testing: ${url}`);
      const res = await fetch(url);
      console.log(`Status: ${res.status}`);
      if (res.ok) {
        const data = await res.json();
        console.log(`Data keys: ${Object.keys(data)}`);
      }
    } catch (e) {
      console.error(`Error for ${url}:`, e.message);
    }
  }
}

test();
