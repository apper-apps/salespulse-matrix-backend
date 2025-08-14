import { useState, useEffect } from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Card from "@/components/atoms/Card";
import SearchBar from "@/components/molecules/SearchBar";
import ActionButtons from "@/components/molecules/ActionButtons";
import DataTable from "@/components/organisms/DataTable";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { contactsService } from "@/services/api/contactsService";
import { companiesService } from "@/services/api/companiesService";
import { toast } from "react-toastify";
import { format } from "date-fns";

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const [searchTerm, setSearchTerm] = useState("");
  const [leadTypeFilter, setLeadTypeFilter] = useState("all");
const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
const [selectedContacts, setSelectedContacts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
const handleEditRecord = (contact) => {
    setEditingContact(contact);
    setFormData({
      firstName: contact.firstName || '',
      lastName: contact.lastName || '',
      email: contact.email || '',
      linkedinProfile: contact.linkedinProfile || '',
      phone: contact.phone || '',
      companyId: contact.companyId || '',
      position: contact.position || '',
      leadType: contact.leadType || 'contact',
      score: contact.score || 50
    });
    setShowAddModal(true);
  };
const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    linkedinProfile: "",
    phone: "",
    companyId: "",
    position: "",
    leadType: "contact",
    score: 50
  });

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError("");
      const [contactsData, companiesData] = await Promise.all([
        contactsService.getAll(),
        companiesService.getAll()
      ]);
      setContacts(contactsData);
      setCompanies(companiesData);
    } catch (err) {
      setError(err.message || "Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingContact) {
        await contactsService.update(editingContact.Id, formData);
        toast.success("Contact updated successfully!");
      } else {
        await contactsService.create(formData);
        toast.success("Contact created successfully!");
      }
setShowAddModal(false);
      setEditingContact(null);
setFormData({
        firstName: "",
        lastName: "",
        email: "",
        linkedinProfile: "",
        phone: "",
        companyId: "",
        position: "",
        leadType: "contact",
        score: 50
      });
      loadContacts();
    } catch (err) {
      toast.error(err.message || "Failed to save contact");
    }
  };

const handleEdit = (contact) => {
    setEditingContact(contact);
    setFormData({
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      linkedinProfile: contact.linkedinProfile || "",
      phone: contact.phone,
      companyId: contact.companyId?.toString() || "",
      position: contact.position,
      leadType: contact.leadType || "contact",
      score: contact.score || 50
    });
    setEditingContact(null);
    setShowAddModal(true);
  };

  const handleSelectContact = (contactId) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedContacts([]);
      setSelectAll(false);
    } else {
      setSelectedContacts(contacts.map(contact => contact.Id));
      setSelectAll(true);
    }
  };

  const handleDelete = async (contactOrIds) => {
    const isArray = Array.isArray(contactOrIds);
    const ids = isArray ? contactOrIds : [contactOrIds.Id];
    const confirmMessage = isArray 
      ? `Are you sure you want to delete ${ids.length} selected contacts?`
      : `Are you sure you want to delete ${contactOrIds.firstName} ${contactOrIds.lastName}?`;

    if (window.confirm(confirmMessage)) {
      try {
        await contactsService.delete(ids);
        toast.success(isArray ? `${ids.length} contacts deleted successfully!` : "Contact deleted successfully!");
        setSelectedContacts([]);
        setSelectAll(false);
        loadContacts();
      } catch (err) {
        toast.error(err.message || "Failed to delete contact(s)");
      }
    }
  };

  const handleBulkDelete = () => {
    handleDelete(selectedContacts);
  };

