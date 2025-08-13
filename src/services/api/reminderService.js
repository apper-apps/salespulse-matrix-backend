// Initialize ApperClient for database operations
const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

const TABLE_NAME = "reminder_c";

export const reminderService = {
  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "title_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "due_date_c" } },
          { field: { Name: "priority_c" } },
          { field: { Name: "contact_name_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "updated_at_c" } }
        ],
        orderBy: [{ fieldName: "due_date_c", sorttype: "ASC" }]
      };

      const response = await apperClient.fetchRecords(TABLE_NAME, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data.map(reminder => ({
        Id: reminder.Id,
        name: reminder.Name || '',
        title: reminder.title_c || '',
        description: reminder.description_c || '',
        dueDate: reminder.due_date_c,
        priority: reminder.priority_c || 'medium',
        contactName: reminder.contact_name_c || '',
        type: reminder.type_c || 'task',
        status: reminder.status_c || 'pending',
        createdAt: reminder.created_at_c,
        updatedAt: reminder.updated_at_c,
        tags: reminder.Tags || ''
      }));
    } catch (error) {
      console.error("Error fetching reminders:", error.message);
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
          { field: { Name: "due_date_c" } },
          { field: { Name: "priority_c" } },
          { field: { Name: "contact_name_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "updated_at_c" } }
        ]
      };

      const response = await apperClient.getRecordById(TABLE_NAME, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      const reminder = response.data;
      return {
        Id: reminder.Id,
        name: reminder.Name || '',
        title: reminder.title_c || '',
        description: reminder.description_c || '',
        dueDate: reminder.due_date_c,
        priority: reminder.priority_c || 'medium',
        contactName: reminder.contact_name_c || '',
        type: reminder.type_c || 'task',
        status: reminder.status_c || 'pending',
        createdAt: reminder.created_at_c,
        updatedAt: reminder.updated_at_c,
        tags: reminder.Tags || ''
      };
    } catch (error) {
      console.error(`Error fetching reminder with ID ${id}:`, error.message);
      throw error;
    }
  },

  async create(reminderData) {
    try {
      const dbData = {
        Name: reminderData.title,
        title_c: reminderData.title,
        description_c: reminderData.description || '',
        due_date_c: reminderData.dueDate,
        priority_c: reminderData.priority || 'medium',
        contact_name_c: reminderData.contactName || '',
        type_c: reminderData.type || 'task',
        status_c: reminderData.status || 'pending',
        created_at_c: new Date().toISOString(),
        updated_at_c: new Date().toISOString()
      };

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
          console.error(`Failed to create reminders ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
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
            dueDate: created.due_date_c,
            priority: created.priority_c || 'medium',
            contactName: created.contact_name_c || '',
            type: created.type_c || 'task',
            status: created.status_c || 'pending',
            createdAt: created.created_at_c,
            updatedAt: created.updated_at_c,
            tags: created.Tags || ''
          };
        }
      }
    } catch (error) {
      console.error("Error creating reminder:", error.message);
      throw error;
    }
  },

  async update(id, reminderData) {
    try {
      const dbData = {
        Name: reminderData.title,
        title_c: reminderData.title,
        description_c: reminderData.description || '',
        due_date_c: reminderData.dueDate,
        priority_c: reminderData.priority || 'medium',
        contact_name_c: reminderData.contactName || '',
        type_c: reminderData.type || 'task',
        status_c: reminderData.status || 'pending',
        updated_at_c: new Date().toISOString()
      };

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
          console.error(`Failed to update reminders ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
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
            dueDate: updated.due_date_c,
            priority: updated.priority_c || 'medium',
            contactName: updated.contact_name_c || '',
            type: updated.type_c || 'task',
            status: updated.status_c || 'pending',
            createdAt: updated.created_at_c,
            updatedAt: updated.updated_at_c,
            tags: updated.Tags || ''
          };
        }
      }
    } catch (error) {
      console.error("Error updating reminder:", error.message);
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
          console.error(`Failed to delete reminders ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }

        const successfulRecords = response.results.filter(result => result.success);
        return successfulRecords.length > 0;
      }
    } catch (error) {
      console.error("Error deleting reminder:", error.message);
      throw error;
    }
  },

  async getUpcoming() {
    try {
      const now = new Date().toISOString();
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "title_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "due_date_c" } },
          { field: { Name: "priority_c" } },
          { field: { Name: "contact_name_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "updated_at_c" } }
        ],
        where: [
          {
            FieldName: "due_date_c",
            Operator: "GreaterThanOrEqualTo",
            Values: [now]
          },
          {
            FieldName: "status_c",
            Operator: "EqualTo",
            Values: ["pending"]
          }
        ],
        orderBy: [{ fieldName: "due_date_c", sorttype: "ASC" }]
      };

      const response = await apperClient.fetchRecords(TABLE_NAME, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data.map(reminder => ({
        Id: reminder.Id,
        name: reminder.Name || '',
        title: reminder.title_c || '',
        description: reminder.description_c || '',
        dueDate: reminder.due_date_c,
        priority: reminder.priority_c || 'medium',
        contactName: reminder.contact_name_c || '',
        type: reminder.type_c || 'task',
        status: reminder.status_c || 'pending',
        createdAt: reminder.created_at_c,
        updatedAt: reminder.updated_at_c,
        tags: reminder.Tags || ''
      }));
    } catch (error) {
      console.error("Error fetching upcoming reminders:", error.message);
      throw error;
    }
  }
};