
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";

interface ScheduledInterview {
  name: string;
  role: string;
  time: Date;
}

interface InterviewScheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InterviewScheduleDialog({ isOpen, onClose }: InterviewScheduleDialogProps) {
  // Generate 5 random interviews for demo
  const interviews: ScheduledInterview[] = [
    { name: "Archit Bali", role: "Professor", time: new Date(2025, 3, 18, 9, 0) },
    { name: "Chetna Shree", role: "Assistant Professor", time: new Date(2025, 3, 18, 11, 30) },
    { name: "Ashank Gupta", role: "Associate Professor", time: new Date(2025, 3, 18, 13, 15) },
    { name: "Palak", role: "Research Associate", time: new Date(2025, 3, 18, 14, 45) },
    { name: "Manas Verma", role: "Dean", time: new Date(2025, 3, 18, 16, 0) },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Today's Interview Schedule</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {interviews.map((interview, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="font-medium">{interview.name}</p>
                <p className="text-sm text-gray-500">{interview.role}</p>
              </div>
              <p className="text-sm font-medium">
                {format(interview.time, "hh:mm a")}
              </p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
