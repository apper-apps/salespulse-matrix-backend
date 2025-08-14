import { useState, useEffect } from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import SearchBar from "@/components/molecules/SearchBar";
import ActionButtons from "@/components/molecules/ActionButtons";
import DataTable from "@/components/organisms/DataTable";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { companiesService } from "@/services/api/companiesService";
import { contactsService } from "@/services/api/contactsService";
import { toast } from "react-toastify";
import { format } from "date-fns";

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
const [showAddModal, setShowAddModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);

  const handleEditRecord = (company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name || '',
      industry: company.industry || '',
      website: company.website || '',
      employeeCount: company.employeeCount || ''
    });
    setShowAddModal(true);
  };
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    website: "",
    employeeCount: ""
  });

  const loadCompanies = async () => {
    try {
      setLoading(true);
      setError("");
      const [companiesData, contactsData] = await Promise.all([
        companiesService.getAll(),
        contactsService.getAll()
      ]);
      setCompanies(companiesData);
      setContacts(contactsData);
    } catch (err) {
      setError(err.message || "Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCompany) {
        await companiesService.update(editingCompany.Id, formData);
        toast.success("Company updated successfully!");
      } else {
        await companiesService.create(formData);
        toast.success("Company created successfully!");
      }
setShowAddModal(false);
      setEditingCompany(null);
      setFormData({
        name: "",
        industry: "",
        website: "",
        employeeCount: ""
      });
      loadCompanies();
    } catch (err) {
      toast.error(err.message || "Failed to save company");
    }
  };

  const handleEdit = (company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      industry: company.industry,
      website: company.website,
      employeeCount: company.employeeCount
    });
setEditingCompany(null);
    setShowAddModal(true);
  };

  const handleDelete = async (company) => {
    if (window.confirm(`Are you sure you want to delete ${company.name}?`)) {
      try {
        await companiesService.delete(company.Id);
        toast.success("Company deleted successfully!");
        loadCompanies();
      } catch (err) {
        toast.error(err.message || "Failed to delete company");
      }
    }
  };

  const getContactCount = (companyId) => {
    return contacts.filter(c => c.companyId === companyId).length;
  };

  const columns = [
    {
      key: "name",
      title: "Company",
      sortable: true,
render: (_, company) => (
        <div 
          className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 -m-2 p-2 rounded-lg transition-colors"
          onClick={() => handleEditRecord(company)}
        >
          <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
            <ApperIcon name="Building2" className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{company.name}</p>
            <p className="text-sm text-gray-500">{company.industry}</p>
          </div>
        </div>
      )
    },
    {
      key: "website",
      title: "Website",
      sortable: true,
      render: (website) => (
        website ? (
          <a
            href={website.startsWith("http") ? website : `https://${website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary-600 hover:text-primary-800 underline"
          >
            {website}
          </a>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        )
      )
    },
    {
      key: "employeeCount",
      title: "Employees",
      sortable: true,
      render: (employeeCount) => (
        <span className="text-sm text-gray-900">{employeeCount || "-"}</span>
      )
    },
    {
      key: "contacts",
      title: "Contacts",
      render: (_, company) => (
        <div className="text-sm">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {getContactCount(company.Id)} contacts
          </span>
        </div>
      )
    },
    {
      key: "createdAt",
      title: "Added",
      sortable: true,
      render: (createdAt) => (
        <span className="text-sm text-gray-500">
          {format(new Date(createdAt), "MMM dd, yyyy")}
        </span>
      )
    }
  ];

  const industryOptions = [
    "Technology",
    "Software Development",
    "Investment",
    "E-commerce",
    "Consulting",
    "Marketing",
    "Healthcare",
    "Finance",
    "Manufacturing",
    "Education",
    "Other"
  ];

  const employeeCountOptions = [
    "1-10",
    "10-50",
    "50-100",
    "100-500",
    "500+"
  ];

  if (loading) {
    return <Loading variant="table" message="Loading companies..." />;
  }

  if (error) {
    return <Error message={error} onRetry={loadCompanies} />;
  }

  return (
<div className="space-y-4 animate-fadeIn">
      {/* Header */}
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
          <p className="text-gray-600 text-sm">Manage your business accounts and organizations</p>
        </div>
        <Button 
          variant="primary" 
          icon="Plus"
          onClick={() => {
            setEditingCompany(null);
            setFormData({
              name: "",
              industry: "",
              website: "",
              employeeCount: ""
            });
setEditingCompany(null);
            setShowAddModal(true);
          }}
          className="shadow-lg"
        >
          Add Company
        </Button>
      </div>

      {/* Search and Filters */}
<div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchBar
            placeholder="Search companies..."
            onSearch={setSearchTerm}
            className="w-full"
          />
        </div>
        <Button variant="secondary" icon="Filter" className="sm:w-auto">
          Filter
        </Button>
        <Button variant="secondary" icon="Download" className="sm:w-auto">
          Export
        </Button>
      </div>

      {/* Companies Table */}
      {companies.length === 0 ? (
        <Empty
          title="No companies found"
          message="Start building your business network by adding your first company."
          actionLabel="Add Company"
          onAction={() => {
            setEditingCompany(null);
            setFormData({
              name: "",
              industry: "",
              website: "",
              employeeCount: ""
            });
            setShowAddModal(true);
}}
          icon="Building2"
        />
      ) : (
        <DataTable
          data={companies}
          columns={columns}
          searchTerm={searchTerm}
          actions={(company) => (
            <ActionButtons
              onEdit={() => handleEdit(company)}
              onDelete={() => handleDelete(company)}
            />
          )}
        />
      )}

      {/* Add/Edit Modal */}
{showAddModal && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className="absolute inset-0 bg-black bg-opacity-25 transition-opacity"
              onClick={() => setShowAddModal(false)}
            />
            
            <div className="fixed inset-y-0 right-0 pl-8 max-w-full flex">
              <div className="w-screen max-w-md transform transition-transform ease-in-out duration-300 translate-x-0">
                <div className="h-full flex flex-col bg-white shadow-xl">
<form onSubmit={handleSubmit} className="h-full flex flex-col">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">
                          {editingCompany ? "Edit Company" : "Add New Company"}
                        </h3>
                        <button
                          type="button"
                          onClick={() => setShowAddModal(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <ApperIcon name="X" className="w-6 h-6" />
                        </button>
                      </div>
                    </div>

<div className="flex-1 px-4 py-4 overflow-y-auto">
                      <div className="space-y-3">
                        <Input
                          label="Company Name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          placeholder="Enter company name"
                        />
                        
                        <Select
                          label="Industry"
                          value={formData.industry}
                          onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                          required
                        >
                          <option value="">Select an industry</option>
                          {industryOptions.map((industry) => (
                            <option key={industry} value={industry}>
                              {industry}
                            </option>
                          ))}
                        </Select>
                        
                        <Input
                          label="Website"
                          value={formData.website}
                          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                          placeholder="https://example.com"
                        />
                        
                        <Select
                          label="Employee Count"
                          value={formData.employeeCount}
                          onChange={(e) => setFormData({ ...formData, employeeCount: e.target.value })}
                        >
                          <option value="">Select company size</option>
                          {employeeCountOptions.map((size) => (
                            <option key={size} value={size}>
                              {size} employees
                            </option>
                          ))}
                        </Select>
                      </div>
                    </div>

<div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setShowAddModal(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" variant="primary">
                          {editingCompany ? "Update Company" : "Add Company"}
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Companies;