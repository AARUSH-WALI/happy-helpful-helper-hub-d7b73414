
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { toast as sonnerToast } from 'sonner';

export type PersonalityScores = {
  extroversion: number;
  agreeableness: number;
  openness: number;
  neuroticism: number;
  conscientiousness: number;
};

export type TestResults = {
  token: string;
  name: string;
  email: string;
  fitmentScore: number;
  personalityScores: PersonalityScores;
};

export type InviteParams = {
  email: string;
  name: string;
};

export function usePersonalityTest() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const submitTestResults = async (results: TestResults) => {
    try {
      setIsSubmitting(true);
      
      // Calculate the overall fitment score if not provided
      if (!results.fitmentScore) {
        const scores = Object.values(results.personalityScores);
        results.fitmentScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      }

      // Submit results to the edge function
      const { error } = await supabase.functions.invoke('send-personality-test-invite', {
        body: {
          testResults: results
        }
      });

      if (error) {
        throw error;
      }

      // Show success message
      toast({
        title: "Test submitted successfully",
        description: "Your personality test results have been recorded.",
      });
      
      // Also show a toast message using sonner
      sonnerToast.success("Test submitted successfully");
      
      return true;
    } catch (error) {
      console.error('Error submitting test results:', error);
      
      toast({
        title: "Failed to submit test",
        description: "Please try again later.",
        variant: "destructive"
      });
      
      sonnerToast.error("Failed to submit test");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendTestInvite = async ({ email, name }: InviteParams) => {
    try {
      setIsSending(true);
      
      // Determine the appropriate test URL based on current environment
      const baseUrl = window.location.origin; 
      const personalityTestUrl = `${baseUrl}/personality-test`;
      
      // Send invitation via edge function
      const { data, error } = await supabase.functions.invoke('send-personality-test-invite', {
        body: {
          email,
          name,
          personalityTestUrl
        }
      });

      if (error) {
        throw error;
      }

      // Show success message
      toast({
        title: "Invitation sent",
        description: `A personality test invitation has been sent to ${email}.`,
      });
      
      sonnerToast.success("Invitation sent successfully");
      return true;
    } catch (error) {
      console.error('Error sending test invitation:', error);
      
      toast({
        title: "Failed to send invitation",
        description: "Please try again later.",
        variant: "destructive"
      });
      
      sonnerToast.error("Failed to send invitation");
      return false;
    } finally {
      setIsSending(false);
    }
  };

  return {
    isSubmitting,
    isSending,
    submitTestResults,
    sendTestInvite
  };
}
