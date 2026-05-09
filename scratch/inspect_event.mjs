import fs from 'fs';
const env = fs.readFileSync('.env.local', 'utf8');
const API_KEY = env.match(/THESPORTSDB_KEY=(.*)/)?.[1]?.trim();
const BASE_URL = 'https://www.thesportsdb.com/api/v2/json';

async function dumpEvent() {
    const url = `${BASE_URL}/schedule/next/league/4328`;
    const response = await fetch(url, {
        headers: { 'X-API-KEY': API_KEY }
    });
    const data = await response.json();
    const event = data.schedule[0];
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

dumpEvent();
