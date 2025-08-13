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
import { reminderService } from '@/services/api/reminderService';
import { format, parseISO, isToday, isTomorrow, isPast, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [filteredReminders, setFilteredReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    contactName: '',
    type: 'task'
  });

  useEffect(() => {
    fetchReminders();
  }, []);

  useEffect(() => {
    filterReminders();
  }, [reminders, searchTerm, filterStatus, filterPriority, selectedDate, viewMode]);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const data = await reminderService.getAll();
      setReminders(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch reminders');
      toast.error('Failed to fetch reminders');
    } finally {
      setLoading(false);
    }
  };

  const filterReminders = () => {
    let filtered = [...reminders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(reminder =>
        reminder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reminder.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reminder.contactName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(reminder => reminder.status === filterStatus);
    }

    // Priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(reminder => reminder.priority === filterPriority);
    }

    // Date filter for calendar view
    if (viewMode === 'calendar') {
      filtered = filtered.filter(reminder => 
        isSameDay(parseISO(reminder.dueDate), selectedDate)
      );
    }

    setFilteredReminders(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingReminder) {
        await reminderService.update(editingReminder.Id, formData);
        toast.success('Reminder updated successfully');
      } else {
        await reminderService.create(formData);
        toast.success('Reminder created successfully');
      }
      
      fetchReminders();
      resetForm();
    } catch (err) {
      toast.error('Failed to save reminder');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      try {
        await reminderService.delete(id);
        toast.success('Reminder deleted successfully');
        fetchReminders();
      } catch (err) {
        toast.error('Failed to delete reminder');
      }
    }
  };

  const handleEdit = (reminder) => {
    setEditingReminder(reminder);
    setFormData({
      title: reminder.title,
      description: reminder.description,
      dueDate: format(parseISO(reminder.dueDate), "yyyy-MM-dd'T'HH:mm"),
      priority: reminder.priority,
      contactName: reminder.contactName,
      type: reminder.type
    });
    setShowForm(true);
  };

  const handleComplete = async (id) => {
    try {
      await reminderService.update(id, { status: 'completed' });
      toast.success('Reminder marked as completed');
      fetchReminders();
    } catch (err) {
      toast.error('Failed to update reminder');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      contactName: '',
      type: 'task'
    });
    setEditingReminder(null);
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

  const getDateStatus = (dueDate) => {
    const date = parseISO(dueDate);
    if (isPast(date) && !isToday(date)) return { text: 'Overdue', color: 'text-red-600' };
    if (isToday(date)) return { text: 'Today', color: 'text-orange-600' };
    if (isTomorrow(date)) return { text: 'Tomorrow', color: 'text-blue-600' };
    return { text: format(date, 'MMM d, yyyy'), color: 'text-gray-600' };
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'call': return 'Phone';
      case 'email': return 'Mail';
      case 'meeting': return 'Users';
      case 'task': return 'CheckSquare';
      default: return 'Bell';
    }
  };

  // Calendar functions
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const getRemindersForDate = (date) => {
    return reminders.filter(reminder => 
      isSameDay(parseISO(reminder.dueDate), date)
    );
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={fetchReminders} />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reminders</h1>
          <p className="text-gray-600 mt-1">Manage your tasks and reminders</p>
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
            Add Reminder
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search reminders..."
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
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ApperIcon name="Clock" size={16} />
            <span>{filteredReminders.length} reminders</span>
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
                const dayReminders = getRemindersForDate(day);
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
                      {dayReminders.length > 0 && (
                        <div className="flex justify-center mt-1">
                          <span className={`w-2 h-2 rounded-full ${
                            isSelected ? 'bg-white' : 'bg-blue-500'
                          }`} />
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
              {filteredReminders.length === 0 ? (
                <p className="text-gray-500 text-sm">No reminders for this date</p>
              ) : (
                filteredReminders.map(reminder => (
                  <div key={reminder.Id} className="p-2 border rounded-md hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{reminder.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {format(parseISO(reminder.dueDate), 'h:mm a')}
                        </p>
                      </div>
                      <Badge className={getPriorityColor(reminder.priority)}>
                        {reminder.priority}
                      </Badge>
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
          {filteredReminders.length === 0 ? (
            <Empty 
              title="No reminders found"
              description="Create your first reminder to get started"
              action={
                <Button onClick={() => setShowForm(true)}>
                  <ApperIcon name="Plus" size={16} />
                  Add Reminder
                </Button>
              }
            />
          ) : (
            filteredReminders.map(reminder => {
              const dateStatus = getDateStatus(reminder.dueDate);
              
              return (
                <Card key={reminder.Id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <ApperIcon name={getTypeIcon(reminder.type)} size={20} className="text-gray-600" />
                        <h3 className="text-lg font-semibold text-gray-900">{reminder.title}</h3>
                        <Badge className={getPriorityColor(reminder.priority)}>
                          {reminder.priority}
                        </Badge>
                        <Badge className={getStatusColor(reminder.status)}>
                          {reminder.status}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{reminder.description}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <ApperIcon name="Clock" size={16} className={dateStatus.color} />
                          <span className={dateStatus.color}>{dateStatus.text}</span>
                          <span className="text-gray-500">at {format(parseISO(reminder.dueDate), 'h:mm a')}</span>
                        </div>
                        
                        {reminder.contactName && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <ApperIcon name="User" size={16} />
                            <span>{reminder.contactName}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1 text-gray-600">
                          <ApperIcon name="Tag" size={16} />
                          <span className="capitalize">{reminder.type}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {reminder.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleComplete(reminder.Id)}
                        >
                          <ApperIcon name="Check" size={16} />
                          Complete
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(reminder)}
                      >
                        <ApperIcon name="Edit" size={16} />
                        Edit
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(reminder.Id)}
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
          <Card className="w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingReminder ? 'Edit Reminder' : 'Add Reminder'}
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
                  placeholder="Enter reminder title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
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
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="task">Task</option>
                    <option value="call">Call</option>
                    <option value="email">Email</option>
                    <option value="meeting">Meeting</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name
                </label>
                <Input
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  placeholder="Enter contact name"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingReminder ? 'Update Reminder' : 'Create Reminder'}
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

export default Reminders;