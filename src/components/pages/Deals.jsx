import { useState, useEffect } from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Card from "@/components/atoms/Card";
import SearchBar from "@/components/molecules/SearchBar";
import StatusPill from "@/components/molecules/StatusPill";
import ActionButtons from "@/components/molecules/ActionButtons";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { dealsService } from "@/services/api/dealsService";
import { contactsService } from "@/services/api/contactsService";
import { companiesService } from "@/services/api/companiesService";
import { toast } from "react-toastify";
import { format } from "date-fns";

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
const [showAddModal, setShowAddModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);

  const handleEditRecord = (deal) => {
    setEditingDeal(deal);
    setFormData({
      title: deal.title || '',
      value: deal.value || '',
      stage: deal.stage || 'prospect',
      probability: deal.probability || '',
      contactId: deal.contactId || '',
      companyId: deal.companyId || '',
      expectedCloseDate: deal.expectedCloseDate || ''
    });
    setShowAddModal(true);
  };
  const [viewMode, setViewMode] = useState("kanban"); // 'kanban' or 'table'
  const [formData, setFormData] = useState({
    title: "",
    value: "",
    stage: "lead",
    contactId: "",
    companyId: "",
    probability: "25",
    expectedCloseDate: ""
  });

  const dealStages = [
    { key: "lead", label: "Lead", color: "bg-blue-100 text-blue-800" },
    { key: "qualified", label: "Qualified", color: "bg-purple-100 text-purple-800" },
    { key: "proposal", label: "Proposal", color: "bg-yellow-100 text-yellow-800" },
    { key: "negotiation", label: "Negotiation", color: "bg-orange-100 text-orange-800" },
    { key: "won", label: "Won", color: "bg-green-100 text-green-800" },
    { key: "lost", label: "Lost", color: "bg-red-100 text-red-800" }
  ];

  const loadDeals = async () => {
    try {
      setLoading(true);
      setError("");
      const [dealsData, contactsData, companiesData] = await Promise.all([
        dealsService.getAll(),
        contactsService.getAll(),
        companiesService.getAll()
      ]);
      setDeals(dealsData);
      setContacts(contactsData);
      setCompanies(companiesData);
    } catch (err) {
      setError(err.message || "Failed to load deals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dealData = {
        ...formData,
        value: parseFloat(formData.value),
        contactId: parseInt(formData.contactId),
        companyId: parseInt(formData.companyId),
        probability: parseInt(formData.probability)
      };

      if (editingDeal) {
        await dealsService.update(editingDeal.Id, dealData);
        toast.success("Deal updated successfully!");
      } else {
        await dealsService.create(dealData);
        toast.success("Deal created successfully!");
      }
setShowAddModal(false);
      setEditingDeal(null);
      resetForm();
      loadDeals();
    } catch (err) {
      toast.error(err.message || "Failed to save deal");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      value: "",
      stage: "lead",
      contactId: "",
      companyId: "",
      probability: "25",
      expectedCloseDate: ""
    });
  };

  const handleEdit = (deal) => {
    setEditingDeal(deal);
    setFormData({
      title: deal.title,
      value: deal.value.toString(),
      stage: deal.stage,
      contactId: deal.contactId?.toString() || "",
      companyId: deal.companyId?.toString() || "",
      probability: deal.probability?.toString() || "25",
      expectedCloseDate: deal.expectedCloseDate ? format(new Date(deal.expectedCloseDate), "yyyy-MM-dd") : ""
    });
setEditingDeal(null);
    setShowAddModal(true);
  };

  const handleDelete = async (deal) => {
    if (window.confirm(`Are you sure you want to delete "${deal.title}"?`)) {
      try {
        await dealsService.delete(deal.Id);
        toast.success("Deal deleted successfully!");
        loadDeals();
      } catch (err) {
        toast.error(err.message || "Failed to delete deal");
      }
    }
  };

  const handleStageChange = async (dealId, newStage) => {
    try {
      await dealsService.updateStage(dealId, newStage);
      toast.success("Deal stage updated successfully!");
      loadDeals();
    } catch (err) {
      toast.error(err.message || "Failed to update deal stage");
    }
  };

  const getContactName = (contactId) => {
    const contact = contacts.find(c => c.Id === contactId);
    return contact ? `${contact.firstName} ${contact.lastName}` : "Unknown Contact";
  };

  const getCompanyName = (companyId) => {
    const company = companies.find(c => c.Id === companyId);
    return company ? company.name : "Unknown Company";
  };

  const filteredDeals = searchTerm 
    ? deals.filter(deal => 
        deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getContactName(deal.contactId).toLowerCase().includes(searchTerm.toLowerCase()) ||
        getCompanyName(deal.companyId).toLowerCase().includes(searchTerm.toLowerCase())
      )
    : deals;

  const getDealsByStage = (stage) => {
    return filteredDeals.filter(deal => deal.stage === stage);
  };

  if (loading) {
    return <Loading variant="cards" message="Loading deals..." />;
  }

  if (error) {
    return <Error message={error} onRetry={loadDeals} />;
  }

  const KanbanView = () => (
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {dealStages.map((stage) => {
        const stageDeals = getDealsByStage(stage.key);
        const stageValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0);
        
        return (
<div key={stage.key} className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">{stage.label}</h3>
              <div className="text-xs text-gray-500">
                {stageDeals.length} • ${stageValue.toLocaleString()}
              </div>
            </div>
            
<div className="space-y-2">
              {stageDeals.map((deal) => (
<Card 
                  key={deal.Id} 
                  className="p-3 hover:shadow-lg transition-all duration-200 cursor-pointer"
                  onClick={() => handleEditRecord(deal)}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-sm text-gray-900 line-clamp-2">
                        {deal.title}
                      </h4>
                      <div className="flex space-x-1 ml-2">
                        <button
                          onClick={() => handleEdit(deal)}
                          className="text-gray-400 hover:text-primary-600 p-1"
                        >
                          <ApperIcon name="Edit2" className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(deal)}
                          className="text-gray-400 hover:text-red-600 p-1"
                        >
                          <ApperIcon name="Trash2" className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-lg font-bold text-green-600">
                      ${deal.value.toLocaleString()}
                    </div>
                    
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>{getContactName(deal.contactId)}</div>
                      <div>{getCompanyName(deal.companyId)}</div>
                      {deal.expectedCloseDate && (
                        <div>Due: {format(new Date(deal.expectedCloseDate), "MMM dd")}</div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {deal.probability}% probability
                      </div>
                      <select
                        value={deal.stage}
                        onChange={(e) => handleStageChange(deal.Id, e.target.value)}
                        className="text-xs bg-transparent border-0 text-gray-600 focus:outline-none"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {dealStages.map((s) => (
                          <option key={s.key} value={s.key}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
<div className="space-y-4 animate-fadeIn">
      {/* Header */}
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
          <p className="text-gray-600 text-sm">Track your sales opportunities and pipeline</p>
        </div>
        <div className="flex items-center space-x-3">
<div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-2 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
                viewMode === "kanban"
                  ? "bg-white text-primary-600 shadow-sm" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <ApperIcon name="Columns" className="w-4 h-4 mr-1.5" />
              Kanban
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                viewMode === "table" 
                  ? "bg-white text-primary-600 shadow-sm" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <ApperIcon name="Table" className="w-4 h-4 mr-1.5" />
              Table
            </button>
          </div>
          <Button 
            variant="primary" 
            icon="Plus"
            onClick={() => {
              setEditingDeal(null);
              resetForm();
setEditingDeal(null);
              setShowAddModal(true);
            }}
            className="shadow-lg"
          >
            Add Deal
          </Button>
        </div>
      </div>

      {/* Search */}
<div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchBar
            placeholder="Search deals..."
            onSearch={setSearchTerm}
            className="w-full"
          />
        </div>
        <Button variant="secondary" icon="Filter" className="sm:w-auto">
          Filter
        </Button>
      </div>

      {/* Content */}
      {deals.length === 0 ? (
        <Empty
          title="No deals found"
          message="Start tracking your sales opportunities by adding your first deal."
          actionLabel="Add Deal"
          onAction={() => {
            setEditingDeal(null);
            resetForm();
            setShowAddModal(true);
          }}
          icon="Target"
        />
      ) : (
        <KanbanView />
      )}

      {/* Add/Edit Modal */}
{showAddModal && (
<div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className="absolute inset-0 bg-black bg-opacity-25 transition-opacity"
              onClick={() => setShowAddModal(false)}
            />
            
            <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
              <div className="w-screen max-w-md transform transition-transform ease-in-out duration-300 translate-x-0">
                <div className="h-full flex flex-col bg-white shadow-xl">
                  <form onSubmit={handleSubmit} className="h-full flex flex-col">
<div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">
                          {editingDeal ? "Edit Deal" : "Add New Deal"}
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
                          label="Deal Title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          required
                          placeholder="Enter deal title"
                        />
                        
                        <Input
                          label="Deal Value ($)"
                          type="number"
                          value={formData.value}
                          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                          required
                          placeholder="0"
                        />
                        
<div className="grid grid-cols-2 gap-3">
                          <Select
                            label="Stage"
                            value={formData.stage}
                            onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                            required
                          >
                            {dealStages.map((stage) => (
                              <option key={stage.key} value={stage.key}>
                                {stage.label}
                              </option>
                            ))}
                          </Select>
                          
                          <Input
                            label="Probability (%)"
                            type="number"
                            min="0"
                            max="100"
                            value={formData.probability}
                            onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                            required
                          />
                        </div>
                        
                        <Select
                          label="Contact"
                          value={formData.contactId}
                          onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
                          required
                        >
                          <option value="">Select a contact</option>
                          {contacts.map((contact) => (
                            <option key={contact.Id} value={contact.Id}>
                              {contact.firstName} {contact.lastName}
                            </option>
                          ))}
                        </Select>
                        
                        <Select
                          label="Company"
                          value={formData.companyId}
                          onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                          required
                        >
                          <option value="">Select a company</option>
                          {companies.map((company) => (
                            <option key={company.Id} value={company.Id}>
                              {company.name}
                            </option>
                          ))}
                        </Select>
                        
                        <Input
                          label="Expected Close Date"
                          type="date"
                          value={formData.expectedCloseDate}
                          onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
                        />
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
                          {editingDeal ? "Update Deal" : "Add Deal"}
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

export default Deals;