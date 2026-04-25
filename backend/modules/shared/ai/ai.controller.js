const OpenAI = require('openai');
const pool = require('../../../config/db');
const { ok, fail } = require('../utils/response');

// Only instantiate OpenAI if key exists to prevent crashing if user forgets
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

class AIController {
  async chat(req, res, next) {
    try {
      if (!openai) {
        return fail(res, 'OpenAI API key not configured. Please add OPENAI_API_KEY to your .env file.', 500);
      }

      const { message, context = {} } = req.body;
      if (!message) return fail(res, 'Message is required', 400);

      let contextDataStr = '';

      // Fetch dynamic context if requested (max 50 records to save tokens/money)
      if (context.leads) {
        const [leads] = await pool.query('SELECT id, name, company, status, value, source FROM crm_leads ORDER BY createdAt DESC LIMIT 50');
        contextDataStr += `\\n--- RECENT LEADS ---\\n${JSON.stringify(leads)}`;
      }
      if (context.employees) {
        const [employees] = await pool.query('SELECT id, name, email, role, department, status FROM hrm_employees ORDER BY createdAt DESC LIMIT 50');
        contextDataStr += `\\n--- EMPLOYEES ---\\n${JSON.stringify(employees)}`;
      }
      if (context.tasks) {
        const [tasks] = await pool.query('SELECT id, title, status, priority, dueDate, assignedTo FROM crm_tasks ORDER BY createdAt DESC LIMIT 50');
        contextDataStr += `\\n--- RECENT TASKS ---\\n${JSON.stringify(tasks)}`;
      }

      const systemPrompt = `You are an intelligent AI assistant built directly into the NetJetGo CRM/HRM system.
Your job is to answer the user's questions based strictly on the business data provided below.
If the data does not contain the answer, state that you do not have enough information in the current context context to answer.
Always respond in concise, clear, and professional markdown.

==== LIVE DATABASE SNAPSHOT ====${contextDataStr}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.2, // Keep it grounded to facts
      });

      const reply = response.choices[0].message.content;
      return ok(res, { reply });

    } catch (err) {
      console.error('OpenAI Error:', err);
      next(err);
    }
  }
}

module.exports = new AIController();
