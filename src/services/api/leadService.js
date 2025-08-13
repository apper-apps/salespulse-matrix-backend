// Initialize ApperClient for database operations
const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

const TABLE_NAME = "lead_c";

export const leadService = {
  async getHotLeads() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "email_c" } },
          { field: { Name: "phone_c" } },
          { field: { Name: "company_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "score_c" } },
          { field: { Name: "source_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "updated_at_c" } }
        ],
        where: [
          {
            FieldName: "score_c",
            Operator: "GreaterThanOrEqualTo",
            Values: ["80"]
          }
        ],
        orderBy: [{ fieldName: "score_c", sorttype: "DESC" }]
      };

      const response = await apperClient.fetchRecords(TABLE_NAME, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data.map(lead => ({
        Id: lead.Id,
        name: lead.Name || '',
        email: lead.email_c || '',
        phone: lead.phone_c || '',
        company: lead.company_c || '',
        status: lead.status_c || '',
        score: lead.score_c || 0,
        source: lead.source_c || '',
        notes: lead.notes_c || '',
        createdAt: lead.created_at_c,
        updatedAt: lead.updated_at_c,
        tags: lead.Tags || ''
      }));
    } catch (error) {
      console.error("Error fetching hot leads:", error.message);
      throw error;
    }
  },

  async getColdLeads() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "email_c" } },
          { field: { Name: "phone_c" } },
          { field: { Name: "company_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "score_c" } },
          { field: { Name: "source_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "updated_at_c" } }
        ],
        where: [
          {
            FieldName: "score_c",
            Operator: "LessThan",
            Values: ["80"]
          }
        ],
        orderBy: [{ fieldName: "score_c", sorttype: "ASC" }]
      };

      const response = await apperClient.fetchRecords(TABLE_NAME, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data.map(lead => ({
        Id: lead.Id,
        name: lead.Name || '',
        email: lead.email_c || '',
        phone: lead.phone_c || '',
        company: lead.company_c || '',
        status: lead.status_c || '',
        score: lead.score_c || 0,
        source: lead.source_c || '',
        notes: lead.notes_c || '',
        createdAt: lead.created_at_c,
        updatedAt: lead.updated_at_c,
        tags: lead.Tags || ''
      }));
    } catch (error) {
      console.error("Error fetching cold leads:", error.message);
      throw error;
    }
  },

  async getHotLeadById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "email_c" } },
          { field: { Name: "phone_c" } },
          { field: { Name: "company_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "score_c" } },
          { field: { Name: "source_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "updated_at_c" } }
        ]
      };

      const response = await apperClient.getRecordById(TABLE_NAME, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      const lead = response.data;
      return {
        Id: lead.Id,
        name: lead.Name || '',
        email: lead.email_c || '',
        phone: lead.phone_c || '',
        company: lead.company_c || '',
        status: lead.status_c || '',
        score: lead.score_c || 0,
        source: lead.source_c || '',
        notes: lead.notes_c || '',
        createdAt: lead.created_at_c,
        updatedAt: lead.updated_at_c,
        tags: lead.Tags || ''
      };
    } catch (error) {
      console.error(`Error fetching hot lead with ID ${id}:`, error.message);
      throw error;
    }
  },

  async createHotLead(leadData) {
    try {
      const dbData = {
        Name: leadData.name,
        email_c: leadData.email,
        phone_c: leadData.phone,
        company_c: leadData.company,
        status_c: leadData.status || 'new',
        score_c: parseInt(leadData.score) || 85,
        source_c: leadData.source,
        notes_c: leadData.notes || '',
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
          console.error(`Failed to create leads ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
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
            email: created.email_c || '',
            phone: created.phone_c || '',
            company: created.company_c || '',
            status: created.status_c || '',
            score: created.score_c || 0,
            source: created.source_c || '',
            notes: created.notes_c || '',
            createdAt: created.created_at_c,
            updatedAt: created.updated_at_c,
            tags: created.Tags || ''
          };
        }
      }
    } catch (error) {
      console.error("Error creating hot lead:", error.message);
      throw error;
    }
  },

  async updateHotLead(id, leadData) {
    try {
      const dbData = {
        Name: leadData.name,
        email_c: leadData.email,
        phone_c: leadData.phone,
        company_c: leadData.company,
        status_c: leadData.status,
        score_c: parseInt(leadData.score),
        source_c: leadData.source,
        notes_c: leadData.notes || '',
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
          console.error(`Failed to update leads ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
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
            email: updated.email_c || '',
            phone: updated.phone_c || '',
            company: updated.company_c || '',
            status: updated.status_c || '',
            score: updated.score_c || 0,
            source: updated.source_c || '',
            notes: updated.notes_c || '',
            createdAt: updated.created_at_c,
            updatedAt: updated.updated_at_c,
            tags: updated.Tags || ''
          };
        }
      }
    } catch (error) {
      console.error("Error updating hot lead:", error.message);
      throw error;
    }
  },

  async deleteHotLead(id) {
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
          console.error(`Failed to delete leads ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }

        const successfulRecords = response.results.filter(result => result.success);
        return successfulRecords.length > 0;
      }
    } catch (error) {
      console.error("Error deleting hot lead:", error.message);
      throw error;
    }
  },

  // Cold lead methods follow the same pattern as hot leads
  async getColdLeadById(id) {
    return await this.getHotLeadById(id);
  },

  async createColdLead(leadData) {
    // Set score to cold lead range (under 80)
    const coldLeadData = {
      ...leadData,
      score: parseInt(leadData.score) || 25
    };
    return await this.createHotLead(coldLeadData);
  },

  async updateColdLead(id, leadData) {
    return await this.updateHotLead(id, leadData);
  },

  async deleteColdLead(id) {
    return await this.deleteHotLead(id);
  }
};