import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple env parser
function loadEnv(filePath) {
    if (!fs.existsSync(filePath)) return {};
    const content = fs.readFileSync(filePath, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
        const [key, ...value] = line.split('=');
        if (key && value) env[key.trim()] = value.join('=').trim().replace(/^["']|["']$/g, '');
    });
    return env;
}

const env = loadEnv(path.resolve(__dirname, '../.env.local'));
const API_KEY = env.THESPORTSDB_KEY || "3";

async function testStandings() {
  const url = `https://www.thesportsdb.com/api/v1/json/${API_KEY}/lookuptable.php?l=4328&s=2024-2025`;
  console.log(`Testing Standings V1 Fallback: ${url}`);
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
        console.error(`Error: ${response.status}`);
        return;
    }
    const data = await response.json();
    if (data && data.table) {
        console.log(`✅ SUCCESS: Found table with ${data.table.length} rows.`);
    } else {
        console.log(`⚠️  WARNING: No table found. Keys: ${Object.keys(data).join(', ')}`);
    }
  } catch (e) {
    console.error(`❌ FAILED: ${e.message}`);
  }
}

testStandings();
