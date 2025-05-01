
import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";

type CandidateActivityStatus = "Approved" | "Reviewing" | "Rejected";

interface CandidateActivity {
  id: string;
  name: string;
  title: string;
  position: string;
  department: string;
  status: CandidateActivityStatus;
  updatedAt: Date;
}

export default function RecentActivity() {
  const [activities] = useState<CandidateActivity[]>([
    {
      id: "1",
      name: "Dr. Jane Smith",
      title: "Dr.",
      position: "Assistant Professor",
      department: "Computer Science",
      status: "Approved",
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: "2",
      name: "Dr. Michael Johnson",
      title: "Dr.",
      position: "Associate Professor",
      department: "Physics",
      status: "Reviewing",
      updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    },
    {
      id: "3",
      name: "Dr. Sarah Williams",
      title: "Dr.",
      position: "Professor",
      department: "Mathematics",
      status: "Rejected",
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      id: "4",
      name: "Dr. Robert Brown",
      title: "Dr.",
      position: "Assistant Professor",
      department: "Chemistry",
      status: "Reviewing",
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      id: "5",
      name: "Dr. Emily Davis",
      title: "Dr.",
      position: "Associate Professor",
      department: "Biology",
      status: "Approved",
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
  ]);

  const getStatusBadgeClasses = (status: CandidateActivityStatus) => {
    switch (status) {
      case "Approved":
        return "bg-green-900/20 text-green-400 border-green-700";
      case "Reviewing":
        return "bg-yellow-900/20 text-yellow-400 border-yellow-700";
      case "Rejected":
        return "bg-red-900/20 text-red-400 border-red-700";
      default:
        return "bg-gray-900/20 text-gray-400 border-gray-700";
    }
  };

  const getFormattedTime = (date: Date) => {
    const distance = formatDistanceToNow(date, { addSuffix: false });
    if (distance.includes("day")) {
      if (distance.includes("1 day")) {
        return "1 day ago";
      }
      return `${parseInt(distance)} days ago`;
    }
    return `${parseInt(distance)} hours ago`;
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 flex justify-between items-center border-b border-gray-800">
        <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
        <button className="text-purple-400 hover:text-purple-300 text-sm">
          View All
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-900 text-gray-400 border-b border-gray-800">
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Candidate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Position
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                Time
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {activities.map((activity) => (
              <tr key={activity.id} className="hover:bg-gray-800/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                  {activity.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {activity.position}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {activity.department}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadgeClasses(
                      activity.status
                    )}`}
                  >
                    {activity.status === "Reviewing" ? "Reviewing" : activity.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 text-right">
                  {getFormattedTime(activity.updatedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
