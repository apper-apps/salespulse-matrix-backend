import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import DataTable from '@/components/organisms/DataTable';
import MetricCard from '@/components/molecules/MetricCard';
import SearchBar from '@/components/molecules/SearchBar';
import ActionButtons from '@/components/molecules/ActionButtons';
import StatusPill from '@/components/molecules/StatusPill';
import Button from '@/components/atoms/Button';
import Select from '@/components/atoms/Select';
import Card from '@/components/atoms/Card';
import Input from '@/components/atoms/Input';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import { leadService } from '@/services/api/leadService';

export default function HotLead() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    linkedin: '',
    status: 'new',
    score: 85,
    source: '',
    notes: ''
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const data = await leadService.getHotLeads();
      setLeads(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to fetch hot leads');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const newLead = await leadService.createHotLead(formData);
      setLeads(prev => [newLead, ...prev]);
      setShowAddModal(false);
      resetForm();
      toast.success('Hot lead created successfully');
    } catch (err) {
      toast.error('Failed to create hot lead');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updatedLead = await leadService.updateHotLead(selectedLead.Id, formData);
      setLeads(prev => prev.map(lead => lead.Id === selectedLead.Id ? updatedLead : lead));
      setShowEditModal(false);
      resetForm();
      toast.success('Hot lead updated successfully');
    } catch (err) {
      toast.error('Failed to update hot lead');
    }
  };

  const handleDelete = async (leadId) => {
    if (!window.confirm('Are you sure you want to delete this hot lead?')) return;
    
    try {
      await leadService.deleteHotLead(leadId);
      setLeads(prev => prev.filter(lead => lead.Id !== leadId));
      toast.success('Hot lead deleted successfully');
    } catch (err) {
      toast.error('Failed to delete hot lead');
    }
  };

const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      linkedin: '',
      status: 'new',
      score: 85,
      source: '',
      notes: ''
    });
    setSelectedLead(null);
  };

const openEditModal = (lead) => {
    setSelectedLead(lead);
    setFormData({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      linkedin: lead.linkedin || '',
      status: lead.status,
      score: lead.score,
      source: lead.source,
      notes: lead.notes || ''
    });
    setShowEditModal(true);
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lead.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedLeads = [...filteredLeads].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    
    if (typeof aVal === 'string') {
      return aVal.localeCompare(bVal) * multiplier;
    }
    return (aVal - bVal) * multiplier;
  });

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (lead) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <ApperIcon name="Thermometer" size={16} className="text-red-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{lead.name}</div>
            <div className="text-sm text-gray-500">{lead.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'company',
      label: 'Company',
      render: (lead) => (
        <div>
          <div className="font-medium text-gray-900">{lead.company}</div>
          <div className="text-sm text-gray-500">{lead.phone}</div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (lead) => <StatusPill status={lead.status} />
    },
    {
      key: 'score',
      label: 'Score',
      render: (lead) => (
        <div className="flex items-center space-x-2">
          <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-red-500 rounded-full transition-all duration-300"
              style={{ width: `${lead.score}%` }}
            />
          </div>
          <span className="text-sm font-medium text-red-600">{lead.score}</span>
        </div>
      )
    },
    {
      key: 'source',
      label: 'Source',
      render: (lead) => (
        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
          {lead.source}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (lead) => (
        <ActionButtons
          onEdit={() => openEditModal(lead)}
          onDelete={() => handleDelete(lead.Id)}
        />
      )
    }
  ];

  const metrics = [
    {
      title: 'Total Hot Leads',
      value: leads.length,
      change: '+12%',
      trend: 'up',
      icon: 'Thermometer',
      color: 'red'
    },
    {
      title: 'Qualified',
      value: leads.filter(l => l.status === 'qualified').length,
      change: '+8%',
      trend: 'up',
      icon: 'CheckCircle',
      color: 'green'
    },
    {
      title: 'In Progress',
      value: leads.filter(l => l.status === 'in_progress').length,
      change: '+5%',
      trend: 'up',
      icon: 'Clock',
      color: 'yellow'
    },
    {
      title: 'Average Score',
      value: Math.round(leads.reduce((acc, l) => acc + l.score, 0) / leads.length) || 0,
      change: '+3%',
      trend: 'up',
      icon: 'TrendingUp',
      color: 'blue'
    }
  ];

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={fetchLeads} />;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <ApperIcon name="Thermometer" size={28} className="mr-3 text-red-600" />
            Hot Leads
          </h1>
          <p className="mt-2 text-gray-600">Manage your high-priority leads</p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="mt-4 sm:mt-0"
        >
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Add Hot Lead
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      <Card>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search hot leads..."
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'new', label: 'New' },
                  { value: 'contacted', label: 'Contacted' },
                  { value: 'qualified', label: 'Qualified' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'converted', label: 'Converted' }
                ]}
              />
              <Select
                value={`${sortBy}-${sortOrder}`}
                onChange={(value) => {
                  const [field, order] = value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                options={[
                  { value: 'name-asc', label: 'Name A-Z' },
                  { value: 'name-desc', label: 'Name Z-A' },
                  { value: 'score-desc', label: 'Score High-Low' },
                  { value: 'score-asc', label: 'Score Low-High' }
                ]}
              />
            </div>
          </div>

          {sortedLeads.length === 0 ? (
            <Empty 
              icon="Thermometer" 
              title="No hot leads found" 
              description="Create your first hot lead to get started."
              action={
                <Button onClick={() => setShowAddModal(true)}>
                  <ApperIcon name="Plus" size={16} className="mr-2" />
                  Add Hot Lead
                </Button>
              }
            />
          ) : (
            <DataTable
              data={sortedLeads}
              columns={columns}
            />
          )}
        </div>
      </Card>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Add Hot Lead</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ApperIcon name="X" size={20} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <Input
                  label="Name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
                <Input
label="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
                <Input
                  label="Company"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                />
                <Input
                  label="LinkedIn Profile"
                  value={formData.linkedin}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                  placeholder="https://linkedin.com/in/username"
                  required
                />
                <Select
                  label="Status"
                  value={formData.status}
                  onChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                  options={[
                    { value: 'new', label: 'New' },
                    { value: 'contacted', label: 'Contacted' },
                    { value: 'qualified', label: 'Qualified' },
                    { value: 'in_progress', label: 'In Progress' },
                    { value: 'converted', label: 'Converted' }
                  ]}
                />
                <Input
                  label="Source"
                  value={formData.source}
                  onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                  placeholder="Website, Referral, Cold Call..."
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lead Score: {formData.score}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.score}
                    onChange={(e) => setFormData(prev => ({ ...prev, score: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Additional notes about this lead..."
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">Create Hot Lead</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Edit Hot Lead</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ApperIcon name="X" size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4">
                <Input
                  label="Name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
                <Input
label="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
                <Input
                  label="Company"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                />
                <Input
                  label="LinkedIn Profile"
                  value={formData.linkedin}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                  placeholder="https://linkedin.com/in/username"
                  required
                />
                <Select
                  label="Status"
                  value={formData.status}
                  onChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                  options={[
                    { value: 'new', label: 'New' },
                    { value: 'contacted', label: 'Contacted' },
                    { value: 'qualified', label: 'Qualified' },
                    { value: 'in_progress', label: 'In Progress' },
                    { value: 'converted', label: 'Converted' }
                  ]}
                />
                <Input
                  label="Source"
                  value={formData.source}
                  onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                  placeholder="Website, Referral, Cold Call..."
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lead Score: {formData.score}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.score}
                    onChange={(e) => setFormData(prev => ({ ...prev, score: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Additional notes about this lead..."
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">Update Hot Lead</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}