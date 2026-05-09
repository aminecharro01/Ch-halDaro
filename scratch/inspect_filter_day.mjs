import fs from 'fs';
const env = fs.readFileSync('.env.local', 'utf8');
const API_KEY = env.match(/THESPORTSDB_KEY=(.*)/)?.[1]?.trim();
const BASE_URL = 'https://www.thesportsdb.com/api/v2/json';

async function dumpFilterDay() {
    const today = new Date().toISOString().split('T')[0];
    const url = `${BASE_URL}/filter/day/${today}/Soccer`;
    console.log(`Fetching: ${url}`);
    const response = await fetch(url, {
        headers: { 'X-API-KEY': API_KEY }
    });
    const data = await response.json();
    const event = data.filter?.[0];
    if (!event) {
        console.log('No events today.');
        return;
    }
    console.log('Event keys:', Object.keys(event));
    console.log('Sample data:', {
        idEvent: event.idEvent,
        strEvent: event.strEvent,
        idHomeTeam: event.idHomeTeam,
        idAwayTeam: event.idAwayTeam,
        strHomeTeam: event.strHomeTeam,
        strAwayTeam: event.strAwayTeam,
        strHomeTeamBadge: event.strHomeTeamBadge,
        strAwayTeamBadge: event.strAwayTeamBadge
    });
}

dumpFilterDay();
