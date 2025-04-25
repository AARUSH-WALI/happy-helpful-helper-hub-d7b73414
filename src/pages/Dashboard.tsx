import { useState } from "react";
import { Briefcase, Calendar, Users, FileText } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import VacancyStats from "@/components/dashboard/VacancyStats";
import JobFitmentTable from "@/components/dashboard/JobFitmentTable";
import CandidateScores from "@/components/dashboard/CandidateScores";
import InterviewScheduleDialog from "@/components/dashboard/InterviewScheduleDialog";

const vacancyData = [
  { name: "Jan", value: 12 },
  { name: "Feb", value: 19 },
  { name: "Mar", value: 15 },
  { name: "Apr", value: 23 },
  { name: "May", value: 18 },
  { name: "Jun", value: 15 },
  { name: "Jul", value: 20 },
  { name: "Aug", value: 25 },
  { name: "Sep", value: 15 },
  { name: "Oct", value: 10 },
  { name: "Nov", value: 15 },
  { name: "Dec", value: 20 },
];

const candidates = [
  { name: "Saksham Gupta", email: "2022a6041@mietjammu.in", fitmentScore: 65.5 },
  { name: "Ayush Thakur", email: "ayushthakur1412@gmail.com", fitmentScore: 69.94 },
  { name: "Adishwar Sharma", email: "2021a1045@mietjammu.in", fitmentScore: 72.58 },
  { name: "Garima Saigal", email: "garimasaigal02@gmail.com", fitmentScore: 55.32 },
  { name: "Aarush Wali", email: "2022A6002@mietjammu.in", fitmentScore: 62.45 }
];

const jobRoles = [
  "Professor",
  "Assistant Professor",
  "Associate Professor",
  "Head of Department",
  "Dean",
  "Research Associate",
  "Lab Assistant",
  "Academic Coordinator"
];

const fitCategories = ["Best Fit", "Mid Fit", "Not Fit"];

const mockEmployeeData = [
  { name: "Gandharv Kaloo", role: "Professor", fitment: "Best Fit" },
  { name: "Saksham Gupta", role: "Assistant Professor", fitment: "Best Fit" },
  { name: "Aarush Wali", role: "Associate Professor", fitment: "Mid Fit" },
  { name: "Abhishek Kumar", role: "Professor", fitment: "Not Fit" },
  { name: "Dhruv Gupta", role: "Dean", fitment: "Mid Fit" },
  { name: "Antra Bali", role: "Research Associate", fitment: "Best Fit" },
  { name: "Karan Patel", role: "Lab Assistant", fitment: "Mid Fit" },
  { name: "Rohit Sharma", role: "Academic Coordinator", fitment: "Best Fit" },
  { name: "Ansh Patyal", role: "Professor", fitment: "Mid Fit" },
  { name: "Naman Kumar", role: "Associate Professor", fitment: "Mid Fit" },
  { name: "Archit Singh", role: "Assistant Professor", fitment: "Mid Fit" },
  { name: "Aditya Raina", role: "Professor", fitment: "Best Fit" },
  { name: "Sameer Rizvi", role: "Professor", fitment: "Best Fit" },
  { name: "Sachin Sharma", role: "Professor", fitment: "Mid Fit" },
  { name: "Vansh Kapoor", role: "Assistant Professor", fitment: "Not Fit" },
  { name: "Mohammad Kaif", role: "Professor", fitment: "Best Fit" },
  { name: "Ajay Kumar", role: "Associate Professor", fitment: "Mid Fit" },
  { name: "Gurdeep Singh", role: "Professor", fitment: "Best Fit" },
  { name: "Pankaj Jandiyal", role: "Associate Professor", fitment: "Not Fit" },
  { name: "Akshit Kumar ", role: "Associate Professor", fitment: "Mid Fit" },
  { name: "Pankaj Singh", role: "Professor", fitment: "Not Fit" },
  { name: "Saksham Bamotra", role: "Head of Department", fitment: "Best Fit" },
  { name: "Amit Kumar", role: "Head of Department", fitment: "Mid Fit" },
  { name: "Ajinkey Rahane", role: "Head of Department", fitment: "Not Fit" },
  { name: "Rameshwar Prasad", role: "Professor", fitment: "Mid Fit" },
  { name: "Aryan Pandoh", role: "Dean", fitment: "Best Fit" },
  { name: "Aryan Gupta", role: "Dean", fitment: "Not Fit" },
  { name: "Punya Sharma", role: "Research Associate", fitment: "Mid Fit" },
  { name: "Aakarsh Gupta", role: "Research Associate", fitment: "Not Fit" },
  { name: "Parth Gupta", role: "Dean", fitment: "Mid Fit" },
  { name: "Preetika Sharma", role: "Lab Assistant", fitment: "Best Fit" },
  { name: "Veena Rajput", role: "Lab Assistant", fitment: "Not Fit" },
  { name: "Punya Sharma", role: "Research Associate", fitment: "Mid Fit" },
  { name: "Venika Sharma", role: "Academic Coordinator", fitment: "Best Fit" },
  { name: "Aditya Nanda", role: "Academic Coordinator", fitment: "Mid Fit" },
  { name: "Ajit Singh", role: "Academic Coordinator", fitment: "Not Fit" },
];

export default function Dashboard() {
  const [showInterviews, setShowInterviews] = useState(false);

  return (
    <div className="page-container dark:bg-gray-900">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          value="7"
          title="Job Applications"
          icon={<Users size={40} className="text-white" />}
          color="purple"
          className="shadow-xl"
        />
        
        <StatCard 
          value="4"
          title="Hired Candidates"
          icon={<Briefcase size={40} className="text-white" />}
          color="blue"
          className="relative overflow-hidden shadow-xl"
        >
          {/* <VacancyStats data={vacancyData} /> */}
        </StatCard>
        
        <StatCard 
          value="7"
          title="Resumes for Review"
          icon={<FileText size={40} className="text-white" />}
          color="green"
          className="shadow-xl"
        />
        
        <StatCard 
          value="5"
          title="Scheduled Interviews For Today"
          icon={<Calendar size={40} className="text-blue" />}
          color="rose"
          onClick={() => setShowInterviews(true)}
          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-xl"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="shadow-2xl rounded-lg">
          <JobFitmentTable 
            jobRoles={jobRoles}
            fitCategories={fitCategories}
            employees={mockEmployeeData}
          />
        </div>

        <div className="shadow-2xl rounded-lg">
          <CandidateScores candidates={candidates} />
        </div>
      </div>

      <InterviewScheduleDialog 
        isOpen={showInterviews}
        onClose={() => setShowInterviews(false)}
      />
    </div>
  );
}
