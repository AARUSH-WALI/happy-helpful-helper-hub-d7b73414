import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ProtectedRoute from "@/components/ProtectedRoute";

const DietaryRestrictionsComponent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    // Load user's existing dietary restrictions
    const loadUserProfile = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('name, dietary_restrictions')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setUserName(data.name || "User");
        setSelectedRestrictions(data.dietary_restrictions || []);
      }
    };

    loadUserProfile();
  }, [user]);

  const dietaryOptions = [
    "Vegetarian",
    "Pescatarian", 
    "Vegan",
    "Dairy-Free",
    "Gluten-Free",
    "Keto",
    "Paleo",
    "Mediterranean",
    "Low-Carb",
    "Low-Fat",
    "High-Protein",
    "Raw Food",
    "Macrobiotic",
    "Whole30",
    "DASH",
    "Flexitarian",
    "Carnivore",
    "Intermittent Fasting"
  ];

  const handleRestrictionToggle = (restriction: string) => {
    setSelectedRestrictions(prev => 
      prev.includes(restriction)
        ? prev.filter(item => item !== restriction)
        : [...prev, restriction]
    );
  };

  const handleNext = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    const { error } = await supabase
      .from('profiles')
      .update({ dietary_restrictions: selectedRestrictions })
      .eq('user_id', user.id);
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Error saving dietary restrictions",
        description: error.message,
      });
    } else {
      navigate("/allergies");
    }
    
    setIsLoading(false);
  };

  const handleBack = () => {
    navigate("/signup");
  };

  const handleSkip = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    const { error } = await supabase
      .from('profiles')
      .update({ dietary_restrictions: [] })
      .eq('user_id', user.id);
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Error updating profile",
        description: error.message,
      });
    } else {
      navigate("/allergies");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-warm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-background/95 backdrop-blur-sm rounded-lg shadow-elegant border border-border/50 p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome, {userName}!
          </h1>
          <p className="text-muted-foreground">
            Let's setup your profile.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            What dietary restrictions do you have?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dietaryOptions.map((option) => (
              <div 
                key={option}
                className="flex items-center space-x-3 p-4 border border-border/50 rounded-lg hover:bg-accent/30 transition-colors cursor-pointer"
                onClick={() => handleRestrictionToggle(option)}
              >
                <Checkbox
                  id={option}
                  checked={selectedRestrictions.includes(option)}
                  onCheckedChange={() => handleRestrictionToggle(option)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <label 
                  htmlFor={option}
                  className="text-foreground font-medium cursor-pointer flex-1"
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="border-border/50 hover:bg-accent/50"
            disabled={isLoading}
          >
            Back
          </Button>
          
          <div className="flex gap-3">
            <Button 
              variant="ghost" 
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground"
              disabled={isLoading}
            >
              Skip
            </Button>
            <Button 
              variant="hero" 
              onClick={handleNext}
              className="px-8"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Next →"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DietaryRestrictions = () => (
  <ProtectedRoute>
    <DietaryRestrictionsComponent />
  </ProtectedRoute>
);

export default DietaryRestrictions;