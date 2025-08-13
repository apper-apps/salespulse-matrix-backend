// Initialize ApperClient for database operations
const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

const TABLE_NAME = "company_c";

export const companiesService = {
  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "industry_c" } },
          { field: { Name: "website_c" } },
          { field: { Name: "employee_count_c" } },
          { field: { Name: "created_at_c" } }
        ],
        orderBy: [{ fieldName: "Id", sorttype: "DESC" }]
      };

      const response = await apperClient.fetchRecords(TABLE_NAME, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      // Transform database fields to UI field names
      return response.data.map(company => ({
        Id: company.Id,
        name: company.Name || '',
        industry: company.industry_c || '',
        website: company.website_c || '',
        employeeCount: company.employee_count_c || '',
        createdAt: company.created_at_c,
        tags: company.Tags || ''
      }));
    } catch (error) {
      console.error("Error fetching companies:", error.message);
      throw error;
    }
  },

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "industry_c" } },
          { field: { Name: "website_c" } },
          { field: { Name: "employee_count_c" } },
          { field: { Name: "created_at_c" } }
        ]
      };

      const response = await apperClient.getRecordById(TABLE_NAME, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      const company = response.data;
      return {
        Id: company.Id,
        name: company.Name || '',
        industry: company.industry_c || '',
        website: company.website_c || '',
        employeeCount: company.employee_count_c || '',
        createdAt: company.created_at_c,
        tags: company.Tags || ''
      };
    } catch (error) {
      console.error(`Error fetching company with ID ${id}:`, error.message);
      throw error;
    }
  },

  async create(companyData) {
    try {
      // Transform UI fields to database fields (only Updateable fields)
      const dbData = {
        Name: companyData.name,
        industry_c: companyData.industry,
        website_c: companyData.website,
        employee_count_c: companyData.employeeCount,
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
          console.error(`Failed to create companies ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
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
            industry: created.industry_c || '',
            website: created.website_c || '',
            employeeCount: created.employee_count_c || '',
            createdAt: created.created_at_c,
            tags: created.Tags || ''
          };
        }
      }
    } catch (error) {
      console.error("Error creating company:", error.message);
      throw error;
    }
  },

  async update(id, companyData) {
    try {
      // Transform UI fields to database fields (only Updateable fields)
      const dbData = {
        Name: companyData.name,
        industry_c: companyData.industry,
        website_c: companyData.website,
        employee_count_c: companyData.employeeCount
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
          console.error(`Failed to update companies ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
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
            industry: updated.industry_c || '',
            website: updated.website_c || '',
            employeeCount: updated.employee_count_c || '',
            createdAt: updated.created_at_c,
            tags: updated.Tags || ''
          };
        }
      }
    } catch (error) {
      console.error("Error updating company:", error.message);
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
          console.error(`Failed to delete companies ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }

        const successfulRecords = response.results.filter(result => result.success);
        return successfulRecords.length > 0;
      }
    } catch (error) {
      console.error("Error deleting company:", error.message);
      throw error;
    }
  }
};