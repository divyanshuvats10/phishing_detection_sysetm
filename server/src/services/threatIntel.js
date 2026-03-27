const fetch = require('node-fetch');

async function checkVirusTotal(url, apiKey) {
  if (!apiKey) return { ok: false, reason: 'no_api_key' };
  try {
    // submit URL for analysis
    const params = new URLSearchParams();
    params.append('url', url);

    const submit = await fetch('https://www.virustotal.com/api/v3/urls', {
      method: 'POST',
      headers: {
        'x-apikey': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });
    const submitJson = await submit.json();

    // Return submission response and provide endpoint to poll if needed
    return { ok: true, submit: submitJson };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function checkHIBP(account, apiKey) {
  if (!apiKey) return { ok: false, reason: 'no_api_key' };
  try {
    const endpoint = `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(account)}`;
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'hibp-api-key': apiKey,
        'User-Agent': 'Phishing-Detection-System/1.0'
      }
    });
    if (res.status === 404) return { ok: true, breached: false };
    const json = await res.json();
    return { ok: true, breached: true, breaches: json };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

module.exports = { checkVirusTotal, checkHIBP };
