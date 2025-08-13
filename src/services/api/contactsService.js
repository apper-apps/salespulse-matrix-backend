// Initialize ApperClient for database operations
const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

const TABLE_NAME = "contact_c";

export const contactsService = {
  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "first_name_c" } },
          { field: { Name: "last_name_c" } },
          { field: { Name: "email_c" } },
          { field: { Name: "phone_c" } },
          { field: { Name: "linkedin_profile_c" } },
          { field: { Name: "position_c" } },
          { field: { Name: "lead_type_c" } },
          { field: { Name: "score_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "updated_at_c" } },
          { field: { Name: "company_id_c" } }
        ],
        orderBy: [{ fieldName: "Id", sorttype: "DESC" }]
      };

      const response = await apperClient.fetchRecords(TABLE_NAME, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      // Transform database fields to UI field names
      return response.data.map(contact => ({
        Id: contact.Id,
        name: contact.Name || '',
        firstName: contact.first_name_c || '',
        lastName: contact.last_name_c || '',
        email: contact.email_c || '',
        phone: contact.phone_c || '',
        linkedinProfile: contact.linkedin_profile_c || '',
        companyId: contact.company_id_c?.Id || contact.company_id_c,
        position: contact.position_c || '',
        leadType: contact.lead_type_c || 'contact',
        score: contact.score_c || 50,
        createdAt: contact.created_at_c,
        updatedAt: contact.updated_at_c,
        tags: contact.Tags || ''
      }));
    } catch (error) {
      console.error("Error fetching contacts:", error.message);
      throw error;
    }
  },

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "first_name_c" } },
          { field: { Name: "last_name_c" } },
          { field: { Name: "email_c" } },
          { field: { Name: "phone_c" } },
          { field: { Name: "linkedin_profile_c" } },
          { field: { Name: "position_c" } },
          { field: { Name: "lead_type_c" } },
          { field: { Name: "score_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "updated_at_c" } },
          { field: { Name: "company_id_c" } }
        ]
      };

      const response = await apperClient.getRecordById(TABLE_NAME, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      const contact = response.data;
      return {
        Id: contact.Id,
        name: contact.Name || '',
        firstName: contact.first_name_c || '',
        lastName: contact.last_name_c || '',
        email: contact.email_c || '',
        phone: contact.phone_c || '',
        linkedinProfile: contact.linkedin_profile_c || '',
        companyId: contact.company_id_c?.Id || contact.company_id_c,
        position: contact.position_c || '',
        leadType: contact.lead_type_c || 'contact',
        score: contact.score_c || 50,
        createdAt: contact.created_at_c,
        updatedAt: contact.updated_at_c,
        tags: contact.Tags || ''
      };
    } catch (error) {
      console.error(`Error fetching contact with ID ${id}:`, error.message);
      throw error;
    }
  },

  async create(contactData) {
    try {
      // Transform UI fields to database fields (only Updateable fields)
      const dbData = {
        Name: `${contactData.firstName} ${contactData.lastName}`.trim(),
        first_name_c: contactData.firstName,
        last_name_c: contactData.lastName,
        email_c: contactData.email,
        phone_c: contactData.phone,
        linkedin_profile_c: contactData.linkedinProfile || '',
        position_c: contactData.position,
        lead_type_c: contactData.leadType || 'contact',
        score_c: parseInt(contactData.score) || 50,
        created_at_c: new Date().toISOString(),
        updated_at_c: new Date().toISOString()
      };

      if (contactData.companyId && !isNaN(parseInt(contactData.companyId))) {
        dbData.company_id_c = parseInt(contactData.companyId);
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
          console.error(`Failed to create contacts ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
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
            firstName: created.first_name_c || '',
            lastName: created.last_name_c || '',
            email: created.email_c || '',
            phone: created.phone_c || '',
            linkedinProfile: created.linkedin_profile_c || '',
            companyId: created.company_id_c?.Id || created.company_id_c,
            position: created.position_c || '',
            leadType: created.lead_type_c || 'contact',
            score: created.score_c || 50,
            createdAt: created.created_at_c,
            updatedAt: created.updated_at_c,
            tags: created.Tags || ''
          };
        }
      }
    } catch (error) {
      console.error("Error creating contact:", error.message);
      throw error;
    }
  },

  async update(id, contactData) {
    try {
      // Transform UI fields to database fields (only Updateable fields)
      const dbData = {
        Name: `${contactData.firstName} ${contactData.lastName}`.trim(),
        first_name_c: contactData.firstName,
        last_name_c: contactData.lastName,
        email_c: contactData.email,
        phone_c: contactData.phone,
        linkedin_profile_c: contactData.linkedinProfile || '',
        position_c: contactData.position,
        lead_type_c: contactData.leadType || 'contact',
        score_c: parseInt(contactData.score) || 50,
        updated_at_c: new Date().toISOString()
      };

      if (contactData.companyId && !isNaN(parseInt(contactData.companyId))) {
        dbData.company_id_c = parseInt(contactData.companyId);
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
          console.error(`Failed to update contacts ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
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
            firstName: updated.first_name_c || '',
            lastName: updated.last_name_c || '',
            email: updated.email_c || '',
            phone: updated.phone_c || '',
            linkedinProfile: updated.linkedin_profile_c || '',
            companyId: updated.company_id_c?.Id || updated.company_id_c,
            position: updated.position_c || '',
            leadType: updated.lead_type_c || 'contact',
            score: updated.score_c || 50,
            createdAt: updated.created_at_c,
            updatedAt: updated.updated_at_c,
            tags: updated.Tags || ''
          };
        }
      }
    } catch (error) {
      console.error("Error updating contact:", error.message);
      throw error;
    }
  },

async delete(idOrIds) {
    try {
      const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
      const params = {
        RecordIds: ids.map(id => parseInt(id))
      };

      const response = await apperClient.deleteRecord(TABLE_NAME, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to delete contacts ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }

        const successfulRecords = response.results.filter(result => result.success);
        return successfulRecords.length > 0;
      }
    } catch (error) {
      console.error("Error deleting contact(s):", error.message);
      throw error;
    }
  }
};