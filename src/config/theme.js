// =============================================================================
// src/config/theme.js
// =============================================================================
// 🎨 BRAND & DESIGN TOKENS — Edit this file to change colors, fonts, spacing.
// Every color used in the app comes from here. Do NOT hardcode colors elsewhere.
// =============================================================================

const theme = {
  // ── Brand Colors (from NetJetGo logo) ──────────────────────────────────────
  brand: {
    indigo:     '#3D3BAF',   // Main brand color — used for sidebar, buttons
    indigoMid:  '#5552C8',   // Slightly lighter indigo — button hover states
    indigoLight:'rgba(61,59,175,0.08)', // Very light indigo — backgrounds
    indigoGlow: 'rgba(61,59,175,0.15)', // Indigo glow — shadows, borders
    pink:       '#E8197A',   // Accent pink — from logo
    orange:     '#F5A623',   // Accent orange — from logo
  },

  // ── Surface Colors ──────────────────────────────────────────────────────────
  surface: {
    page:       '#F4F5FB',   // Page background
    card:       '#FFFFFF',   // Cards, tables, modals
    cardHover:  '#F8F9FE',   // Card hover state
    sidebar:    '#3D3BAF',   // Main brand color for sidebar
    sidebarAlpha: 'rgba(255,255,255,0.1)',
  },

  // ── Border Colors ───────────────────────────────────────────────────────────
  border: {
    light:  '#E5E7F0',
    medium: '#D1D5E8',
  },

  // ── Text Colors ─────────────────────────────────────────────────────────────
  text: {
    primary:    '#1A1C2E',   // Main text
    muted:      '#6B7280',   // Secondary / placeholder text
    subtle:     '#9CA3AF',   // Very light text
    onBrand:    '#FFFFFF',   // Text on dark sidebar
    onBrandMuted: 'rgba(255,255,255,0.60)', // Dimmed text on sidebar
  },

  // ── Status / Semantic Colors ────────────────────────────────────────────────
  status: {
    success:  '#10B981',
    warning:  '#F59E0B',
    danger:   '#EF4444',
    info:     '#3B82F6',
  },

  // ── Badge Color Map ─────────────────────────────────────────────────────────
  // Used by the <Badge> component. Add new statuses here as needed.
  badges: {
    // Lead statuses
    Won:          { bg: 'rgba(16,185,129,0.10)',  text: '#059669' },
    Lost:         { bg: 'rgba(239,68,68,0.10)',   text: '#DC2626' },
    Pending:      { bg: 'rgba(59,130,246,0.10)',  text: '#2563EB' },
    'In Progress':{ bg: 'rgba(245,158,11,0.10)',  text: '#D97706' },
    Closed:       { bg: 'rgba(107,114,128,0.10)', text: '#6B7280' },
    // Contract / invoice statuses
    Active:       { bg: 'rgba(16,185,129,0.10)',  text: '#059669' },
    Expired:      { bg: 'rgba(239,68,68,0.10)',   text: '#DC2626' },
    Draft:        { bg: 'rgba(107,114,128,0.10)', text: '#6B7280' },
    'Under Review':{ bg:'rgba(245,158,11,0.10)',  text: '#D97706' },
    Paid:         { bg: 'rgba(16,185,129,0.10)',  text: '#059669' },
    Unpaid:       { bg: 'rgba(239,68,68,0.10)',   text: '#DC2626' },
    Partial:      { bg: 'rgba(245,158,11,0.10)',  text: '#D97706' },
    Overdue:      { bg: 'rgba(239,68,68,0.10)',   text: '#DC2626' },
    // Task statuses
    Todo:         { bg: 'rgba(107,114,128,0.10)', text: '#6B7280' },
    Completed:    { bg: 'rgba(16,185,129,0.10)',  text: '#059669' },
    Blocked:      { bg: 'rgba(239,68,68,0.10)',   text: '#DC2626' },
    // Priority
    High:         { bg: 'rgba(239,68,68,0.10)',   text: '#DC2626' },
    Medium:       { bg: 'rgba(245,158,11,0.10)',  text: '#D97706' },
    Low:          { bg: 'rgba(16,185,129,0.10)',  text: '#059669' },
    // Pipeline stages
    Prospecting:  { bg: 'rgba(107,114,128,0.10)', text: '#6B7280' },
    Qualification:{ bg: 'rgba(59,130,246,0.10)',  text: '#2563EB' },
    Proposal:     { bg: 'rgba(99,102,241,0.10)',  text: '#4F46E5' },
    Negotiation:  { bg: 'rgba(245,158,11,0.10)',  text: '#D97706' },
    'Closed Won': { bg: 'rgba(16,185,129,0.10)',  text: '#059669' },
    'Closed Lost':{ bg: 'rgba(239,68,68,0.10)',   text: '#DC2626' },
    // Payment methods
    Cash:               { bg: 'rgba(16,185,129,0.10)', text: '#059669' },
    'Credit Card':      { bg: 'rgba(59,130,246,0.10)', text: '#2563EB' },
    'Bank Transfer':    { bg: 'rgba(99,102,241,0.10)', text: '#4F46E5' },
    'Online Payment':   { bg: 'rgba(99,102,241,0.10)', text: '#4F46E5' },
    // Industries
    Technology:   { bg: 'rgba(59,130,246,0.10)',  text: '#2563EB' },
    Marketing:    { bg: 'rgba(232,25,122,0.10)',  text: '#BE185D' },
    Finance:      { bg: 'rgba(16,185,129,0.10)',  text: '#059669' },
    // Pipeline / contract status
    Cancelled:    { bg: 'rgba(239,68,68,0.10)',   text: '#DC2626' },
    Paused:       { bg: 'rgba(245,158,11,0.10)',  text: '#D97706' },
  },

  // ── Typography ──────────────────────────────────────────────────────────────
  fonts: {
    // Google Fonts import — change here to swap fonts site-wide
    import: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap",
    body:    "'Plus Jakarta Sans', -apple-system, sans-serif",
    mono:    "'JetBrains Mono', 'Courier New', monospace",
  },

  // ── Spacing / Radius ────────────────────────────────────────────────────────
  radius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '14px',
  },
};

export default theme;
