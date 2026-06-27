/**
 * Local test for the ev-match function — runs the real handler on your machine.
 *
 * Usage (key stays local, never committed):
 *   ANTHROPIC_API_KEY=sk-ant-xxxx node local-test.mjs
 */
import { handler } from './netlify/functions/ev-match.js';

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('\n❌ ANTHROPIC_API_KEY is not set. Run:\n   ANTHROPIC_API_KEY=sk-ant-xxxx node local-test.mjs\n');
  process.exit(1);
}

// Mimic the event Netlify passes to the function
const event = {
  httpMethod: 'POST',
  body: JSON.stringify({
    unit: 'mi',
    monthly_dist: 900,
    fuel_use: 31,
    fuel_price: 3.6,
    ev_efficiency: 3.8,
    elec_price: 0.15,
    monthly_savings: '$120',
    yearly_savings: '$1440',
    dealer: 'Test Motors',
    model: 'Model 3',
  }),
};

console.log('Calling handler...\n');
const res = await handler(event);
console.log('statusCode:', res.statusCode);
console.log('body:', res.body);

if (res.statusCode === 200) {
  console.log('\n✅ SUCCESS — the key works and the function returns recommendations.');
} else {
  console.log('\n❌ FAILED — see the body above for the reason (e.g. invalid x-api-key).');
}
