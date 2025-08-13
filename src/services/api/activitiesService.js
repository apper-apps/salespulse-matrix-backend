// Initialize ApperClient for database operations
const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

const TABLE_NAME = "activity_c";

export const activitiesService = {
  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "type_c" } },
          { field: { Name: "title_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "due_date_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "related_to_id_c" } },
          { field: { Name: "related_to_type_c" } },
          { field: { Name: "created_at_c" } }
        ],
        orderBy: [{ fieldName: "Id", sorttype: "DESC" }]
      };

      const response = await apperClient.fetchRecords(TABLE_NAME, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data.map(activity => ({
        Id: activity.Id,
        name: activity.Name || '',
        type: activity.type_c || 'task',
        title: activity.title_c || '',
        description: activity.description_c || '',
        dueDate: activity.due_date_c,
        status: activity.status_c || 'pending',
        relatedToId: activity.related_to_id_c,
        relatedToType: activity.related_to_type_c || 'deal',
        createdAt: activity.created_at_c,
        tags: activity.Tags || ''
      }));
    } catch (error) {
      console.error("Error fetching activities:", error.message);
      throw error;
    }
  },

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "type_c" } },
          { field: { Name: "title_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "due_date_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "related_to_id_c" } },
          { field: { Name: "related_to_type_c" } },
          { field: { Name: "created_at_c" } }
        ]
      };

      const response = await apperClient.getRecordById(TABLE_NAME, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      const activity = response.data;
      return {
        Id: activity.Id,
        name: activity.Name || '',
        type: activity.type_c || 'task',
        title: activity.title_c || '',
        description: activity.description_c || '',
        dueDate: activity.due_date_c,
        status: activity.status_c || 'pending',
        relatedToId: activity.related_to_id_c,
        relatedToType: activity.related_to_type_c || 'deal',
        createdAt: activity.created_at_c,
        tags: activity.Tags || ''
      };
    } catch (error) {
      console.error(`Error fetching activity with ID ${id}:`, error.message);
      throw error;
    }
  },

  async create(activityData) {
    try {
      const dbData = {
        Name: activityData.title,
        type_c: activityData.type || 'task',
        title_c: activityData.title,
        description_c: activityData.description || '',
        due_date_c: activityData.dueDate,
        status_c: activityData.status || 'pending',
        related_to_id_c: parseInt(activityData.relatedToId) || null,
        related_to_type_c: activityData.relatedToType || 'deal',
        created_at_c: new Date().toISOString()
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
          console.error(`Failed to create activities ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
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
            type: created.type_c || 'task',
            title: created.title_c || '',
            description: created.description_c || '',
            dueDate: created.due_date_c,
            status: created.status_c || 'pending',
            relatedToId: created.related_to_id_c,
            relatedToType: created.related_to_type_c || 'deal',
            createdAt: created.created_at_c,
            tags: created.Tags || ''
          };
        }
      }
    } catch (error) {
      console.error("Error creating activity:", error.message);
      throw error;
    }
  },

  async update(id, activityData) {
    try {
      const dbData = {
        Name: activityData.title,
        type_c: activityData.type || 'task',
        title_c: activityData.title,
        description_c: activityData.description || '',
        due_date_c: activityData.dueDate,
        status_c: activityData.status || 'pending',
        related_to_id_c: parseInt(activityData.relatedToId) || null,
        related_to_type_c: activityData.relatedToType || 'deal'
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
          console.error(`Failed to update activities ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
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
            type: updated.type_c || 'task',
            title: updated.title_c || '',
            description: updated.description_c || '',
            dueDate: updated.due_date_c,
            status: updated.status_c || 'pending',
            relatedToId: updated.related_to_id_c,
            relatedToType: updated.related_to_type_c || 'deal',
            createdAt: updated.created_at_c,
            tags: updated.Tags || ''
          };
        }
      }
    } catch (error) {
      console.error("Error updating activity:", error.message);
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
          console.error(`Failed to delete activities ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }

        const successfulRecords = response.results.filter(result => result.success);
        return successfulRecords.length > 0;
      }
    } catch (error) {
      console.error("Error deleting activity:", error.message);
      throw error;
    }
  }
};