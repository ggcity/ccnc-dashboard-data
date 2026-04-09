const fetch = require('node-fetch');

const TOKEN    = process.env.MONDAY_TOKEN;
const BOARD_IDS = [10074819030,9846453445,9922062151,9922195851,9922228941,9852797939,10083757239,10083893945,10084360329,9831712576];

const query = `{
  boards(ids: [${BOARD_IDS.join(',')}]) {
    id name
    items_page(limit: 50) {
      items {
        name
        column_values { id text }
      }
    }
  }
}`;

async function fetchData() {
  const res  = await fetch('https://api.monday.com/v2', {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': TOKEN,
      'API-Version':   '2024-01'
    },
    body: JSON.stringify({ query })
  });

  const json = await res.json();

  // Add timestamp so dashboard knows when data was last updated
  json.last_updated = new Date().toISOString();

  // Write to data.json
  const fs = require('fs');
  fs.writeFileSync('data.json', JSON.stringify(json, null, 2));
  console.log('data.json written successfully');
}

fetchData().catch(e => { console.error(e); process.exit(1); });
