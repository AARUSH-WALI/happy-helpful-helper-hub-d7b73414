
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface CandidateStatusProps {
  approvedCount: number;
  reviewCount: number;
  rejectedCount: number;
}

export default function CandidateStatus({
  approvedCount = 45,
  reviewCount = 30,
  rejectedCount = 25,
}: CandidateStatusProps) {
  const data = [
    { name: "Approved", value: approvedCount, color: "#9b87f5" },
    { name: "Under Review", value: reviewCount, color: "#4da3ff" },
    { name: "Rejected", value: rejectedCount, color: "#ff6b6b" },
  ];

  const COLORS = ["#9b87f5", "#4da3ff", "#ff6b6b"];
  
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0.15 ? (
      <text
        x={x}
        y={y}
        fill="#fff"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">Candidate Status</h2>
      </div>
      <div className="p-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                innerRadius={40}
                dataKey="value"
                strokeWidth={5}
                stroke="#ffffff"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mt-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-400">{approvedCount}</div>
            <div className="text-gray-600">Approved</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-400">{reviewCount}</div>
            <div className="text-gray-600">Under Review</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-red-400">{rejectedCount}</div>
            <div className="text-gray-600">Rejected</div>
          </div>
        </div>

        <div className="space-y-2 mt-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-400"></div>
            <span className="text-sm text-gray-700">Approved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            <span className="text-sm text-gray-700">Under Review</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <span className="text-sm text-gray-700">Rejected</span>
          </div>
        </div>
      </div>
    </div>
  );
}
