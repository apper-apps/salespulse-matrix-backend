import remindersData from '@/services/mockData/reminders.json';

// In-memory store for reminders
let reminders = [...remindersData];
let nextId = Math.max(...reminders.map(r => r.Id), 0) + 1;

export const reminderService = {
  // Get all reminders
  getAll: () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...reminders]), 100);
    });
  },

  // Get reminder by ID
  getById: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (typeof id !== 'number') {
          reject(new Error('ID must be a number'));
          return;
        }
        
        const reminder = reminders.find(r => r.Id === id);
        if (reminder) {
          resolve({...reminder});
        } else {
          reject(new Error('Reminder not found'));
        }
      }, 100);
    });
  },

  // Create new reminder
  create: (reminderData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newReminder = {
          ...reminderData,
          Id: nextId++,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        reminders.push(newReminder);
        resolve({...newReminder});
      }, 100);
    });
  },

  // Update reminder
  update: (id, reminderData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (typeof id !== 'number') {
          reject(new Error('ID must be a number'));
          return;
        }

        const index = reminders.findIndex(r => r.Id === id);
        if (index === -1) {
          reject(new Error('Reminder not found'));
          return;
        }

        reminders[index] = {
          ...reminders[index],
          ...reminderData,
          Id: id,
          updatedAt: new Date().toISOString()
        };
        resolve({...reminders[index]});
      }, 100);
    });
  },

  // Delete reminder
  delete: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (typeof id !== 'number') {
          reject(new Error('ID must be a number'));
          return;
        }

        const index = reminders.findIndex(r => r.Id === id);
        if (index === -1) {
          reject(new Error('Reminder not found'));
          return;
        }

        const deletedReminder = reminders.splice(index, 1)[0];
        resolve({...deletedReminder});
      }, 100);
    });
  },

  // Get upcoming reminders
  getUpcoming: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const now = new Date();
        const upcoming = reminders
          .filter(r => new Date(r.dueDate) >= now && r.status === 'pending')
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        resolve([...upcoming]);
      }, 100);
    });
  }
};