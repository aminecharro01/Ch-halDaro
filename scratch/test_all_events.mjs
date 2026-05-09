import fs from 'fs';
const env = fs.readFileSync('.env.local', 'utf8');
const API_KEY = env.match(/THESPORTSDB_KEY=(.*)/)?.[1]?.trim();
const BASE_URL = 'https://www.thesportsdb.com/api/v2/json';

async function testAllEventsDay() {
    const today = new Date().toISOString().split('T')[0];
    const url = `${BASE_URL}/all/events/day/${today}`;
    console.log(`Fetching: ${url}`);
    const response = await fetch(url, {
        headers: { 'X-API-KEY': API_KEY }
    });
    console.log(`Status: ${response.status}`);
    if (response.ok) {
        const data = await response.json();
        console.log('Root keys:', Object.keys(data));
    }
}

testAllEventsDay();
