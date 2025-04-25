import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, ChevronLeft } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  score: number;
  jobRole?: string;
  experience?: string;
  education?: string;
  about?: string;
  personalityScores?: {
    extroversion: number;
    agreeableness: number;
    openness: number;
    neuroticism: number;
    conscientiousness: number;
  };
  profileImage?: string; // Added profileImage field for image path
}

const users: UserProfile[] = [
  {
    id: "1",
    name: "Saksham Gupta",
    email: "2022a6041@mietjammu.in",
    score: 75.89,
    jobRole: "Assistant Professor",
    experience: "3+ Years",
    education: "Ph.D. in Computer Science",
    about: "Experienced educator with a focus on AI and machine learning",
    profileImage: "/images/SakshamGupta.png", // Add image path here
    personalityScores: {
      extroversion: 76,
      agreeableness: 84,
      openness: 69,
      neuroticism: 50,
      conscientiousness: 90
    }
  },
  {
    id: "2",
    name: "Ayush Thakur",
    email: "ayushthakur1412@gmail.com",
    score: 69.94,
    jobRole: "Professor",
    experience: "6+ Years",
    education: "Master of Computer Science",
    about: "Self-experienced Front End Developer with a strong background in software and web development",
    profileImage: "/images/ayush-profile.jpg", // Add image path here
    personalityScores: {
      extroversion: 68,
      agreeableness: 72,
      openness: 85,
      neuroticism: 42,
      conscientiousness: 81
    }
  },
  {
    id: "3",
    name: "Dhruv Gupta",
    email: "2022a6015@mietjammu.in",
    score: 59.99,
    jobRole: "Software Engineer",
    experience: "4+ Years",
    education: "M.Tech in Software Engineering",
    about: "Software engineer with expertise in full-stack development.",
    profileImage: "/images/DhruvGupta.png", // Add image path here
    personalityScores: {
      extroversion: 45,
      agreeableness: 60,
      openness: 55,
      neuroticism: 25,
      conscientiousness: 70
    }
  },
  {
    id: "4",
    name: "Aarush Wali",
    email: "2022a6002@mietjammu.in",
    score: 80.45,
    jobRole: "AI Researcher",
    experience: "2+ Years",
    education: "M.Sc. in AI",
    about: "AI researcher specializing in computer vision and natural language processing.",
    profileImage: "/images/AarushWali.png", // Add image path here
    personalityScores: {
      extroversion: 50,
      agreeableness: 58,
      openness: 80,
      neuroticism: 30,
      conscientiousness: 90
    }
  },
  {
    id: "5",
    name: "Gandharv Kaloo",
    email: "2022a6053@mietjammu.in",
    score: 58.36,
    jobRole: "Data Scientist",
    experience: "5+ Years",
    education: "Ph.D. in Data Science",
    about: "Experienced data scientist working on machine learning and AI projects.",
    profileImage: "/images/GandharvKaloo.png", // Add image path here
    personalityScores: {
      extroversion: 60,
      agreeableness: 70,
      openness: 75,
      neuroticism: 35,
      conscientiousness: 85
    }
  },
  {
    id: "6",
    name: "Antra Bali",
    email: "2022a6010@mietjammu.in",
    score: 64.78,
    jobRole: "AI Engineer",
    experience: "4+ Years",
    education: "M.Tech in AI",
    about: "Passionate about applying AI techniques to solve real-world problems.",
    profileImage: "/images/AntraBali.png", // Add image path here
    personalityScores: {
      extroversion: 55,
      agreeableness: 65,
      openness: 70,
      neuroticism: 28,
      conscientiousness: 80
    }
  },
  {
    id: "7",
    name: "Kamakshi Sharma",
    email: "2022a6024@mietjammu.in",
    score: 43.12,
    jobRole: "Full Stack Developer",
    experience: "3+ Years",
    education: "B.Tech in Computer Science",
    about: "Full stack developer with expertise in frontend and backend technologies.",
    profileImage: "/images/KamakshiSharma.png", // Add image path here
    personalityScores: {
      extroversion: 60,
      agreeableness: 75,
      openness: 65,
      neuroticism: 40,
      conscientiousness: 88
    }
  },
  {
    id: "8",
    name: "Sukriti Chadda",
    email: "anjali.gupta@example.com",
    score: 57.87,
    jobRole: "Web Developer",
    experience: "2+ Years",
    education: "B.Sc. in Computer Science",
    about: "Web developer specializing in responsive and scalable web applications.",
    profileImage: "/images/anjali-profile.jpg", // Add image path here
    personalityScores: {
      extroversion: 50,
      agreeableness: 60,
      openness: 80,
      neuroticism: 22,
      conscientiousness: 72
    }
  },
  {
    id: "9",
    name: "Rohit Sharma",
    email: "2022a6038@mietjammu.in",
    score: 76.94,
    jobRole: "Cloud Architect",
    experience: "6+ Years",
    education: "M.Tech in Cloud Computing",
    about: "Cloud architect specializing in scalable and secure cloud infrastructure.",
    profileImage: "/images/sandeep-profile.jpg", // Add image path here
    personalityScores: {
      extroversion: 62,
      agreeableness: 75,
      openness: 70,
      neuroticism: 35,
      conscientiousness: 85
    }
  }
];

