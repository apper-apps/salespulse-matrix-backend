import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Card from '@/components/atoms/Card';
import Badge from '@/components/atoms/Badge';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import { followUpService } from '@/services/api/followUpService';
import { format, parseISO, isToday, isTomorrow, isPast, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

const FollowUp = () => {
  const [followUps, setFollowUps] = useState([]);
  const [filteredFollowUps, setFilteredFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledDate: '',
    priority: 'medium',
    contactName: '',
    method: 'call',
    notes: ''
  });

  useEffect(() => {
    fetchFollowUps();
  }, []);

  useEffect(() => {
    filterFollowUps();
  }, [followUps, searchTerm, filterStatus, filterPriority, filterMethod, selectedDate, viewMode]);

  const fetchFollowUps = async () => {
    try {
      setLoading(true);
      const data = await followUpService.getAll();
      setFollowUps(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch follow-ups');
      toast.error('Failed to fetch follow-ups');
    } finally {
      setLoading(false);
    }
  };

  const filterFollowUps = () => {
    let filtered = [...followUps];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(followUp =>
        followUp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        followUp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        followUp.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        followUp.notes.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(followUp => followUp.status === filterStatus);
    }

    // Priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(followUp => followUp.priority === filterPriority);
    }

    // Method filter
    if (filterMethod !== 'all') {
      filtered = filtered.filter(followUp => followUp.method === filterMethod);
    }

    // Date filter for calendar view
    if (viewMode === 'calendar') {
      filtered = filtered.filter(followUp => 
        isSameDay(parseISO(followUp.scheduledDate), selectedDate)
      );
    }

    setFilteredFollowUps(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFollowUp) {
        await followUpService.update(editingFollowUp.Id, formData);
        toast.success('Follow-up updated successfully');
      } else {
        await followUpService.create(formData);
        toast.success('Follow-up created successfully');
      }
      
      fetchFollowUps();
      resetForm();
    } catch (err) {
      toast.error('Failed to save follow-up');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this follow-up?')) {
      try {
        await followUpService.delete(id);
        toast.success('Follow-up deleted successfully');
        fetchFollowUps();
      } catch (err) {
        toast.error('Failed to delete follow-up');
      }
    }
  };

  const handleEdit = (followUp) => {
    setEditingFollowUp(followUp);
    setFormData({
      title: followUp.title,
      description: followUp.description,
      scheduledDate: format(parseISO(followUp.scheduledDate), "yyyy-MM-dd'T'HH:mm"),
      priority: followUp.priority,
      contactName: followUp.contactName,
      method: followUp.method,
      notes: followUp.notes
    });
    setShowForm(true);
  };

  const handleComplete = async (id) => {
    try {
      await followUpService.update(id, { status: 'completed' });
      toast.success('Follow-up marked as completed');
      fetchFollowUps();
    } catch (err) {
      toast.error('Failed to update follow-up');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      scheduledDate: '',
      priority: 'medium',
      contactName: '',
      method: 'call',
      notes: ''
    });
    setEditingFollowUp(null);
    setShowForm(false);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    return status === 'completed' 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getDateStatus = (scheduledDate) => {
    const date = parseISO(scheduledDate);
    if (isPast(date) && !isToday(date)) return { text: 'Overdue', color: 'text-red-600' };
    if (isToday(date)) return { text: 'Today', color: 'text-orange-600' };
    if (isTomorrow(date)) return { text: 'Tomorrow', color: 'text-blue-600' };
    return { text: format(date, 'MMM d, yyyy'), color: 'text-gray-600' };
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'call': return 'Phone';
      case 'email': return 'Mail';
      case 'meeting': return 'Users';
      case 'message': return 'MessageSquare';
      default: return 'Clock';
    }
  };

  const getMethodColor = (method) => {
    switch (method) {
      case 'call': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'email': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'meeting': return 'bg-green-100 text-green-800 border-green-200';
      case 'message': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Calendar functions
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const getFollowUpsForDate = (date) => {
    return followUps.filter(followUp => 
      isSameDay(parseISO(followUp.scheduledDate), date)
    );
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={fetchFollowUps} />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Follow-ups</h1>
          <p className="text-gray-600 mt-1">Manage your scheduled follow-up activities</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'list' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <ApperIcon name="List" size={16} />
            List
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
          >
            <ApperIcon name="Calendar" size={16} />
            Calendar
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <ApperIcon name="Plus" size={16} />
            Add Follow-up
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Input
            placeholder="Search follow-ups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
          
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
          
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Methods</option>
            <option value="call">Call</option>
            <option value="email">Email</option>
            <option value="meeting">Meeting</option>
            <option value="message">Message</option>
          </select>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ApperIcon name="Clock" size={16} />
            <span>{filteredFollowUps.length} follow-ups</span>
          </div>
        </div>
      </Card>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={prevMonth}>
                  <ApperIcon name="ChevronLeft" size={16} />
                </Button>
                <Button variant="outline" size="sm" onClick={nextMonth}>
                  <ApperIcon name="ChevronRight" size={16} />
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-600 p-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map(day => {
                const dayFollowUps = getFollowUpsForDate(day);
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentDate);
                
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`p-2 min-h-[60px] text-sm rounded-md border transition-colors ${
                      isSelected
                        ? 'bg-blue-500 text-white border-blue-500'
                        : isCurrentMonth
                        ? 'hover:bg-gray-100 border-gray-200'
                        : 'text-gray-400 border-gray-100'
                    }`}
                  >
                    <div className="text-center">
                      {format(day, 'd')}
                      {dayFollowUps.length > 0 && (
                        <div className="flex justify-center mt-1 gap-1">
                          {dayFollowUps.slice(0, 3).map((_, index) => (
                            <span 
                              key={index}
                              className={`w-1.5 h-1.5 rounded-full ${
                                isSelected ? 'bg-white' : 'bg-blue-500'
                              }`} 
                            />
                          ))}
                          {dayFollowUps.length > 3 && (
                            <span className={`text-xs ${isSelected ? 'text-white' : 'text-blue-500'}`}>
                              +{dayFollowUps.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
          
          <Card className="p-4">
            <h3 className="font-semibold mb-3">
              {format(selectedDate, 'MMMM d, yyyy')}
            </h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {filteredFollowUps.length === 0 ? (
                <p className="text-gray-500 text-sm">No follow-ups for this date</p>
              ) : (
                filteredFollowUps.map(followUp => (
                  <div key={followUp.Id} className="p-3 border rounded-md hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{followUp.title}</h4>
                      <Badge className={getPriorityColor(followUp.priority)}>
                        {followUp.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <ApperIcon name={getMethodIcon(followUp.method)} size={12} />
                      <span>{format(parseISO(followUp.scheduledDate), 'h:mm a')}</span>
                      <span>•</span>
                      <span>{followUp.contactName}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {filteredFollowUps.length === 0 ? (
            <Empty 
              title="No follow-ups found"
              description="Schedule your first follow-up to get started"
              action={
                <Button onClick={() => setShowForm(true)}>
                  <ApperIcon name="Plus" size={16} />
                  Add Follow-up
                </Button>
              }
            />
          ) : (
            filteredFollowUps.map(followUp => {
              const dateStatus = getDateStatus(followUp.scheduledDate);
              
              return (
                <Card key={followUp.Id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <ApperIcon name={getMethodIcon(followUp.method)} size={20} className="text-gray-600" />
                        <h3 className="text-lg font-semibold text-gray-900">{followUp.title}</h3>
                        <Badge className={getPriorityColor(followUp.priority)}>
                          {followUp.priority}
                        </Badge>
                        <Badge className={getStatusColor(followUp.status)}>
                          {followUp.status}
                        </Badge>
                        <Badge className={getMethodColor(followUp.method)}>
                          {followUp.method}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{followUp.description}</p>
                      
                      {followUp.notes && (
                        <div className="bg-gray-50 p-3 rounded-md mb-3">
                          <p className="text-sm text-gray-700">
                            <strong>Notes:</strong> {followUp.notes}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <ApperIcon name="Calendar" size={16} className={dateStatus.color} />
                          <span className={dateStatus.color}>{dateStatus.text}</span>
                          <span className="text-gray-500">at {format(parseISO(followUp.scheduledDate), 'h:mm a')}</span>
                        </div>
                        
                        <div className="flex items-center gap-1 text-gray-600">
                          <ApperIcon name="User" size={16} />
                          <span>{followUp.contactName}</span>
                        </div>
                        
                        {followUp.dealId && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <ApperIcon name="Target" size={16} />
                            <span>Deal #{followUp.dealId}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {followUp.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleComplete(followUp.Id)}
                        >
                          <ApperIcon name="Check" size={16} />
                          Complete
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(followUp)}
                      >
                        <ApperIcon name="Edit" size={16} />
                        Edit
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(followUp.Id)}
                      >
                        <ApperIcon name="Trash2" size={16} />
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingFollowUp ? 'Edit Follow-up' : 'Add Follow-up'}
              </h2>
              <Button variant="outline" size="sm" onClick={resetForm}>
                <ApperIcon name="X" size={16} />
              </Button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter follow-up title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scheduled Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Method
                  </label>
                  <select
                    value={formData.method}
                    onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="call">Call</option>
                    <option value="email">Email</option>
                    <option value="meeting">Meeting</option>
                    <option value="message">Message</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Name *
                  </label>
                  <Input
                    required
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    placeholder="Enter contact name"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any additional notes or context"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingFollowUp ? 'Update Follow-up' : 'Create Follow-up'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FollowUp;