
import { CheckCircle, Clock, FileText, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    positive: boolean;
  };
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  className,
}) => {
  return (
    <Card className={cn("shadow-sm border-gray-100", className)}>
      <CardContent className="flex items-center p-6">
        <div className="h-12 w-12 rounded-full flex items-center justify-center bg-gray-100 text-helper mr-4">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
          {trend && (
            <p
              className={cn(
                "text-xs flex items-center mt-1",
                trend.positive ? "text-green-600" : "text-red-600"
              )}
            >
              <TrendingUp size={14} className="mr-1" />
              {trend.value} {trend.positive ? "increase" : "decrease"}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const SummaryStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        title="Tasks Completed"
        value="16"
        icon={<CheckCircle size={24} />}
        trend={{ value: "12%", positive: true }}
      />
      <StatCard
        title="Focus Time Today"
        value="2h 15m"
        icon={<Clock size={24} />}
        trend={{ value: "30m", positive: true }}
      />
      <StatCard
        title="Notes Created"
        value="5"
        icon={<FileText size={24} />}
      />
    </div>
  );
};
