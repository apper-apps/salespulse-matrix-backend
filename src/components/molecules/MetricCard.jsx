import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";

const MetricCard = ({ title, value, change, changeType, icon, gradient }) => {
  const getChangeColor = () => {
    if (changeType === "positive") return "text-green-600";
    if (changeType === "negative") return "text-red-600";
    return "text-gray-600";
  };

  const getChangeIcon = () => {
    if (changeType === "positive") return "TrendingUp";
    if (changeType === "negative") return "TrendingDown";
    return "Minus";
  };

  return (
<Card className="p-4 hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {change && (
              <div className={`flex items-center text-sm ${getChangeColor()}`}>
                <ApperIcon name={getChangeIcon()} className="w-4 h-4 mr-1" />
                <span>{change}</span>
              </div>
            )}
          </div>
        </div>
        <div className={`p-3 rounded-full ${gradient || "bg-gradient-to-r from-primary-500 to-secondary-500"}`}>
          <ApperIcon name={icon} className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );
};

export default MetricCard;