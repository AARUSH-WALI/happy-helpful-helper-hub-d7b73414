
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface UserProfile {
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
}

export function useUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select(`
          id,
          name,
          email,
          job_role,
          experience,
          education,
          about,
          fitment_score
        `);

      if (usersError) throw usersError;

      const formattedUsers: UserProfile[] = await Promise.all(
        (usersData || []).map(async (user) => {
          const { data: personalityData } = await supabase
            .from('user_personality_scores')
            .select('*')
            .eq('user_id', user.id)
            .single();

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            score: user.fitment_score || 0,
            jobRole: user.job_role,
            experience: user.experience,
            education: user.education,
            about: user.about,
            personalityScores: personalityData ? {
              extroversion: personalityData.extroversion,
              agreeableness: personalityData.agreeableness,
              openness: personalityData.openness,
              neuroticism: personalityData.neuroticism,
              conscientiousness: personalityData.conscientiousness,
            } : undefined
          };
        })
      );

      setUsers(formattedUsers);
    } catch (error) {
      toast({
        title: "Error fetching users",
        description: "Please try again later.",
        variant: "destructive",
      });
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, isLoading, fetchUsers };
}
