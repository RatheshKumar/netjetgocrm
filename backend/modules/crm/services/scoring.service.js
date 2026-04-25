// modules/crm/services/scoring.service.js
const pool = require('../../../config/db');

class ScoringService {
  async evaluateLead(leadId) {
    // 1. Fetch Lead
    const [rows] = await pool.query('SELECT * FROM crm_leads WHERE id = ?', [leadId]);
    if (!rows.length) throw new Error('Lead not found');
    const lead = rows[0];

    // 2. Rule Engine calculation
    let score = 10; // Base Score

    // A. Deal Value rules
    const value = Number(lead.value) || 0;
    if (value >= 10000) {
      score += 40;
    } else if (value >= 1000) {
      score += 20;
    }

    // B. Recency rules (within 7 days)
    const updated = new Date(lead.updatedAt);
    const now = new Date();
    const isRecent = (now - updated) / (1000 * 60 * 60 * 24) <= 7;
    if (isRecent) {
      score += 30;
    }

    // C. Contact Density rules
    if (lead.email && lead.email.trim() !== '') score += 10;
    if (lead.phone && lead.phone.trim() !== '') score += 10;

    // D. Cap score at 100
    if (score > 100) score = 100;

    // E. Determine Label
    let status = 'COLD';
    if (score > 75) status = 'HOT';
    else if (score >= 40) status = 'WARM';

    // 3. Update DB
    await pool.query(
      'UPDATE crm_leads SET lead_score = ?, lead_status = ? WHERE id = ?',
      [score, status, leadId]
    );

    // 4. Return enriched lead
    return { ...lead, lead_score: score, lead_status: status };
  }
}

module.exports = new ScoringService();
