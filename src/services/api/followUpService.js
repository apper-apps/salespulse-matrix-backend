import followUpsData from '@/services/mockData/followUps.json';

// In-memory store for follow-ups
let followUps = [...followUpsData];
let nextId = Math.max(...followUps.map(f => f.Id), 0) + 1;

export const followUpService = {
  // Get all follow-ups
  getAll: () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...followUps]), 100);
    });
  },

  // Get follow-up by ID
  getById: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (typeof id !== 'number') {
          reject(new Error('ID must be a number'));
          return;
        }
        
        const followUp = followUps.find(f => f.Id === id);
        if (followUp) {
          resolve({...followUp});
        } else {
          reject(new Error('Follow-up not found'));
        }
      }, 100);
    });
  },

  // Create new follow-up
  create: (followUpData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newFollowUp = {
          ...followUpData,
          Id: nextId++,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        followUps.push(newFollowUp);
        resolve({...newFollowUp});
      }, 100);
    });
  },

  // Update follow-up
  update: (id, followUpData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (typeof id !== 'number') {
          reject(new Error('ID must be a number'));
          return;
        }

        const index = followUps.findIndex(f => f.Id === id);
        if (index === -1) {
          reject(new Error('Follow-up not found'));
          return;
        }

        followUps[index] = {
          ...followUps[index],
          ...followUpData,
          Id: id,
          updatedAt: new Date().toISOString()
        };
        resolve({...followUps[index]});
      }, 100);
    });
  },

  // Delete follow-up
  delete: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (typeof id !== 'number') {
          reject(new Error('ID must be a number'));
          return;
        }

        const index = followUps.findIndex(f => f.Id === id);
        if (index === -1) {
          reject(new Error('Follow-up not found'));
          return;
        }

        const deletedFollowUp = followUps.splice(index, 1)[0];
        resolve({...deletedFollowUp});
      }, 100);
    });
  },

  // Get pending follow-ups
  getPending: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const pending = followUps
          .filter(f => f.status === 'pending')
          .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
        resolve([...pending]);
      }, 100);
    });
  }
};