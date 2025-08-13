import Badge from "@/components/atoms/Badge";

const StatusPill = ({ status, type = "deal" }) => {
  const getStatusConfig = (status, type) => {
    if (type === "deal") {
      switch (status?.toLowerCase()) {
        case "lead":
          return { variant: "info", label: "Lead" };
        case "qualified":
          return { variant: "primary", label: "Qualified" };
        case "proposal":
          return { variant: "warning", label: "Proposal" };
        case "negotiation":
          return { variant: "secondary", label: "Negotiation" };
        case "won":
          return { variant: "success", label: "Won" };
        case "lost":
          return { variant: "danger", label: "Lost" };
        default:
          return { variant: "default", label: status || "Unknown" };
      }
    } else if (type === "activity") {
      switch (status?.toLowerCase()) {
        case "pending":
          return { variant: "warning", label: "Pending" };
        case "completed":
          return { variant: "success", label: "Completed" };
        case "overdue":
          return { variant: "danger", label: "Overdue" };
        default:
          return { variant: "default", label: status || "Unknown" };
      }
    }
    return { variant: "default", label: status || "Unknown" };
  };

  const config = getStatusConfig(status, type);

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
};

export default StatusPill;