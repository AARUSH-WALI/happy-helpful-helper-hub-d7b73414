import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import CandidateDetailsDialog from "./CandidateDetailsDialog";

interface Candidate {
  name: string;
  email: string;
  fitmentScore: number;
}

interface CandidateScoresProps {
  candidates: Candidate[];
}

export default function CandidateScores({ candidates }: CandidateScoresProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
          Candidate Fitment Scores
        </h3>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/users" className="flex items-center gap-2">
            View All
            <ArrowRight size={16} />
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        {candidates.map((candidate) => (
          <div
            key={candidate.email}
            className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all cursor-pointer"
            onClick={() => setSelectedCandidate(candidate)}
          >
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{candidate.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{candidate.email}</p>
              </div>
              <div
                className={`text-lg font-semibold ${
                  candidate.fitmentScore >= 60
                    ? "text-green-600"
                    : "text-yellow-600"
                }`}
              >
                {candidate.fitmentScore.toFixed(1)}%
              </div>
            </div>

            {/* Green Bar under candidates with score greater than 60% */}
            {candidate.fitmentScore >= 60 && (
              <div className="mt-2 w-full bg-green-100 rounded-full h-2.5 dark:bg-green-600">
                <div
                  className="h-2.5 rounded-full bg-green-500"
                  style={{ width: `${candidate.fitmentScore}%` }}
                ></div>
              </div>
            )}

            {/* Yellow Bar under candidates with score less than 60% */}
            {candidate.fitmentScore < 60 && (
              <div className="mt-2 w-full bg-yellow-100 rounded-full h-2.5 dark:bg-yellow-600">
                <div
                  className="h-2.5 rounded-full bg-yellow-500"
                  style={{ width: `${candidate.fitmentScore}%` }}
                ></div>
              </div>
            )}
          </div>
        ))}
      </div>

      <CandidateDetailsDialog
        isOpen={!!selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        candidate={selectedCandidate}
      />
    </div>
  );
}