const getCompanyName = (companyId) => {
    const company = companies.find(c => c.Id === companyId);
    return company ? company.name : "Unknown Company";
  };

  // Filter contacts based on search term and lead type
  const filteredContacts = contacts.filter(contact => {
    // Lead type filter
    const matchesType = leadTypeFilter === "all" || contact.leadType === leadTypeFilter;
    
    // Search term filter
    const matchesSearch = !searchTerm || 
      `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCompanyName(contact.companyId).toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  // Get counts for each lead type
  const getTypeCount = (type) => {
    if (type === "all") return contacts.length;
    return contacts.filter(contact => contact.leadType === type).length;
  };

const columns = [
    {
      key: "name",
      title: "Name",
      sortable: true,
render: (_, contact) => (
        <div 
          className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 -m-2 p-2 rounded-lg transition-colors"
          onClick={() => handleEditRecord(contact)}
        >
          <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {contact.firstName} {contact.lastName}
            </p>
            <p className="text-sm text-gray-500">{contact.position}</p>
          </div>
        </div>
      )
    },
    {
      key: "email",
      title: "Email",
      sortable: true,
      render: (email) => (
        <div className="text-sm">
          <p className="text-gray-900">{email}</p>
        </div>
      )
    },
    {
      key: "leadType",
      title: "Type",
      sortable: true,
      render: (leadType, contact) => (
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs font-medium rounded ${
            leadType === 'hot' ? 'bg-red-100 text-red-800' :
            leadType === 'cold' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {leadType === 'hot' ? 'Hot Lead' : leadType === 'cold' ? 'Cold Lead' : 'Contact'}
          </span>
          {leadType !== 'contact' && contact.score && (
            <span className="text-xs text-gray-500">{contact.score}</span>
          )}
        </div>
      )
    },
    {
      key: "phone",
      title: "Phone",
      sortable: true,
      render: (phone) => (
        <span className="text-sm text-gray-900">{phone || "-"}</span>
      )
    },
    {
      key: "companyId",
      title: "Company",
      sortable: true,
      render: (companyId) => (
        <span className="text-sm text-gray-900">{getCompanyName(companyId)}</span>
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
if (loading) {
    return <Loading variant="table" message="Loading contacts..." />;
  }

  if (error) {
    return <Error message={error} onRetry={loadContacts} />;
  }

  return (
<div className="space-y-4 animate-fadeIn">
      {/* Header */}
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600 text-sm">Manage your customer relationships</p>
        </div>
        <Button 
          variant="primary" 
          icon="Plus"
onClick={() => {
            setEditingContact(null);
            setFormData({
              firstName: "",
              lastName: "",
              email: "",
              linkedinProfile: "",
              phone: "",
              companyId: "",
              position: "",
              leadType: "contact",
              score: 50
            });
            setEditingContact(null);
            setSelectedContacts([]);
            setSelectAll(false);
            setShowAddModal(true);
          }}
          className="shadow-lg"
        >
          Add Contact
        </Button>
      </div>

      {/* Selection Summary and Bulk Actions */}
{selectedContacts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-blue-900">
                {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={() => {
                  setSelectedContacts([]);
                  setSelectAll(false);
                }}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Clear selection
              </button>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="destructive" 
                icon="Trash2"
                onClick={handleBulkDelete}
                size="small"
              >
                Delete Selected
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
<div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchBar
            placeholder="Search contacts..."
            onSearch={setSearchTerm}
            className="w-full"
          />
</div>
        <Button variant="secondary" icon="Download" className="sm:w-auto">
          Export
        </Button>
      </div>

{/* Sales Pipeline Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-1">
            <h3 className="text-sm font-medium text-gray-700 mr-3">Filter by Type:</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "all", label: "All Contacts", count: getTypeCount("all") },
                { key: "contact", label: "Contacts", count: getTypeCount("contact") },
                { key: "hot", label: "Hot Leads", count: getTypeCount("hot") },
                { key: "cold", label: "Cold Leads", count: getTypeCount("cold") }
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setLeadTypeFilter(filter.key)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    leadTypeFilter === filter.key
                      ? 'bg-primary-100 text-primary-700 border border-primary-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Showing {filteredContacts.length} of {contacts.length} contacts
          </div>
        </div>
      </div>

      {/* Contacts Table */}
      {filteredContacts.length === 0 ? (
        <Empty
          title={contacts.length === 0 ? "No contacts found" : "No contacts match your filters"}
          message={contacts.length === 0 ? "Start building your customer base by adding your first contact." : "Try adjusting your search or filter criteria."}
          actionLabel={contacts.length === 0 ? "Add Contact" : "Clear Filters"}
          onAction={() => {
            if (contacts.length === 0) {
              setEditingContact(null);
              setFormData({
                firstName: "",
                lastName: "",
                email: "",
                linkedinProfile: "",
                phone: "",
                companyId: "",
                position: "",
                leadType: "contact",
                score: 50
              });
              setEditingContact(null);
              setSelectedContacts([]);
              setSelectAll(false);
              setShowAddModal(true);
            } else {
              setSearchTerm("");
              setLeadTypeFilter("all");
            }
          }}
          icon="Users"
        />
      ) : (
        <DataTable
          data={filteredContacts}
          columns={columns}
          searchTerm=""
          selectable={true}
          selectedItems={selectedContacts}
          onSelectItem={handleSelectContact}
          onSelectAll={handleSelectAll}
          actions={(contact) => (
            <ActionButtons
              onEdit={() => handleEdit(contact)}
              onDelete={() => handleDelete(contact)}
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
                          {editingContact ? "Edit Contact" : "Add New Contact"}
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
<div className="grid grid-cols-1 gap-3">
                          <Input
                            label="First Name"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            required
                          />
                          <Input
                            label="Last Name"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            required
                          />
                        </div>
                        
<Input
                          label="Email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                        
                        <Input
                          label="LinkedIn Profile"
                          type="url"
                          value={formData.linkedinProfile}
                          onChange={(e) => setFormData({ ...formData, linkedinProfile: e.target.value })}
                          placeholder="https://linkedin.com/in/username"
                        />
                        
                        <Input
                          label="Phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                        
                        <Select
                          label="Company"
                          value={formData.companyId}
                          onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                        >
                          <option value="">Select a company</option>
                          {companies.map((company) => (
                            <option key={company.Id} value={company.Id}>
                              {company.name}
                            </option>
                          ))}
                        </Select>
                        
                        <Input
                          label="Position"
                          value={formData.position}
                          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        />

                        <Select
                          label="Type"
                          value={formData.leadType}
                          onChange={(e) => setFormData({ ...formData, leadType: e.target.value })}
                        >
                          <option value="contact">Contact</option>
                          <option value="hot">Hot Lead</option>
                          <option value="cold">Cold Lead</option>
                        </Select>

                        {formData.leadType !== 'contact' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Lead Score: {formData.score}
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={formData.score}
                              onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) })}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                            />
                          </div>
                        )}
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
                          {editingContact ? "Update Contact" : "Add Contact"}
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

export default Contacts;