import { useState, useEffect } from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Select from "@/components/atoms/Select";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { contactsService } from "@/services/api/contactsService";
import { companiesService } from "@/services/api/companiesService";
import { dealsService } from "@/services/api/dealsService";
import { activitiesService } from "@/services/api/activitiesService";
import Chart from "react-apexcharts";
import { format, subMonths, eachMonthOfInterval } from "date-fns";

const Reports = () => {
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [deals, setDeals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState("6months");

  const loadReportData = async () => {
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
      setError(err.message || "Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, []);

  if (loading) {
    return <Loading message="Loading reports..." />;
  }

  if (error) {
    return <Error message={error} onRetry={loadReportData} />;
  }

  // Calculate metrics
  const totalRevenue = deals.filter(d => d.stage === "won").reduce((sum, deal) => sum + deal.value, 0);
  const pipelineValue = deals.filter(d => !["won", "lost"].includes(d.stage)).reduce((sum, deal) => sum + deal.value, 0);
  const conversionRate = deals.length > 0 ? (deals.filter(d => d.stage === "won").length / deals.length * 100) : 0;
  const avgDealSize = deals.filter(d => d.stage === "won").length > 0 
    ? totalRevenue / deals.filter(d => d.stage === "won").length 
    : 0;

  // Generate monthly revenue data
  const months = eachMonthOfInterval({
    start: subMonths(new Date(), 5),
    end: new Date()
  });

  const monthlyRevenue = months.map(month => {
    const monthDeals = deals.filter(deal => {
      if (deal.stage !== "won") return false;
      const dealDate = new Date(deal.updatedAt);
      return dealDate.getMonth() === month.getMonth() && dealDate.getFullYear() === month.getFullYear();
    });
    return {
      month: format(month, "MMM yyyy"),
      revenue: monthDeals.reduce((sum, deal) => sum + deal.value, 0)
    };
  });

  // Deal stage distribution
  const dealStages = [
    { stage: "lead", label: "Lead", count: deals.filter(d => d.stage === "lead").length },
    { stage: "qualified", label: "Qualified", count: deals.filter(d => d.stage === "qualified").length },
    { stage: "proposal", label: "Proposal", count: deals.filter(d => d.stage === "proposal").length },
    { stage: "negotiation", label: "Negotiation", count: deals.filter(d => d.stage === "negotiation").length },
    { stage: "won", label: "Won", count: deals.filter(d => d.stage === "won").length },
    { stage: "lost", label: "Lost", count: deals.filter(d => d.stage === "lost").length }
  ];

  // Top performing contacts
  const contactPerformance = contacts.map(contact => {
    const contactDeals = deals.filter(d => d.contactId === contact.Id);
    const wonDeals = contactDeals.filter(d => d.stage === "won");
    const totalValue = wonDeals.reduce((sum, deal) => sum + deal.value, 0);
    
    return {
      ...contact,
      totalDeals: contactDeals.length,
      wonDeals: wonDeals.length,
      totalValue
    };
  }).filter(c => c.totalDeals > 0).sort((a, b) => b.totalValue - a.totalValue).slice(0, 5);

  // Chart configurations
  const revenueChartOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      fontFamily: "Inter, sans-serif"
    },
    colors: ["#4F46E5"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100]
      }
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: "smooth",
      width: 2
    },
    grid: {
      borderColor: "#f3f4f6",
      strokeDashArray: 4
    },
    xaxis: {
      categories: monthlyRevenue.map(item => item.month),
      labels: {
        style: {
          colors: "#6b7280",
          fontSize: "12px"
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: "#6b7280",
          fontSize: "12px"
        },
        formatter: (value) => `$${(value / 1000).toFixed(0)}k`
      }
    },
    tooltip: {
      y: {
        formatter: (value) => `$${value.toLocaleString()}`
      }
    }
  };

  const pipelineChartOptions = {
    chart: {
      type: "donut",
      fontFamily: "Inter, sans-serif"
    },
    colors: ["#3B82F6", "#7C3AED", "#F59E0B", "#F97316", "#10B981", "#EF4444"],
    labels: dealStages.map(stage => stage.label),
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val.toFixed(1)}%`
    },
    legend: {
      position: "bottom",
      fontSize: "12px"
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%"
        }
      }
    }
  };

  return (
<div className="space-y-6 animate-fadeIn">
      {/* Header */}
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 text-sm">Analyze your sales performance and track key metrics</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-40"
          >
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="12months">Last 12 Months</option>
          </Select>
          <Button variant="secondary" icon="Download">
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs">Total Revenue</p>
              <p className="text-xl font-bold">${totalRevenue.toLocaleString()}</p>
            </div>
            <ApperIcon name="DollarSign" className="w-6 h-6 text-green-200" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs">Pipeline Value</p>
              <p className="text-xl font-bold">${pipelineValue.toLocaleString()}</p>
            </div>
            <ApperIcon name="TrendingUp" className="w-6 h-6 text-blue-200" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-xs">Conversion Rate</p>
              <p className="text-xl font-bold">{conversionRate.toFixed(1)}%</p>
            </div>
            <ApperIcon name="Target" className="w-6 h-6 text-purple-200" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-xs">Avg Deal Size</p>
              <p className="text-xl font-bold">${avgDealSize.toLocaleString()}</p>
            </div>
            <ApperIcon name="BarChart3" className="w-6 h-6 text-pink-200" />
          </div>
        </Card>
      </div>

      {/* Charts */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Monthly Revenue</h2>
            <ApperIcon name="TrendingUp" className="w-4 h-4 text-gray-400" />
          </div>
          <Chart
            options={revenueChartOptions}
            series={[{
              name: "Revenue",
              data: monthlyRevenue.map(item => item.revenue)
            }]}
            type="area"
            height={250}
          />
        </Card>

        {/* Pipeline Distribution */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Deal Pipeline</h2>
            <ApperIcon name="PieChart" className="w-4 h-4 text-gray-400" />
          </div>
          <Chart
            options={pipelineChartOptions}
            series={dealStages.map(stage => stage.count)}
            type="donut"
            height={250}
          />
        </Card>
      </div>

{/* Additional Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Contacts */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Top Performing Contacts</h2>
            <ApperIcon name="Award" className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-3">
            {contactPerformance.map((contact, index) => (
              <div key={contact.Id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-xs">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {contact.firstName} {contact.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {contact.wonDeals} deals won
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 text-sm">
                    ${contact.totalValue.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {contact.totalDeals} total deals
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Summary Stats */}
<Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Summary Statistics</h2>
            <ApperIcon name="BarChart" className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ApperIcon name="Users" className="w-4 h-4 text-blue-500" />
                <span className="text-gray-700 text-sm">Total Contacts</span>
              </div>
              <span className="font-semibold text-gray-900 text-lg">{contacts.length}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ApperIcon name="Building2" className="w-4 h-4 text-green-500" />
                <span className="text-gray-700 text-sm">Companies</span>
              </div>
              <span className="font-semibold text-gray-900 text-lg">{companies.length}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ApperIcon name="Target" className="w-4 h-4 text-purple-500" />
                <span className="text-gray-700 text-sm">Active Deals</span>
              </div>
              <span className="font-semibold text-gray-900 text-lg">
                {deals.filter(d => !["won", "lost"].includes(d.stage)).length}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ApperIcon name="CheckSquare" className="w-4 h-4 text-pink-500" />
                <span className="text-gray-700 text-sm">Completed Tasks</span>
              </div>
              <span className="font-semibold text-gray-900 text-lg">
                {activities.filter(a => a.status === "completed").length}
              </span>
            </div>

            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium text-sm">Success Rate</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                      style={{ width: `${conversionRate}%` }}
                    />
                  </div>
                  <span className="font-semibold text-gray-900 text-sm">{conversionRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Reports;