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
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    companyId: "",
    position: ""
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
        phone: "",
        companyId: "",
        position: ""
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
      phone: contact.phone,
      companyId: contact.companyId?.toString() || "",
      position: contact.position
    });
    setShowAddModal(true);
  };

  const handleDelete = async (contact) => {
    if (window.confirm(`Are you sure you want to delete ${contact.firstName} ${contact.lastName}?`)) {
      try {
        await contactsService.delete(contact.Id);
        toast.success("Contact deleted successfully!");
        loadContacts();
      } catch (err) {
        toast.error(err.message || "Failed to delete contact");
      }
    }
  };

  const getCompanyName = (companyId) => {
    const company = companies.find(c => c.Id === companyId);
    return company ? company.name : "Unknown Company";
  };

  const columns = [
    {
      key: "name",
      title: "Name",
      sortable: true,
      render: (_, contact) => (
        <div className="flex items-center space-x-3">
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
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600 mt-1">Manage your customer relationships</p>
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
              phone: "",
              companyId: "",
              position: ""
            });
            setShowAddModal(true);
          }}
          className="shadow-lg"
        >
          Add Contact
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            placeholder="Search contacts..."
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

      {/* Contacts Table */}
      {contacts.length === 0 ? (
        <Empty
          title="No contacts found"
          message="Start building your customer base by adding your first contact."
          actionLabel="Add Contact"
          onAction={() => {
            setEditingContact(null);
            setFormData({
              firstName: "",
              lastName: "",
              email: "",
              phone: "",
              companyId: "",
              position: ""
            });
            setShowAddModal(true);
          }}
          icon="Users"
        />
      ) : (
        <DataTable
          data={contacts}
          columns={columns}
          searchTerm={searchTerm}
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
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-black bg-opacity-25 transition-opacity"
              onClick={() => setShowAddModal(false)}
            />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit} className="p-6">
                <div className="flex items-center justify-between mb-6">
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

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
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
                </div>

                <div className="flex justify-end space-x-3 mt-6">
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
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;