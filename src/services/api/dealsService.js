import React from "react";
import Error from "@/components/ui/Error";
// Initialize ApperClient for database operations
const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

const TABLE_NAME = "deal_c";

export const dealsService = {
  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "title_c" } },
          { field: { Name: "value_c" } },
          { field: { Name: "stage_c" } },
          { field: { Name: "probability_c" } },
          { field: { Name: "expected_close_date_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "updated_at_c" } },
          { field: { Name: "contact_id_c" } },
          { field: { Name: "company_id_c" } }
        ],
        orderBy: [{ fieldName: "Id", sorttype: "DESC" }]
      };

      const response = await apperClient.fetchRecords(TABLE_NAME, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data.map(deal => ({
        Id: deal.Id,
        name: deal.Name || '',
        title: deal.title_c || '',
        value: deal.value_c || 0,
        stage: deal.stage_c || 'lead',
        probability: deal.probability_c || 0,
        expectedCloseDate: deal.expected_close_date_c,
        createdAt: deal.created_at_c,
        updatedAt: deal.updated_at_c,
        contactId: deal.contact_id_c?.Id || deal.contact_id_c,
        companyId: deal.company_id_c?.Id || deal.company_id_c,
        tags: deal.Tags || ''
      }));
    } catch (error) {
      console.error("Error fetching deals:", error.message);
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
          { field: { Name: "value_c" } },
          { field: { Name: "stage_c" } },
          { field: { Name: "probability_c" } },
          { field: { Name: "expected_close_date_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "updated_at_c" } },
          { field: { Name: "contact_id_c" } },
          { field: { Name: "company_id_c" } }
        ]
      };

      const response = await apperClient.getRecordById(TABLE_NAME, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      const deal = response.data;
      return {
        Id: deal.Id,
        name: deal.Name || '',
        title: deal.title_c || '',
        value: deal.value_c || 0,
        stage: deal.stage_c || 'lead',
        probability: deal.probability_c || 0,
        expectedCloseDate: deal.expected_close_date_c,
        createdAt: deal.created_at_c,
        updatedAt: deal.updated_at_c,
        contactId: deal.contact_id_c?.Id || deal.contact_id_c,
        companyId: deal.company_id_c?.Id || deal.company_id_c,
        tags: deal.Tags || ''
      };
    } catch (error) {
      console.error(`Error fetching deal with ID ${id}:`, error.message);
      throw error;
    }
  },

  async create(dealData) {
    try {
      const dbData = {
        Name: dealData.title,
        title_c: dealData.title,
        value_c: parseFloat(dealData.value) || 0,
        stage_c: dealData.stage || 'lead',
        probability_c: dealData.probability || 0,
        expected_close_date_c: dealData.expectedCloseDate,
        created_at_c: new Date().toISOString(),
        updated_at_c: new Date().toISOString()
      };

      if (dealData.contactId && !isNaN(parseInt(dealData.contactId))) {
        dbData.contact_id_c = parseInt(dealData.contactId);
      }

      if (dealData.companyId && !isNaN(parseInt(dealData.companyId))) {
        dbData.company_id_c = parseInt(dealData.companyId);
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
          console.error(`Failed to create deals ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
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
            value: created.value_c || 0,
            stage: created.stage_c || 'lead',
            probability: created.probability_c || 0,
            expectedCloseDate: created.expected_close_date_c,
            createdAt: created.created_at_c,
            updatedAt: created.updated_at_c,
            contactId: created.contact_id_c?.Id || created.contact_id_c,
            companyId: created.company_id_c?.Id || created.company_id_c,
            tags: created.Tags || ''
          };
        }
      }
    } catch (error) {
      console.error("Error creating deal:", error.message);
      throw error;
    }
  },

  async update(id, dealData) {
    try {
      const dbData = {
        Name: dealData.title,
        title_c: dealData.title,
        value_c: parseFloat(dealData.value) || 0,
        stage_c: dealData.stage || 'lead',
        probability_c: dealData.probability || 0,
        expected_close_date_c: dealData.expectedCloseDate,
        updated_at_c: new Date().toISOString()
      };

      if (dealData.contactId && !isNaN(parseInt(dealData.contactId))) {
        dbData.contact_id_c = parseInt(dealData.contactId);
      }

      if (dealData.companyId && !isNaN(parseInt(dealData.companyId))) {
        dbData.company_id_c = parseInt(dealData.companyId);
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
          console.error(`Failed to update deals ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
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
            value: updated.value_c || 0,
            stage: updated.stage_c || 'lead',
            probability: updated.probability_c || 0,
            expectedCloseDate: updated.expected_close_date_c,
            createdAt: updated.created_at_c,
            updatedAt: updated.updated_at_c,
            contactId: updated.contact_id_c?.Id || updated.contact_id_c,
            companyId: updated.company_id_c?.Id || updated.company_id_c,
            tags: updated.Tags || ''
          };
        }
      }
    } catch (error) {
      console.error("Error updating deal:", error.message);
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
          console.error(`Failed to delete deals ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }

        const successfulRecords = response.results.filter(result => result.success);
        return successfulRecords.length > 0;
      }
    } catch (error) {
      console.error("Error deleting deal:", error.message);
      throw error;
    }
  },

  async updateStage(id, stage) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          stage_c: stage,
          updated_at_c: new Date().toISOString()
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
          console.error(`Failed to update deal stage ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
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
            value: updated.value_c || 0,
            stage: updated.stage_c || 'lead',
            probability: updated.probability_c || 0,
            expectedCloseDate: updated.expected_close_date_c,
            createdAt: updated.created_at_c,
            updatedAt: updated.updated_at_c,
            contactId: updated.contact_id_c?.Id || updated.contact_id_c,
            companyId: updated.company_id_c?.Id || updated.company_id_c,
            tags: updated.Tags || ''
          };
        }
      }
    } catch (error) {
      console.error("Error updating deal stage:", error.message);
      throw error;
    }
}
};