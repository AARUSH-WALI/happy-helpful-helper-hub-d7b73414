
import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface PersonalityScores {
  extroversion: number;
  agreeableness: number;
  openness: number;
  neuroticism: number;
  conscientiousness: number;
}

interface PersonalityPieChartProps {
  scores: PersonalityScores;
}

export default function PersonalityPieChart({ scores }: PersonalityPieChartProps) {
  const data = [
    { name: "Extroversion", value: scores.extroversion, color: "#8B5CF6" }, // Purple
    { name: "Agreeableness", value: scores.agreeableness, color: "#10B981" }, // Green
    { name: "Openness", value: scores.openness, color: "#3B82F6" }, // Blue
    { name: "Neuroticism", value: scores.neuroticism, color: "#F59E0B" }, // Amber
    { name: "Conscientiousness", value: scores.conscientiousness, color: "#EC4899" }, // Pink
  ];

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value}%`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Color legend below the chart */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <span 
              className="inline-block w-4 h-4 rounded-full" 
              style={{ backgroundColor: item.color }}
            ></span>
            <span className="text-sm">{item.name}: {item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
