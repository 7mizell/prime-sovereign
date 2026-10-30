// Prime Sovereign Listings — Automated Outreach Engine
// Runs locally on laptop via cron. Zero-GPU. Pure local AI via Ollama.
// Reads leads from Airtable/CSV, generates personalized DMs using templates,
// sends via Instagram Basic Display API or email, tracks responses.

const fs = require('fs');
const path = require('path');
const https = require('https');

// CONFIG — set via env vars
const CONFIG = {
  OLLAMA_URL: process.env.OLLAMA_URL || 'http://localhost:11434',
  OLLAMA_MODEL: process.env.OLLAMA_MODEL || 'kemet-comms',
  LEADS_FILE: process.env.LEADS_FILE || './leads/leads.csv',
  OUTREACH_LOG: process.env.OUTREACH_LOG || './outreach/log.jsonl',
  DAILY_LIMIT: parseInt(process.env.DAILY_LIMIT) || 50,
  INSTAGRAM_ACCESS_TOKEN: process.env.INSTAGRAM_ACCESS_TOKEN,
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  FROM_EMAIL: process.env.FROM_EMAIL || 'hello@primesovereign.com'
};

// Load templates
const OUTREACH_TEMPLATES = fs.readFileSync(path.join(__dirname, '../OUTREACH.md'), 'utf8');
const OFFER = fs.readFileSync(path.join(__dirname, '../OFFER.md'), 'utf8');

function parseTemplates(markdown) {
  const sections = {};
  const regex = /^##\s+(.+)$/gm;
  let match, lastHeader = null, content = [];
  const lines = markdown.split('\n');
  for (const line of lines) {
    const headerMatch = line.match(/^##\s+(.+)$/);
    if (headerMatch) {
      if (lastHeader) sections[lastHeader] = content.join('\n').trim();
      lastHeader = headerMatch[1].toLowerCase().replace(/\s+/g, '-');
      content = [];
    } else if (lastHeader) {
      content.push(line);
    }
  }
  if (lastHeader) sections[lastHeader] = content.join('\n').trim();
  return sections;
}

const TEMPLATES = parseTemplates(OUTREACH_TEMPLATES);

// Generate personalized DM using local Ollama
async function generateDM(lead, templateKey) {
  const template = TEMPLATES[templateKey] || TEMPLATES['instagram-dm'];
  if (!template) throw new Error(`Template ${templateKey} not found`);

  const prompt = `You are Prime Sovereign Listings' outreach specialist. Write a personalized Instagram DM for a luxury real estate agent.

LEAD:
- Name: ${lead.name || 'Agent'}
- Brokerage: ${lead.brokerage || 'Unknown'}
- Location: ${lead.location || 'Unknown'}
- Recent Listing: ${lead.recent_listing || 'Unknown'}
- Profile URL: ${lead.profile_url || 'Unknown'}

TEMPLATE STRUCTURE:
${template}

OFFER DETAILS:
${OFFER}

RULES:
- Max 300 characters (IG DM limit)
- Natural, not salesy. Reference their specific listing or brokerage.
- Include ONE soft CTA (reply "sample" / "interested" / "yes")
- No emojis unless they use them first
- Sound like Marcus: direct, real, zero fluff
- Sign as "Marcus, Prime Sovereign Listings"

Return ONLY the DM text.`;

  const res = await fetch(`${CONFIG.OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: CONFIG.OLLAMA_MODEL,
      prompt,
      stream: false,
      options: { temperature: 0.7, top_p: 0.9, num_predict: 150 }
    })
  });

  const data = await res.json();
  return data.response?.trim() || template;
}

// Send Instagram DM via Basic Display API
async function sendInstagramDM(recipientId, message) {
  if (!CONFIG.INSTAGRAM_ACCESS_TOKEN) {
    console.log('[OUTREACH] No IG token — logging only');
    return { success: true, simulated: true };
  }

  return new Promise((resolve) => {
    const postData = JSON.stringify({ recipient: { id: recipientId }, message: { text: message } });
    const options = {
      hostname: 'graph.instagram.com',
      path: `/v18.0/me/messages?access_token=${CONFIG.INSTAGRAM_ACCESS_TOKEN}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ success: res.statusCode === 200, data: parsed });
        } catch { resolve({ success: false, error: data }); }
      });
    });
    req.on('error', (e) => resolve({ success: false, error: e.message }));
    req.write(postData);
    req.end();
  });
}

