// modules/crm/services/ticket.service.js
const ticketRepo = require('../repositories/ticket.repository');
const hrmService = require('../../hrm/services/employee.service');
const { v4: uuid } = require('uuid');

class TicketService {
  async listTickets() {
    return await ticketRepo.getAll();
  }

  async createTicket(data) {
    const id = uuid();
    await ticketRepo.create({ id, ...data });
    return { id, ...data };
  }

  async escalateTickets() {
    console.log('⏳ Running SLA Escalation check...');
    const expiredTickets = await ticketRepo.getExpiredSLA(24); // 24h threshold for demo
    
    for (const ticket of expiredTickets) {
      if (ticket.priority === 'Urgent' || ticket.priority === 'High') {
        // Find a manager from HRM to escalate to
        const managers = await hrmService.getManagers();
        if (managers.length > 0) {
          const manager = managers[0]; // Simple assignment to first manager found
          await ticketRepo.update(ticket.id, { 
            assignedTo: manager.id,
            description: ticket.description + `\n[ESCALATED to ${manager.name} due to SLA breach]`
          });
          console.log(`🚀 Escalated Ticket #${ticket.id} to Manager ${manager.name}`);
        }
      }
    }
  }

  async updateStatus(id, status) {
    await ticketRepo.update(id, { status });
  }
}

module.exports = new TicketService();
