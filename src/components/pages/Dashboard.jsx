import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { contactsService } from "@/services/api/contactsService";
import { reminderService } from "@/services/api/reminderService";
import { followUpService } from "@/services/api/followUpService";
import { dealsService } from "@/services/api/dealsService";
import { activitiesService } from "@/services/api/activitiesService";
import { leadService } from "@/services/api/leadService";
import { toast } from "react-toastify";
import { format } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import MetricCard from "@/components/molecules/MetricCard";
import StatusPill from "@/components/molecules/StatusPill";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Contacts from "@/components/pages/Contacts";
import Deals from "@/components/pages/Deals";
import Activities from "@/components/pages/Activities";
import contactsData from "@/services/mockData/contacts.json";
import coldLeadsData from "@/services/mockData/coldLeads.json";
import remindersData from "@/services/mockData/reminders.json";
import followUpsData from "@/services/mockData/followUps.json";
import dealsData from "@/services/mockData/deals.json";
import activitiesData from "@/services/mockData/activities.json";
import hotLeadsData from "@/services/mockData/hotLeads.json";

const Dashboard = () => {
  const navigate = useNavigate();
const [contacts, setContacts] = useState([]);
const [reminders, setReminders] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [deals, setDeals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [hotLeads, setHotLeads] = useState([]);
  const [coldLeads, setColdLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      
const [contactsData, dealsData, activitiesData, hotLeadsData, coldLeadsData, remindersData, followUpsData] = await Promise.all([
        contactsService.getAll(),
        dealsService.getAll(),
        activitiesService.getAll(),
        leadService.getHotLeads(),
        leadService.getColdLeads(),
        reminderService.getAll(),
        followUpService.getAll()
      ]);
      
      setContacts(contactsData);
setReminders(remindersData);
      setFollowUps(followUpsData);
      setDeals(dealsData);
      setActivities(activitiesData);
      setHotLeads(hotLeadsData);
      setColdLeads(coldLeadsData);
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return <Loading message="Loading dashboard..." />;
  }

  if (error) {
    return <Error message={error} onRetry={loadDashboardData} />;
  }

  // Calculate metrics
  const totalRevenue = deals.filter(d => d.stage === "won").reduce((sum, deal) => sum + deal.value, 0);
  const pipelineValue = deals.filter(d => !["won", "lost"].includes(d.stage)).reduce((sum, deal) => sum + deal.value, 0);
  const conversionRate = deals.length > 0 ? (deals.filter(d => d.stage === "won").length / deals.length * 100) : 0;
  const recentActivities = activities.slice(0, 5);
  
  // Quick actions
  const quickActions = [
    {
      title: "Add Contact",
      description: "Add a new contact to your CRM",
      icon: "UserPlus",
      action: () => navigate("/contacts"),
      gradient: "bg-gradient-to-r from-blue-500 to-blue-600"
    },
    {
      title: "Create Deal",
      description: "Start tracking a new deal",
      icon: "Target",
      action: () => navigate("/deals"),
      gradient: "bg-gradient-to-r from-green-500 to-green-600"
    },
    {
title: "Set Reminder",
      description: "Create a new reminder or task",
      icon: "Bell",
      action: () => navigate("/reminders"),
      gradient: "bg-gradient-to-r from-orange-500 to-orange-600"
    },
    {
      title: "Log Activity",
      description: "Record a new activity or task",
      icon: "Plus",
      action: () => navigate("/activities"),
      gradient: "bg-gradient-to-r from-pink-500 to-pink-600"
}
  ];

  const handleContactClick = (contact) => {
    setSelectedContact(contact);
    setShowContactModal(true);
  };

  const closeContactModal = () => {
    setShowContactModal(false);
    setSelectedContact(null);
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return 'N/A';
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  };
  return (
<div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your sales.</p>
        </div>
        <Button 
          variant="primary" 
          icon="RefreshCw" 
          onClick={loadDashboardData}
          className="shadow-lg"
        >
          Refresh
        </Button>
      </div>

      {/* Metrics Cards */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          change="12% from last month"
          changeType="positive"
          icon="DollarSign"
          gradient="bg-gradient-to-r from-green-500 to-green-600"
        />
        <MetricCard
          title="Pipeline Value"
          value={`$${pipelineValue.toLocaleString()}`}
          change="8% from last month"
          changeType="positive"
          icon="TrendingUp"
          gradient="bg-gradient-to-r from-primary-500 to-secondary-500"
        />
        <MetricCard
          title="Active Deals"
          value={deals.filter(d => !["won", "lost"].includes(d.stage)).length}
          change="3 new this week"
          changeType="positive"
          icon="Target"
          gradient="bg-gradient-to-r from-accent-500 to-accent-600"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${conversionRate.toFixed(1)}%`}
          change="2% from last month"
          changeType="positive"
          icon="TrendingUp"
          gradient="bg-gradient-to-r from-blue-500 to-blue-600"
        />
      </div>
{/* Content Grid */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
<Card className="p-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activities</h2>
              <Button 
                variant="outline" 
                size="small" 
                onClick={() => navigate("/activities")}
              >
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
<div key={activity.Id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                      <ApperIcon 
                        name={
                          activity.type === "call" ? "Phone" :
                          activity.type === "email" ? "Mail" :
                          activity.type === "meeting" ? "Calendar" : "CheckSquare"
                        } 
                        className="w-5 h-5 text-white" 
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.title}
                      </p>
                      <StatusPill status={activity.status} type="activity" />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Due: {format(new Date(activity.dueDate), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
<div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
<div className="space-y-3">
              {quickActions.map((action, index) => (
                <div
key={index}
                  onClick={action.action}
                  className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200 cursor-pointer group transform hover:scale-[1.02]"
                >
                  <div className={`w-10 h-10 ${action.gradient} rounded-lg flex items-center justify-center group-hover:shadow-lg transition-shadow duration-200`}>
                    <ApperIcon name={action.icon} className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors duration-200">
                      {action.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                  </div>
                  <ApperIcon name="ChevronRight" className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors duration-200" />
                </div>
              ))}
            </div>
          </Card>

{/* Summary Stats */}
          <Card className="p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Summary</h2>
<div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ApperIcon name="Users" className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-700">Total Contacts</span>
                </div>
                <span className="font-semibold text-gray-900">{contacts.length}</span>
              </div>
<div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ApperIcon name="Bell" className="w-5 h-5 text-orange-500" />
                  <span className="text-gray-700">Active Reminders</span>
                </div>
                <span className="font-semibold text-gray-900">{reminders.filter(r => r.status === 'pending').length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ApperIcon name="Clock" className="w-5 h-5 text-indigo-500" />
                  <span className="text-gray-700">Follow-ups</span>
                </div>
                <span className="font-semibold text-gray-900">{followUps.filter(f => f.status === 'pending').length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ApperIcon name="Target" className="w-5 h-5 text-purple-500" />
                  <span className="text-gray-700">Active Deals</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {deals.filter(d => !["won", "lost"].includes(d.stage)).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ApperIcon name="CheckSquare" className="w-5 h-5 text-pink-500" />
                  <span className="text-gray-700">Pending Tasks</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {activities.filter(a => a.status === "pending").length}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Hot and Cold Leads Section */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Hot Leads */}
        <Card className="p-6">
<div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <ApperIcon name="TrendingUp" className="w-5 h-5 text-red-500" />
              Hot Leads
            </h2>
            <span className="text-sm text-gray-500">{hotLeads.length} contacts</span>
          </div>
<div className="space-y-3 max-h-96 overflow-y-auto">
{hotLeads.slice(0, 6).map((lead) => {
              const [firstName, lastName] = (lead.name || '').split(' ');
              return (
              <div 
                key={lead.Id} 
                className="flex items-center justify-between p-3 rounded-lg hover:bg-red-50 transition-colors duration-200 cursor-pointer border border-transparent hover:border-red-200"
                onClick={() => handleContactClick({...lead, firstName, lastName})}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {firstName?.[0]?.toUpperCase()}{lastName?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {lead.name}
                    </p>
                    <p className="text-xs text-gray-500">{lead.company}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <StatusPill status={lead.status} type="lead" />
                  <ApperIcon name="ChevronRight" className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              );
            })}
          </div>
        </Card>

        {/* Cold Leads */}
        <Card className="p-6">
<div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <ApperIcon name="TrendingDown" className="w-5 h-5 text-blue-500" />
              Cold Leads
            </h2>
            <span className="text-sm text-gray-500">{coldLeads.length} contacts</span>
          </div>
<div className="space-y-3 max-h-96 overflow-y-auto">
{coldLeads.slice(0, 6).map((lead) => {
              const [firstName, lastName] = (lead.name || '').split(' ');
              return (
              <div 
                key={lead.Id} 
                className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 transition-colors duration-200 cursor-pointer border border-transparent hover:border-blue-200"
                onClick={() => handleContactClick({...lead, firstName, lastName})}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {firstName?.[0]?.toUpperCase()}{lastName?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {lead.name}
                    </p>
                    <p className="text-xs text-gray-500">{lead.company}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <StatusPill status={lead.status} type="lead" />
                  <ApperIcon name="ChevronRight" className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              );
            })}
          </div>
        </Card>
</div>

{/* Reminders and Follow-ups Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Recent Reminders */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <ApperIcon name="Bell" className="w-5 h-5 text-orange-500" />
              Upcoming Reminders
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{reminders.filter(r => r.status === 'pending').length} pending</span>
              <Button variant="outline" size="small" onClick={() => navigate("/reminders")}>
                <ApperIcon name="Calendar" className="w-4 h-4 mr-2" />
                Calendar
              </Button>
            </div>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {reminders.filter(r => r.status === 'pending').slice(0, 5).map((reminder) => (
<div
                key={reminder.Id} 
                className="flex items-center justify-between p-3 rounded-lg hover:bg-orange-50 transition-colors duration-200 cursor-pointer border border-transparent hover:border-orange-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                    <ApperIcon 
                      name={reminder.type === 'call' ? 'Phone' : reminder.type === 'email' ? 'Mail' : reminder.type === 'meeting' ? 'Calendar' : 'CheckSquare'} 
                      className="w-5 h-5 text-white" 
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{reminder.title}</p>
                    <p className="text-xs text-gray-500">{reminder.contactName}</p>
                    <p className="text-xs text-gray-400">
                      {format(new Date(reminder.dueDate), "MMM dd, h:mm a")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    reminder.priority === 'high' ? 'bg-red-100 text-red-700' :
                    reminder.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {reminder.priority}
                  </div>
                  <ApperIcon name="ChevronRight" className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
            {reminders.filter(r => r.status === 'pending').length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <ApperIcon name="Bell" className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p>No pending reminders</p>
              </div>
            )}
          </div>
        </Card>

        {/* Follow-ups */}
<Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <ApperIcon name="Clock" className="w-5 h-5 text-indigo-500" />
              Scheduled Follow-ups
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{followUps.filter(f => f.status === 'pending').length} pending</span>
              <Button variant="outline" size="small" onClick={() => navigate("/follow-ups")}>
                <ApperIcon name="Calendar" className="w-4 h-4 mr-2" />
                Schedule
              </Button>
            </div>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
{followUps.filter(f => f.status === 'pending').slice(0, 4).map((followUp) => (
              <div 
                key={followUp.Id} 
                className="flex items-center justify-between p-3 rounded-lg hover:bg-indigo-50 transition-colors duration-200 cursor-pointer border border-transparent hover:border-indigo-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                    <ApperIcon 
                      name={followUp.method === 'call' ? 'Phone' : followUp.method === 'email' ? 'Mail' : 'Calendar'} 
                      className="w-5 h-5 text-white" 
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{followUp.title}</p>
                    <p className="text-xs text-gray-500">{followUp.contactName}</p>
                    <p className="text-xs text-gray-400">
                      {format(new Date(followUp.scheduledDate), "MMM dd, h:mm a")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    followUp.priority === 'high' ? 'bg-red-100 text-red-700' :
                    followUp.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {followUp.priority}
                  </div>
                  <ApperIcon name="ChevronRight" className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
            {followUps.filter(f => f.status === 'pending').length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <ApperIcon name="Clock" className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p>No scheduled follow-ups</p>
              </div>
            )}
          </div>
        </Card>
      </div>
      {/* Contact Detail Modal */}
      {showContactModal && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
<div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Contact Details</h2>
              <Button 
                variant="ghost" 
                size="small" 
                onClick={closeContactModal}
                className="p-1.5"
              >
                <ApperIcon name="X" className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center space-x-6 mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {selectedContact.firstName?.[0]?.toUpperCase()}{selectedContact.lastName?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedContact.firstName} {selectedContact.lastName}
                  </h3>
                  <p className="text-lg text-gray-600">{selectedContact.title}</p>
                  <p className="text-sm text-gray-500">{selectedContact.company}</p>
                  <div className="mt-2">
                    <StatusPill status={selectedContact.status} type="contact" />
                  </div>
                </div>
              </div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h4>
<div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <ApperIcon name="Mail" className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedContact.email || 'Not provided'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <ApperIcon name="Phone" className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatPhoneNumber(selectedContact.phone)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <ApperIcon name="MapPin" className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedContact.location || 'Not provided'}
                        </p>
                      </div>
                    </div>
                    {selectedContact.linkedin && (
                      <div className="flex items-center space-x-3">
                        <ApperIcon name="ExternalLink" className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">LinkedIn</p>
                          <a 
                            href={selectedContact.linkedin} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-primary-600 hover:text-primary-700"
                          >
                            View Profile
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
<h4 className="text-base font-semibold text-gray-900 mb-3">Additional Details</h4>
                  <div className="space-y-4">
                    {selectedContact.source && (
                      <div>
                        <p className="text-sm text-gray-500">Lead Source</p>
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {selectedContact.source}
                        </p>
                      </div>
                    )}
                    {selectedContact.createdAt && (
                      <div>
                        <p className="text-sm text-gray-500">Added On</p>
                        <p className="text-sm font-medium text-gray-900">
                          {format(new Date(selectedContact.createdAt), "MMM dd, yyyy")}
                        </p>
                      </div>
                    )}
                    {selectedContact.notes && (
                      <div>
                        <p className="text-sm text-gray-500">Notes</p>
                        <p className="text-sm text-gray-700 mt-1 bg-gray-50 p-3 rounded-lg">
                          {selectedContact.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

<div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-gray-200">
                <Button variant="outline" onClick={closeContactModal}>
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    closeContactModal();
                    navigate('/contacts');
                  }}
                >
                  View All Contacts
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;