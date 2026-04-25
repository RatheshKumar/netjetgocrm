const OpenAI = require('openai');
const pool = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');
const { ok, fail } = require('../utils/response');

let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

class HRAIController {
  async chat(req, res, next) {
    try {
      if (!openai) return fail(res, 'OpenAI API key not configured.', 500);

      const { message } = req.body;
      const employeeId = req.user.id; // From auth middleware

      // 1. Fetch Personal Context
      const [empRows] = await pool.query('SELECT * FROM hrm_employees WHERE id = ?', [employeeId]);
      const [leaveRows] = await pool.query('SELECT * FROM hrm_leaves WHERE employeeId = ?', [employeeId]);
      
      const employee = empRows[0];
      if (!employee) return fail(res, 'Employee profile not found.', 404);

      const systemPrompt = `You are a professional HR assistant for the NetJetGo Business OS. 
Your goal is to assist the employee with their profile and leave management.

--- LOGGED IN EMPLOYEE DATA ---
${JSON.stringify({ 
    profile: {
        name: employee.name,
        role: employee.role,
        department: employee.department,
        salary: employee.salary,
        joinDate: employee.joinDate,
        status: employee.status
    },
    leaveHistory: leaveRows 
})}

--- GUIDELINES ---
1. You can answer questions about their profile or leave balance.
2. If the user wants to apply for leave, use the "apply_leave" tool. 
3. Always check the data provided for accuracy.
`;

      const tools = [
        {
          type: "function",
          function: {
            name: "apply_leave",
            description: "Apply for a leave on behalf of the employee",
            parameters: {
              type: "object",
              properties: {
                leaveType: { type: "string", enum: ["Sick", "Vacation", "Personal", "Other"] },
                startDate: { type: "string", description: "YYYY-MM-DD" },
                endDate: { type: "string", description: "YYYY-MM-DD" },
                reason: { type: "string" }
              },
              required: ["leaveType", "startDate", "endDate"]
            }
          }
        }
      ];

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        tools: tools,
        tool_choice: "auto"
      });

      const choice = response.choices[0];
      
      if (choice.message.tool_calls) {
        const toolCall = choice.message.tool_calls[0];
        const args = JSON.parse(toolCall.function.arguments);

        // Execute Leave Application
        const leaveId = uuidv4();
        // Calculate days (simple diff)
        const start = new Date(args.startDate);
        const end = new Date(args.endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        await pool.query(
          `INSERT INTO hrm_leaves (id, employeeId, employeeName, leaveType, startDate, endDate, days, reason, status) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [leaveId, employeeId, employee.name, args.leaveType, args.startDate, args.endDate, diffDays, args.reason || '', 'Pending']
        );

        // Inform AI about success to get a user-friendly response
        const secondResponse = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message },
            choice.message,
            {
              tool_call_id: toolCall.id,
              role: "tool",
              name: "apply_leave",
              content: JSON.stringify({ success: true, message: `Leave applied successfully for ${diffDays} days.` })
            }
          ]
        });

        return ok(res, { reply: secondResponse.choices[0].message.content });
      }

      return ok(res, { reply: choice.message.content });

    } catch (err) {
      console.error('HR AI Error:', err);
      next(err);
    }
  }
}

module.exports = new HRAIController();