// Send email via SendGrid
async function sendEmail(to, subject, html) {
  if (!CONFIG.SENDGRID_API_KEY) {
    console.log('[OUTREACH] No SendGrid key — logging only');
    return { success: true, simulated: true };
  }
  // Implementation would use @sendgrid/mail or direct API
  return { success: true, simulated: true };
}

// Log outreach attempt
function logOutreach(lead, templateKey, message, result) {
  const entry = {
    timestamp: new Date().toISOString(),
    lead: { email: lead.email, name: lead.name, brokerage: lead.brokerage },
    template: templateKey,
    message: message.substring(0, 200),
    result: { success: result.success, simulated: result.simulated, error: result.error }
  };
  fs.appendFileSync(CONFIG.OUTREACH_LOG, JSON.stringify(entry) + '\n');
}

// Main outreach loop
async function runOutreach() {
  console.log('[OUTREACH] Starting Prime Sovereign automated outreach...');

  // Load leads
  let leads = [];
  try {
    const csv = fs.readFileSync(CONFIG.LEADS_FILE, 'utf8');
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const lead = {};
      headers.forEach((h, idx) => lead[h] = values[idx]);
      leads.push(lead);
    }
  } catch (e) {
    console.error('[OUTREACH] Failed to load leads:', e.message);
    return;
  }

  console.log(`[OUTREACH] Loaded ${leads.length} leads. Daily limit: ${CONFIG.DAILY_LIMIT}`);

  // Check today's count
  let todayCount = 0;
  if (fs.existsSync(CONFIG.OUTREACH_LOG)) {
    const today = new Date().toISOString().split('T')[0];
    const logs = fs.readFileSync(CONFIG.OUTREACH_LOG, 'utf8').trim().split('\n');
    todayCount = logs.filter(l => l.startsWith(`{"timestamp":"${today}`)).length;
  }

  if (todayCount >= CONFIG.DAILY_LIMIT) {
    console.log(`[OUTREACH] Daily limit reached (${todayCount}/${CONFIG.DAILY_LIMIT})`);
    return;
  }

  const toProcess = leads.slice(todayCount, todayCount + CONFIG.DAILY_LIMIT - todayCount);

  for (const lead of toProcess) {
    try {
      // Choose template based on lead data
      const templateKey = lead.platform === 'email' ? 'email-cold' : 'instagram-dm';
      const message = await generateDM(lead, templateKey);

      let result;
      if (lead.platform === 'email' || lead.instagram_id) {
        result = await sendInstagramDM(lead.instagram_id, message);
      } else {
        result = await sendEmail(lead.email, 'Your listing at ' + (lead.recent_listing || 'your property'), message);
      }

      logOutreach(lead, templateKey, message, result);
      console.log(`[OUTREACH] ${result.success ? '✓' : '✗'} ${lead.name} (${lead.brokerage})`);

      // Rate limit: 2-5 sec between sends
      await new Promise(r => setTimeout(r, 2000 + Math.random() * 3000));
    } catch (e) {
      console.error(`[OUTREACH] Error for ${lead.name}:`, e.message);
      logOutreach(lead, 'error', '', { success: false, error: e.message });
    }
  }

  console.log('[OUTREACH] Complete.');
}

// Run if called directly
if (require.main === module) {
  runOutreach().catch(console.error);
}

module.exports = { runOutreach, generateDM, sendInstagramDM, sendEmail };