```javascript
/* ============================================
   GetFameMap — Global App Logic
   ============================================ */

// ── SUPABASE CONFIG (reads from config.js) ──
async function getSupabase() {
  const { createClient } = await import(
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
  );
  return createClient(
    window.CONFIG?.SUPABASE_URL || window.SUPABASE_URL,
    window.CONFIG?.SUPABASE_ANON_KEY || window.SUPABASE_ANON_KEY
  );
}

// ── SESSION GUARD ──
async function requireAuth(redirectTo = '/login.html') {
  const supabase = await getSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = redirectTo;
    return null;
  }
  return session.user;
}

// ── LOGOUT ──
async function handleLogout() {
  const supabase = await getSupabase();
  await supabase.auth.signOut();
  window.location.href = '/login.html';
}

// ── TRIAL DAYS LEFT ──
function getTrialDaysLeft(user) {
  const trialEnds = new Date(user.user_metadata?.trial_ends);
  if (!trialEnds) return 0;
  return Math.max(0, Math.ceil((trialEnds - Date.now()) / 86400000));
}

// ── REFERRAL CODE ──
function getReferralCode() {
  return new URLSearchParams(window.location.search).get('ref')
    || localStorage.getItem('referralCode')
    || null;
}

function saveReferralCode() {
  const code = new URLSearchParams(window.location.search).get('ref');
  if (code) localStorage.setItem('referralCode', code);
}
saveReferralCode();

// ── FORMAT DATE ──
function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
}

function formatDateTime(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

// ── COPY TO CLIPBOARD ──
async function copyToClipboard(text, feedbackEl) {
  try {
    await navigator.clipboard.writeText(text);
    if (feedbackEl) {
      feedbackEl.classList.add('show');
      setTimeout(() => feedbackEl.classList.remove('show'), 3000);
    }
    return true;
  } catch { return false; }
}

// ── SHOW ALERT ──
function showAlert(id, message, type = 'success') {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  el.className = `alert alert-${type} show`;
  if (type === 'success') setTimeout(() => el.classList.remove('show'), 4000);
}

function hideAlert(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('show');
}

// ── VALIDATE EMAIL ──
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── VALIDATE GOOGLE LINK ──
function isValidGoogleLink(url) {
  return url.includes('google.com/maps') ||
         url.includes('maps.app.goo.gl') ||
         url.includes('goo.gl/maps') ||
         url.includes('g.page') ||
         url.includes('maps.google.com');
}

// ── SET BUTTON LOADING ──
function setLoading(btnId, loading, originalText) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = loading;
  btn.innerHTML = loading
    ? '<span class="spinner"></span> Please wait...'
    : originalText;
}

// ── BUILD REFERRAL LINK ──
function buildReferralLink(userId) {
  return `${window.location.origin}/signup.html?ref=${userId}`;
}

// ── WHATSAPP SHARE ──
function buildWhatsAppShare(referralLink) {
  const appName = window.CONFIG?.APP_NAME || 'GetFameMap';
  const msg = encodeURIComponent(
    `Hey! I use ${appName} to get Google reviews on autopilot. First 7 days free: ${referralLink}`
  );
  return `https://wa.me/?text=${msg}`;
}

// ── SMS SHARE ──
function buildSMSShare(referralLink) {
  const appName = window.CONFIG?.APP_NAME || 'GetFameMap';
  const msg = encodeURIComponent(
    `Try ${appName} — automates Google review requests. 7-day free trial: ${referralLink}`
  );
  return `sms:?body=${msg}`;
}

// ── EMAIL SHARE ──
function buildEmailShare(referralLink) {
  const subject = encodeURIComponent('Get more Google reviews automatically');
  const body = encodeURIComponent(
    `Hey,\n\nI use GetFameMap to automatically send review requests to my customers.\n\nFirst 7 days completely free:\n${referralLink}`
  );
  return `mailto:?subject=${subject}&body=${body}`;
}

// ── WEEK AGO ──
function weekAgo() {
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
}

// ── LOG QR SCAN ──
async function logQRScan(userId) {
  const supabase = await getSupabase();
  await supabase.from('qr_scans').insert({
    user_id: userId,
    scanned_at: new Date().toISOString()
  });
}

// ── WEEKLY STATS ──
async function getWeeklyStats(userId) {
  const supabase = await getSupabase();
  const { data } = await supabase
    .from('review_requests')
    .select('created_at')
    .eq('user_id', userId);
  const total = data?.length || 0;
  const thisWeek = data?.filter(r => new Date(r.created_at) > weekAgo()).length || 0;
  return { total, thisWeek };
}

// ── CHECK TRIAL STATUS ──
async function checkTrialAndRedirect() {
  const supabase = await getSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;
  const meta = session.user.user_metadata;
  const trialEnds = new Date(meta.trial_ends);
  const daysLeft = Math.max(0, Math.ceil((trialEnds - Date.now()) / 86400000));
  const subscribed = meta.subscribed || false;
  if (daysLeft === 0 && !subscribed) {
    window.location.href = '/upgrade.html';
  }
}

// ── PUSH NOTIFICATIONS ──
async function requestNotificationPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

function sendLocalNotification(title, body) {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png'
    });
  }
}

console.log('%cGetFameMap app.js loaded ✅', 'color:#4ade80;font-weight:bold;');
```
