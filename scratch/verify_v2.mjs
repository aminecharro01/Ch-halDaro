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
const BASE_URL = `https://www.thesportsdb.com/api/v2/json`;

async function testEndpoint(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}/${endpoint}`);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  console.log(`Testing: ${url.toString()}`);
  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-API-KEY': API_KEY,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`Error: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error(text.substring(0, 100));
      return;
    }

    const data = await response.json();
    const v2RootKeys = ['lookup', 'list', 'search', 'filter', 'schedule', 'livescore', 'all'];
    let result = data;
    let foundKey = null;
    for (const key of v2RootKeys) {
      if (data && data[key] && Array.isArray(data[key])) {
        result = data[key];
        foundKey = key;
        break;
      }
    }
    
    if (foundKey) {
        console.log(`✅ SUCCESS: Found root key "${foundKey}", array length: ${result.length}`);
        console.log(`   Sample item keys: ${Object.keys(result[0] || {}).slice(0, 5).join(', ')}...`);
    } else {
        console.log(`⚠️  WARNING: No root array found. Response keys: ${Object.keys(data).join(', ')}`);
        console.log(`   Response content: ${JSON.stringify(data)}`);
    }
  } catch (error) {
    console.error(`❌ FAILED: ${error.message}`);
  }
}

async function runTests() {
  console.log("--- Starting V2 API Tests ---");
  await testEndpoint('all/leagues');
  await testEndpoint('lookup/league/4328');
  await testEndpoint('schedule/next/league/4328');
  await testEndpoint('list/players/133604');
  await testEndpoint('lookup/table.php', { l: '4328', s: '2024-2025' });
  await testEndpoint('lookuptable.php', { l: '4328', s: '2024-2025' });
  console.log("--- Tests Finished ---");
}

runTests();
