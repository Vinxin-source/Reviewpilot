/* ============================================
   ReviewPilot — Global App Logic
   Loaded on every page
   ============================================ */

// ── SUPABASE CONFIG ──
window.SUPABASE_URL = 'https://kknlpvjmdetlptdsafhz.supabase.co';
window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrbmxwdmptZGV0bHB0ZHNhZmh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MDg3NDAsImV4cCI6MjA5NzA4NDc0MH0.XGhDl_Ksr6yLrvKYB4cK8Bs8pq3pEh5ftGQ5471EYIU';

// ── SUPABASE CLIENT ──
async function getSupabase() {
  const { createClient } = await import(
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
  );
  return createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
}

// ── SESSION GUARD ──
// Call this at top of any protected page
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

// ── REFERRAL CODE FROM URL ──
function getReferralCode() {
  return new URLSearchParams(window.location.search).get('ref')
    || localStorage.getItem('referralCode')
    || null;
}

// ── SAVE REFERRAL CODE ──
function saveReferralCode() {
  const code = new URLSearchParams(window.location.search).get('ref');
  if (code) localStorage.setItem('referralCode', code);
}
saveReferralCode(); // runs on every page load

// ── FORMAT DATE ──
function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// ── FORMAT DATE + TIME ──
function formatDateTime(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
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
  } catch {
    return false;
  }
}

// ── SHOW ALERT ──
function showAlert(id, message, type = 'success') {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  el.className = `alert alert-${type} show`;
  if (type === 'success') {
    setTimeout(() => el.classList.remove('show'), 4000);
  }
}

function hideAlert(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('show');
}

// ── SEND REVIEW REQUEST ──
async function sendReviewRequest({ userId, businessName, googleLink, customerName, customerEmail, customerPhone }) {
  const supabase = await getSupabase();

  const { error } = await supabase.from('review_requests').insert({
    user_id: userId,
    business_name: businessName,
    google_review_link: googleLink,
    customer_name: customerName,
    customer_email: customerEmail || null,
    customer_phone: customerPhone || null,
    status: 'pending',
    send_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
  });

  if (error) throw error;
  return true;
}

// ── LOAD REVIEW REQUESTS ──
async function loadReviewRequests(userId, limit = 50) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('review_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

// ── LOAD REFERRALS ──
async function loadReferrals(userId) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('referrals')
    .select('*')
    .eq('referrer_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// ── BUILD REFERRAL LINK ──
function buildReferralLink(userId) {
  return `${window.location.origin}/signup.html?ref=${userId}`;
}

// ── BUILD WHATSAPP SHARE ──
function buildWhatsAppShare(referralLink) {
  const msg = encodeURIComponent(
    `Hey! I use ReviewPilot to get Google reviews on autopilot for my business. First 7 days are free — check it out: ${referralLink}`
  );
  return `https://wa.me/?text=${msg}`;
}

// ── BUILD SMS SHARE ──
function buildSMSShare(referralLink) {
  const msg = encodeURIComponent(
    `Hey! Try ReviewPilot — it automatically asks your customers for Google reviews. 7-day free trial: ${referralLink}`
  );
  return `sms:?body=${msg}`;
}

// ── BUILD EMAIL SHARE ──
function buildEmailShare(referralLink) {
  const subject = encodeURIComponent('Get more Google reviews automatically');
  const body = encodeURIComponent(
    `Hey,\n\nI've been using a tool called ReviewPilot that automatically sends review requests to my customers after each visit.\n\nIt's been getting me way more Google reviews without doing anything manually.\n\nFirst 7 days are completely free — no card needed:\n${referralLink}\n\nThought you'd find it useful!`
  );
  return `mailto:?subject=${subject}&body=${body}`;
}

// ── WEEK AGO DATE ──
function weekAgo() {
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
}

// ── VALIDATE EMAIL ──
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── VALIDATE GOOGLE LINK ──
function isValidGoogleLink(url) {
  return url.includes('google') || url.includes('g.page') || url.includes('goo.gl');
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

// ── LOG QR SCAN ──
// Called when a customer scans the QR code
async function logQRScan(userId) {
  const supabase = await getSupabase();
  await supabase.from('qr_scans').insert({
    user_id: userId,
    scanned_at: new Date().toISOString()
  });
}

// ── WEEKLY STATS ──
async function getWeeklyStats(userId) {
  const requests = await loadReviewRequests(userId);
  const total = requests.length;
  const thisWeek = requests.filter(r => new Date(r.created_at) > weekAgo()).length;
  return { total, thisWeek };
}

console.log('%cReviewPilot app.js loaded ✅', 'color:#4ade80;font-weight:bold;');
