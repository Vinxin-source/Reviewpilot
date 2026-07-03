// ============================================
// GetFameMap — Configuration File
// Buyer fills this in — nothing else to touch
// ============================================

window.CONFIG = {

  // ── SUPABASE (database) ──
  SUPABASE_URL: 'YOUR_SUPABASE_URL',
  SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY',

  // ── EMAIL ──
  LOOPS_API_KEY: 'YOUR_LOOPS_API_KEY',
  RESEND_API_KEY: 'YOUR_RESEND_API_KEY',
  EMAIL_FROM: 'reviews@yourdomain.com',
  EMAIL_FROM_NAME: 'Your Business Name',

  // ── STRIPE ──
  STRIPE_PUBLIC_KEY: 'YOUR_STRIPE_PUBLIC_KEY',

  // ── PRICING ──
  MONTHLY_PRICE: 19,
  CURRENCY: 'USD',
  CURRENCY_SYMBOL: '$',
  TRIAL_DAYS: 7,

  // ── BRANDING ──
  APP_NAME: 'GetFameMap',
  APP_URL: 'https://yourdomain.com',
  SUPPORT_EMAIL: 'support@yourdomain.com',
  TAGLINE: 'Automate your Google reviews',

  // ── REFERRAL SYSTEM ──
  REFERRAL_BONUS_DAYS: 15,

  // ── REVIEW REQUEST DELAY ──
  // Hours after entry before email sends
  SEND_DELAY_HOURS: 2,

}