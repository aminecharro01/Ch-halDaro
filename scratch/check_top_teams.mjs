import fs from 'fs';
const env = fs.readFileSync('.env.local', 'utf8');
const API_KEY = env.match(/THESPORTSDB_KEY=(.*)/)?.[1]?.trim();
const BASE_URL = 'https://www.thesportsdb.com/api/v2/json';

async function checkTeams() {
    const teams = ['Real Madrid', 'Manchester City', 'Liverpool', 'PSG', 'Bayern Munich', 'Arsenal'];
    for (const name of teams) {
        const url = `${BASE_URL}/search/team/${encodeURIComponent(name)}`;
        const response = await fetch(url, { headers: { 'X-API-KEY': API_KEY } });
        const data = await response.json();
        const team = data.search?.[0];
        if (team) {
            console.log(`${name}: ID=${team.idTeam}, Badge=${team.strBadge}`);
        }
    }
}

checkTeams();
