import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import MetricCard from "@/components/molecules/MetricCard";
import StatusPill from "@/components/molecules/StatusPill";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { contactsService } from "@/services/api/contactsService";
import { companiesService } from "@/services/api/companiesService";
import { dealsService } from "@/services/api/dealsService";
import { activitiesService } from "@/services/api/activitiesService";
import { toast } from "react-toastify";
import { format } from "date-fns";

const Dashboard = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [deals, setDeals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [contactsData, companiesData, dealsData, activitiesData] = await Promise.all([
        contactsService.getAll(),
        companiesService.getAll(),
        dealsService.getAll(),
        activitiesService.getAll()
      ]);
      
      setContacts(contactsData);
      setCompanies(companiesData);
      setDeals(dealsData);
      setActivities(activitiesData);
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
      title: "Add Company",
      description: "Register a new company",
      icon: "Building2",
      action: () => navigate("/companies"),
      gradient: "bg-gradient-to-r from-purple-500 to-purple-600"
    },
    {
      title: "Log Activity",
      description: "Record a new activity or task",
      icon: "Plus",
      action: () => navigate("/activities"),
      gradient: "bg-gradient-to-r from-pink-500 to-pink-600"
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <Card className="p-6">
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
                <div key={activity.Id} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
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
        <div>
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="space-y-4">
              {quickActions.map((action, index) => (
                <div
                  key={index}
                  onClick={action.action}
                  className="flex items-start space-x-4 p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200 cursor-pointer group transform hover:scale-[1.02]"
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ApperIcon name="Users" className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-700">Total Contacts</span>
                </div>
                <span className="font-semibold text-gray-900">{contacts.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ApperIcon name="Building2" className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Companies</span>
                </div>
                <span className="font-semibold text-gray-900">{companies.length}</span>
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
    </div>
  );
};

export default Dashboard;