import fs from 'fs';
const env = fs.readFileSync('.env.local', 'utf8');
const API_KEY = env.match(/THESPORTSDB_KEY=(.*)/)?.[1]?.trim();
const BASE_URL = 'https://www.thesportsdb.com/api/v2/json';

async function dumpLivescore() {
    const url = `${BASE_URL}/livescore/Soccer`;
    console.log(`Fetching: ${url}`);
    const response = await fetch(url, {
        headers: { 'X-API-KEY': API_KEY }
    });
    const data = await response.json();
    const event = data.livescore?.[0];
    if (!event) {
        console.log('No live events.');
        return;
    }
    console.log('Event keys:', Object.keys(event));
    console.log('Sample data:', event);
}

dumpLivescore();
