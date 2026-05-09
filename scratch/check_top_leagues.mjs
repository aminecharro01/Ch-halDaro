import fs from 'fs';
const env = fs.readFileSync('.env.local', 'utf8');
const API_KEY = env.match(/THESPORTSDB_KEY=(.*)/)?.[1]?.trim();
const BASE_URL = 'https://www.thesportsdb.com/api/v2/json';

async function checkLeagues() {
    const leagues = ['English Premier League', 'Spanish La Liga', 'Italian Serie A', 'German Bundesliga', 'French Ligue 1', 'Moroccan Botola Pro'];
    for (const name of leagues) {
        const url = `${BASE_URL}/search/league/${encodeURIComponent(name)}`;
        const response = await fetch(url, { headers: { 'X-API-KEY': API_KEY } });
        const data = await response.json();
        const league = data.search?.[0];
        if (league) {
            console.log(`${name}: ID=${league.idLeague}, Badge=${league.strBadge}`);
        }
    }
}

checkLeagues();