const PersonalityBar = ({
  label,
  value
}: {
  label: string;
  value: number;
}) => (
  <div className="space-y-2">
    <div className="flex justify-between text-sm">
      <span>{label}</span>
      <span>{value}%</span>
    </div>
    <Progress value={value} className="h-2" />
  </div>
);

export default function Users() {
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  return (
    <div className="page-container">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 flex justify-between items-center border-b text-black">
          <h1 className="text-3xl font-bold tracking-tight">User List</h1>
          <Button size="icon" variant="outline">
            <RefreshCw size={16} />
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell
                    className={
                      user.score >= 60
                        ? "text-green-500"
                        : user.score >= 55
                        ? "text-orange-500"
                        : "text-red-500"
                    }
                  >
                    {user.score.toFixed(2)}%
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600"
                        onClick={() => setSelectedUser(user)}
                      >
                        View
                      </Button>
                      <Button size="sm" variant="destructive">
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedUser(null)}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span>Candidate Profile</span>
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="space-y-6">
                <div className="space-y-4">
                  {/* Displaying profile image dynamically based on user */}
                  <div className="aspect-square w-full max-w-[200px] mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                    <img src={selectedUser.profileImage} alt="Profile" className="w-full h object-cover rounded-lg" />
                  </div>

                  <div className="space-y-2 text-center">
                    <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                    <p className="text-gray-500">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Job Role:</h4>
                    <p>{selectedUser.jobRole}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Experience:</h4>
                    <p>{selectedUser.experience}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Education:</h4>
                    <p>{selectedUser.education}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">About Me:</h4>
                    <p className="text-gray-600">{selectedUser.about}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">AI Generated Fitment Score</h3>
                  <div className="text-center p-4 border rounded-lg">
                    <Progress value={selectedUser.score} className="h-2 mb-2" />
                    <div className="text-3xl font-bold text-blue-600">
                      {selectedUser.score.toFixed(2)}%
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Personality Assessment Scores</h4>
                  {selectedUser.personalityScores && (
                    <div className="space-y-4">
                      <PersonalityBar
                        label="Extroversion Score"
                        value={selectedUser.personalityScores.extroversion}
                      />
                      <PersonalityBar
                        label="Agreeableness Score"
                        value={selectedUser.personalityScores.agreeableness}
                      />
                      <PersonalityBar
                        label="Openness Score"
                        value={selectedUser.personalityScores.openness}
                      />
                      <PersonalityBar
                        label="Neuroticism Score"
                        value={selectedUser.personalityScores.neuroticism}
                      />
                      <PersonalityBar
                        label="Conscientiousness Score"
                        value={selectedUser.personalityScores.conscientiousness}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}