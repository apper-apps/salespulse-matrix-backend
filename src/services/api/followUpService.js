import React from "react";
import Error from "@/components/ui/Error";
// Initialize ApperClient for database operations
const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

const TABLE_NAME = "follow_up_c";

export const followUpService = {
  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "title_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "scheduled_date_c" } },
          { field: { Name: "contact_name_c" } },
          { field: { Name: "deal_id_c" } },
          { field: { Name: "priority_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "method_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "updated_at_c" } },
          { field: { Name: "contact_id_c" } }
        ],
        orderBy: [{ fieldName: "scheduled_date_c", sorttype: "ASC" }]
      };

      const response = await apperClient.fetchRecords(TABLE_NAME, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data.map(followUp => ({
        Id: followUp.Id,
        name: followUp.Name || '',
        title: followUp.title_c || '',
        description: followUp.description_c || '',
        scheduledDate: followUp.scheduled_date_c,
        contactName: followUp.contact_name_c || '',
        dealId: followUp.deal_id_c,
        priority: followUp.priority_c || 'medium',
        status: followUp.status_c || 'pending',
        method: followUp.method_c || 'call',
        notes: followUp.notes_c || '',
        createdAt: followUp.created_at_c,
        updatedAt: followUp.updated_at_c,
        contactId: followUp.contact_id_c?.Id || followUp.contact_id_c,
        tags: followUp.Tags || ''
      }));
    } catch (error) {
      console.error("Error fetching follow-ups:", error.message);
      throw error;
    }
  },

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "title_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "scheduled_date_c" } },
          { field: { Name: "contact_name_c" } },
          { field: { Name: "deal_id_c" } },
          { field: { Name: "priority_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "method_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "updated_at_c" } },
          { field: { Name: "contact_id_c" } }
        ]
      };

      const response = await apperClient.getRecordById(TABLE_NAME, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      const followUp = response.data;
      return {
        Id: followUp.Id,
        name: followUp.Name || '',
        title: followUp.title_c || '',
        description: followUp.description_c || '',
        scheduledDate: followUp.scheduled_date_c,
        contactName: followUp.contact_name_c || '',
        dealId: followUp.deal_id_c,
        priority: followUp.priority_c || 'medium',
        status: followUp.status_c || 'pending',
        method: followUp.method_c || 'call',
        notes: followUp.notes_c || '',
        createdAt: followUp.created_at_c,
        updatedAt: followUp.updated_at_c,
        contactId: followUp.contact_id_c?.Id || followUp.contact_id_c,
        tags: followUp.Tags || ''
      };
    } catch (error) {
      console.error(`Error fetching follow-up with ID ${id}:`, error.message);
      throw error;
    }
  },

  async create(followUpData) {
    try {
      const dbData = {
        Name: followUpData.title,
        title_c: followUpData.title,
        description_c: followUpData.description || '',
        scheduled_date_c: followUpData.scheduledDate,
        contact_name_c: followUpData.contactName || '',
        deal_id_c: parseInt(followUpData.dealId) || null,
        priority_c: followUpData.priority || 'medium',
        status_c: followUpData.status || 'pending',
        method_c: followUpData.method || 'call',
        notes_c: followUpData.notes || '',
        created_at_c: new Date().toISOString(),
        updated_at_c: new Date().toISOString()
      };

      if (followUpData.contactId && !isNaN(parseInt(followUpData.contactId))) {
        dbData.contact_id_c = parseInt(followUpData.contactId);
      }

      const params = {
        records: [dbData]
      };

      const response = await apperClient.createRecord(TABLE_NAME, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create follow-ups ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }

        const successfulRecords = response.results.filter(result => result.success);
        if (successfulRecords.length > 0) {
          const created = successfulRecords[0].data;
          return {
            Id: created.Id,
            name: created.Name || '',
            title: created.title_c || '',
            description: created.description_c || '',
            scheduledDate: created.scheduled_date_c,
            contactName: created.contact_name_c || '',
            dealId: created.deal_id_c,
            priority: created.priority_c || 'medium',
            status: created.status_c || 'pending',
            method: created.method_c || 'call',
            notes: created.notes_c || '',
            createdAt: created.created_at_c,
            updatedAt: created.updated_at_c,
            contactId: created.contact_id_c?.Id || created.contact_id_c,
            tags: created.Tags || ''
          };
        }
      }
    } catch (error) {
      console.error("Error creating follow-up:", error.message);
      throw error;
    }
  },

  async update(id, followUpData) {
    try {
      const dbData = {
        Name: followUpData.title,
        title_c: followUpData.title,
        description_c: followUpData.description || '',
        scheduled_date_c: followUpData.scheduledDate,
        contact_name_c: followUpData.contactName || '',
        deal_id_c: parseInt(followUpData.dealId) || null,
        priority_c: followUpData.priority || 'medium',
        status_c: followUpData.status || 'pending',
        method_c: followUpData.method || 'call',
        notes_c: followUpData.notes || '',
        updated_at_c: new Date().toISOString()
      };

      if (followUpData.contactId && !isNaN(parseInt(followUpData.contactId))) {
        dbData.contact_id_c = parseInt(followUpData.contactId);
      }

      const params = {
        records: [{
          Id: parseInt(id),
          ...dbData
        }]
      };

      const response = await apperClient.updateRecord(TABLE_NAME, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to update follow-ups ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }

        const successfulRecords = response.results.filter(result => result.success);
        if (successfulRecords.length > 0) {
          const updated = successfulRecords[0].data;
          return {
            Id: updated.Id,
            name: updated.Name || '',
            title: updated.title_c || '',
            description: updated.description_c || '',
            scheduledDate: updated.scheduled_date_c,
            contactName: updated.contact_name_c || '',
            dealId: updated.deal_id_c,
            priority: updated.priority_c || 'medium',
            status: updated.status_c || 'pending',
            method: updated.method_c || 'call',
            notes: updated.notes_c || '',
            createdAt: updated.created_at_c,
            updatedAt: updated.updated_at_c,
            contactId: updated.contact_id_c?.Id || updated.contact_id_c,
            tags: updated.Tags || ''
          };
        }
      }
    } catch (error) {
      console.error("Error updating follow-up:", error.message);
      throw error;
    }
  },

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord(TABLE_NAME, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to delete follow-ups ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }

        const successfulRecords = response.results.filter(result => result.success);
        return successfulRecords.length > 0;
      }
    } catch (error) {
      console.error("Error deleting follow-up:", error.message);
      throw error;
    }
  },

  async getPending() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "title_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "scheduled_date_c" } },
          { field: { Name: "contact_name_c" } },
          { field: { Name: "deal_id_c" } },
          { field: { Name: "priority_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "method_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "updated_at_c" } },
          { field: { Name: "contact_id_c" } }
        ],
        where: [
          {
            FieldName: "status_c",
            Operator: "EqualTo",
            Values: ["pending"]
          }
        ],
        orderBy: [{ fieldName: "scheduled_date_c", sorttype: "ASC" }]
      };

      const response = await apperClient.fetchRecords(TABLE_NAME, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data.map(followUp => ({
        Id: followUp.Id,
        name: followUp.Name || '',
        title: followUp.title_c || '',
        description: followUp.description_c || '',
        scheduledDate: followUp.scheduled_date_c,
        contactName: followUp.contact_name_c || '',
        dealId: followUp.deal_id_c,
        priority: followUp.priority_c || 'medium',
        status: followUp.status_c || 'pending',
        method: followUp.method_c || 'call',
        notes: followUp.notes_c || '',
        createdAt: followUp.created_at_c,
        updatedAt: followUp.updated_at_c,
        contactId: followUp.contact_id_c?.Id || followUp.contact_id_c,
        tags: followUp.Tags || ''
      }));
    } catch (error) {
      console.error("Error fetching pending follow-ups:", error.message);
      throw error;
}
  }
};