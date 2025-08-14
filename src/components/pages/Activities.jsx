import { useState, useEffect } from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Card from "@/components/atoms/Card";
import SearchBar from "@/components/molecules/SearchBar";
import StatusPill from "@/components/molecules/StatusPill";
import ActionButtons from "@/components/molecules/ActionButtons";
import DataTable from "@/components/organisms/DataTable";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { activitiesService } from "@/services/api/activitiesService";
import { contactsService } from "@/services/api/contactsService";
import { dealsService } from "@/services/api/dealsService";
import { toast } from "react-toastify";
import { format } from "date-fns";

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [formData, setFormData] = useState({
    type: "task",
    title: "",
    description: "",
    dueDate: "",
    status: "pending",
    relatedToId: "",
    relatedToType: "deal"
  });

  const activityTypes = [
    { key: "call", label: "Call", icon: "Phone" },
    { key: "email", label: "Email", icon: "Mail" },
    { key: "meeting", label: "Meeting", icon: "Calendar" },
    { key: "task", label: "Task", icon: "CheckSquare" }
  ];

  const statusOptions = [
    { key: "pending", label: "Pending" },
    { key: "completed", label: "Completed" },
    { key: "overdue", label: "Overdue" }
  ];

  const loadActivities = async () => {
    try {
      setLoading(true);
      setError("");
      const [activitiesData, contactsData, dealsData] = await Promise.all([
        activitiesService.getAll(),
        contactsService.getAll(),
        dealsService.getAll()
      ]);
      setActivities(activitiesData);
      setContacts(contactsData);
      setDeals(dealsData);
    } catch (err) {
      setError(err.message || "Failed to load activities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const activityData = {
        ...formData,
        relatedToId: parseInt(formData.relatedToId)
      };

      if (editingActivity) {
        await activitiesService.update(editingActivity.Id, activityData);
        toast.success("Activity updated successfully!");
      } else {
        await activitiesService.create(activityData);
        toast.success("Activity created successfully!");
      }
      setShowAddModal(false);
      setEditingActivity(null);
      resetForm();
      loadActivities();
    } catch (err) {
      toast.error(err.message || "Failed to save activity");
    }
  };

  const resetForm = () => {
    setFormData({
      type: "task",
      title: "",
      description: "",
      dueDate: "",
      status: "pending",
      relatedToId: "",
      relatedToType: "deal"
    });
  };

  const handleEdit = (activity) => {
    setEditingActivity(activity);
    setFormData({
      type: activity.type,
      title: activity.title,
      description: activity.description,
      dueDate: activity.dueDate ? format(new Date(activity.dueDate), "yyyy-MM-dd'T'HH:mm") : "",
      status: activity.status,
      relatedToId: activity.relatedToId?.toString() || "",
      relatedToType: activity.relatedToType
    });
    setShowAddModal(true);
  };

  const handleDelete = async (activity) => {
    if (window.confirm(`Are you sure you want to delete "${activity.title}"?`)) {
      try {
        await activitiesService.delete(activity.Id);
        toast.success("Activity deleted successfully!");
        loadActivities();
      } catch (err) {
        toast.error(err.message || "Failed to delete activity");
      }
    }
  };

  const handleStatusToggle = async (activity) => {
    const newStatus = activity.status === "completed" ? "pending" : "completed";
    try {
      await activitiesService.update(activity.Id, { status: newStatus });
      toast.success(`Activity marked as ${newStatus}!`);
      loadActivities();
    } catch (err) {
      toast.error(err.message || "Failed to update activity status");
    }
  };

  const getRelatedToName = (activity) => {
    if (activity.relatedToType === "deal") {
      const deal = deals.find(d => d.Id === activity.relatedToId);
      return deal ? deal.title : "Unknown Deal";
    } else if (activity.relatedToType === "contact") {
      const contact = contacts.find(c => c.Id === activity.relatedToId);
      return contact ? `${contact.firstName} ${contact.lastName}` : "Unknown Contact";
    }
    return "Unknown";
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = !searchTerm || 
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || activity.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: "type",
      title: "Type",
      render: (type, activity) => {
        const typeConfig = activityTypes.find(t => t.key === type) || activityTypes[0];
        return (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
              <ApperIcon name={typeConfig.icon} className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-900 capitalize">{type}</span>
          </div>
        );
      }
    },
    {
      key: "title",
      title: "Activity",
      sortable: true,
      render: (title, activity) => (
        <div>
          <p className="font-medium text-gray-900">{title}</p>
          <p className="text-sm text-gray-500 line-clamp-2">{activity.description}</p>
        </div>
      )
    },
    {
      key: "relatedTo",
      title: "Related To",
      render: (_, activity) => (
        <div className="text-sm">
          <p className="text-gray-900">{getRelatedToName(activity)}</p>
          <p className="text-gray-500 capitalize">{activity.relatedToType}</p>
        </div>
      )
    },
    {
      key: "dueDate",
      title: "Due Date",
      sortable: true,
      render: (dueDate) => (
        <div className="text-sm">
          <p className="text-gray-900">
            {format(new Date(dueDate), "MMM dd, yyyy")}
          </p>
          <p className="text-gray-500">
            {format(new Date(dueDate), "h:mm a")}
          </p>
        </div>
      )
    },
    {
      key: "status",
      title: "Status",
      render: (status, activity) => (
        <div className="flex items-center space-x-2">
          <StatusPill status={status} type="activity" />
          <button
            onClick={() => handleStatusToggle(activity)}
            className="text-gray-400 hover:text-primary-600"
          >
            <ApperIcon 
              name={status === "completed" ? "RotateCcw" : "Check"} 
              className="w-4 h-4" 
            />
          </button>
        </div>
      )
    }
  ];

  if (loading) {
    return <Loading variant="table" message="Loading activities..." />;
  }

  if (error) {
    return <Error message={error} onRetry={loadActivities} />;
  }

  return (
<div className="space-y-4 animate-fadeIn">
      {/* Header */}
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activities</h1>
          <p className="text-gray-600 text-sm">Manage your tasks, calls, meetings, and follow-ups</p>
        </div>
        <Button 
          variant="primary" 
          icon="Plus"
          onClick={() => {
            setEditingActivity(null);
            resetForm();
            setShowAddModal(true);
          }}
          className="shadow-lg"
        >
          Add Activity
        </Button>
      </div>

      {/* Stats Cards */}
<div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Total</p>
              <p className="text-xl font-bold text-gray-900">{activities.length}</p>
            </div>
            <ApperIcon name="CheckSquare" className="w-6 h-6 text-gray-400" />
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Pending</p>
              <p className="text-xl font-bold text-yellow-600">
                {activities.filter(a => a.status === "pending").length}
              </p>
            </div>
            <ApperIcon name="Clock" className="w-6 h-6 text-yellow-400" />
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Completed</p>
              <p className="text-xl font-bold text-green-600">
                {activities.filter(a => a.status === "completed").length}
              </p>
            </div>
            <ApperIcon name="CheckCircle" className="w-6 h-6 text-green-400" />
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Overdue</p>
              <p className="text-xl font-bold text-red-600">
                {activities.filter(a => a.status === "overdue").length}
              </p>
            </div>
            <ApperIcon name="AlertCircle" className="w-6 h-6 text-red-400" />
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
<div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchBar
            placeholder="Search activities..."
            onSearch={setSearchTerm}
            className="w-full"
          />
        </div>
        <Select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="sm:w-48"
        >
          <option value="all">All Status</option>
          {statusOptions.map((status) => (
            <option key={status.key} value={status.key}>
              {status.label}
            </option>
          ))}
        </Select>
      </div>

      {/* Activities Table */}
      {activities.length === 0 ? (
        <Empty
          title="No activities found"
          message="Start organizing your work by creating your first activity or task."
          actionLabel="Add Activity"
          onAction={() => {
            setEditingActivity(null);
            resetForm();
            setShowAddModal(true);
          }}
          icon="CheckSquare"
        />
      ) : (
        <DataTable
          data={filteredActivities}
          columns={columns}
          searchTerm=""
          actions={(activity) => (
            <ActionButtons
              onEdit={() => handleEdit(activity)}
              onDelete={() => handleDelete(activity)}
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
<form onSubmit={handleSubmit} className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingActivity ? "Edit Activity" : "Add New Activity"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <ApperIcon name="X" className="w-6 h-6" />
                  </button>
                </div>

<div className="space-y-3">
<div className="grid grid-cols-2 gap-3">
                    <Select
                      label="Type"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      required
                    >
                      {activityTypes.map((type) => (
                        <option key={type.key} value={type.key}>
                          {type.label}
                        </option>
                      ))}
                    </Select>
                    
                    <Select
                      label="Status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      required
                    >
                      {statusOptions.map((status) => (
                        <option key={status.key} value={status.key}>
                          {status.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  
                  <Input
                    label="Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="Enter activity title"
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter activity description"
                    />
                  </div>
                  
                  <Input
                    label="Due Date & Time"
                    type="datetime-local"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    required
                  />
                  
<div className="grid grid-cols-2 gap-3">
                    <Select
                      label="Related To"
                      value={formData.relatedToType}
                      onChange={(e) => setFormData({ ...formData, relatedToType: e.target.value, relatedToId: "" })}
                      required
                    >
                      <option value="deal">Deal</option>
                      <option value="contact">Contact</option>
                    </Select>
                    
                    <Select
                      label={formData.relatedToType === "deal" ? "Select Deal" : "Select Contact"}
                      value={formData.relatedToId}
                      onChange={(e) => setFormData({ ...formData, relatedToId: e.target.value })}
                      required
                    >
                      <option value="">Choose...</option>
                      {formData.relatedToType === "deal" 
                        ? deals.map((deal) => (
                            <option key={deal.Id} value={deal.Id}>
                              {deal.title}
                            </option>
                          ))
                        : contacts.map((contact) => (
                            <option key={contact.Id} value={contact.Id}>
                              {contact.firstName} {contact.lastName}
                            </option>
                          ))
                      }
                    </Select>
                  </div>
                </div>

<div className="flex justify-end space-x-2 mt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary">
                    {editingActivity ? "Update Activity" : "Add Activity"}
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

export default Activities;