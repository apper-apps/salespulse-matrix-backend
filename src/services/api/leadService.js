import hotLeadsData from '@/services/mockData/hotLeads.json';
import coldLeadsData from '@/services/mockData/coldLeads.json';

let hotLeads = [...hotLeadsData];
let coldLeads = [...coldLeadsData];

// Hot Leads Service
export const leadService = {
  // Hot Leads
  getHotLeads: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...hotLeads]);
      }, 300);
    });
  },

  getHotLeadById: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const lead = hotLeads.find(l => l.Id === parseInt(id));
        if (lead) {
          resolve({ ...lead });
        } else {
          reject(new Error('Hot lead not found'));
        }
      }, 200);
    });
  },

  createHotLead: (leadData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newLead = {
          ...leadData,
          Id: Math.max(...hotLeads.map(l => l.Id), 0) + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        hotLeads.unshift(newLead);
        resolve({ ...newLead });
      }, 400);
    });
  },

  updateHotLead: (id, leadData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = hotLeads.findIndex(l => l.Id === parseInt(id));
        if (index !== -1) {
          const updatedLead = {
            ...hotLeads[index],
            ...leadData,
            Id: parseInt(id),
            updatedAt: new Date().toISOString()
          };
          hotLeads[index] = updatedLead;
          resolve({ ...updatedLead });
        } else {
          reject(new Error('Hot lead not found'));
        }
      }, 400);
    });
  },

  deleteHotLead: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = hotLeads.findIndex(l => l.Id === parseInt(id));
        if (index !== -1) {
          hotLeads.splice(index, 1);
          resolve();
        } else {
          reject(new Error('Hot lead not found'));
        }
      }, 300);
    });
  },

  // Cold Leads
  getColdLeads: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...coldLeads]);
      }, 300);
    });
  },

  getColdLeadById: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const lead = coldLeads.find(l => l.Id === parseInt(id));
        if (lead) {
          resolve({ ...lead });
        } else {
          reject(new Error('Cold lead not found'));
        }
      }, 200);
    });
  },

  createColdLead: (leadData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newLead = {
          ...leadData,
          Id: Math.max(...coldLeads.map(l => l.Id), 0) + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        coldLeads.unshift(newLead);
        resolve({ ...newLead });
      }, 400);
    });
  },

  updateColdLead: (id, leadData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = coldLeads.findIndex(l => l.Id === parseInt(id));
        if (index !== -1) {
          const updatedLead = {
            ...coldLeads[index],
            ...leadData,
            Id: parseInt(id),
            updatedAt: new Date().toISOString()
          };
          coldLeads[index] = updatedLead;
          resolve({ ...updatedLead });
        } else {
          reject(new Error('Cold lead not found'));
        }
      }, 400);
    });
  },

  deleteColdLead: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = coldLeads.findIndex(l => l.Id === parseInt(id));
        if (index !== -1) {
          coldLeads.splice(index, 1);
          resolve();
        } else {
          reject(new Error('Cold lead not found'));
        }
      }, 300);
    });
  }
};