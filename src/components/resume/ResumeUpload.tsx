
import { useState } from "react";
import { Upload, FileText, File as FileIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ResumeData } from "@/types/resume";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ResumeUploadProps {
  onResumeUploaded: (data: ResumeData, file: File) => void;
  onParsingStateChange: (loading: boolean) => void;
}

export default function ResumeUpload({ onResumeUploaded, onParsingStateChange }: ResumeUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  // Note: In production, this key should be stored securely on your backend
  const GEMINI_API_KEY = "AIzaSyAUyQ3aCQujGFpfE-2vPtOzIXJaeM15e00";

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (uploadedFile: File) => {
    setError(null);
    
    // Check file type
    const validTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!validTypes.includes(uploadedFile.type)) {
      setError("Please upload a valid PDF or Word document");
      return;
    }
    
    // Check file size (10MB max)
    if (uploadedFile.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit");
      return;
    }
    
    setFile(uploadedFile);
  };

  const getFileIcon = () => {
    if (!file) return <Upload size={40} />;
    
    switch(file.type) {
      case "application/pdf":
        return <FileText size={40} className="text-red-500" />;
      case "application/msword":
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return <FileIcon size={40} className="text-blue-500" />;
      default:
        return <FileIcon size={40} />;
    }
  };

  const parseResume = async () => {
    if (!file) return;
    
    try {
      setUploading(true);
      onParsingStateChange(true);
      setError(null);
      
      // Start progress indication
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      // Convert file to base64 for sending to Gemini API
      const fileBase64 = await readFileAsBase64(file);
      
      // Use Gemini 1.5 Pro for better document processing (like in your Flask app)
      const geminiEndpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";
      
      // Craft a prompt that will work well for resume parsing
      const prompt = `
        Extract structured information from the following resume and return it in JSON format.
        Use double quotes for all keys and string values.
        
        Extract all of the following fields:
        
        - personalInfo: object with name, email, phone, address, summary
        - education: array of objects with institution, degree, field, startDate, endDate, gpa
        - experience: array of objects with company, position, startDate, endDate, description, location
        - skills: array of skills as strings
        - UG_InstituteName: string (undergraduate institution name)
        - PG_InstituteName: string (postgraduate institution name)
        - PhD_Institute: number (0 for no, 1 for yes)
        - Longevity_Years: number (working years count)
        - No_of_Jobs: number
        - Experience_Average: number (Longevity_Years / No_of_Jobs)
        - Skills_No: number
        - Achievements_No: number
        - Achievements: array of strings
        - Trainings_No: number
        - Trainings: array of strings
        - Workshops_No: number
        - Workshops_No: array of strings
        - Research_Papers: array of strings
        - Patents: array of strings
        - Books: array of strings
        - State_JK: number (0 for no, 1 for yes - for J&K resident)
        - Projects_No: number
        - Projects: array of strings
        - Best_Fit_For: string (suggest a Computer Science job role suitable for the candidate)
        
        For locations, check if it mentions Jammu, Kashmir, or J&K and set State_JK to 1 if it does.
        
        Return only the JSON with no additional explanation or markdown formatting.
      `;
      
      try {
        // Make the actual API call to Gemini
        const response = await fetch(`${geminiEndpoint}?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  { inlineData: { mimeType: file.type, data: fileBase64 } }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 4096,
              topP: 0.95,
              topK: 40
            }
          })
        });

        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error.message || "Failed to parse resume");
        }
        
        // Extract JSON from the response
        const parsedContent = data.candidates[0].content.parts[0].text;
        
        // Try multiple regex patterns to extract the JSON
        const jsonMatches = [
          // Match JSON enclosed in code blocks
          parsedContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/),
          // Match JSON enclosed in brackets
          parsedContent.match(/(\{[\s\S]*\})/),
          // Fallback to the whole response
          { 1: parsedContent }
        ];
        
        // Find the first successful match
        let jsonText = null;
        for (const match of jsonMatches) {
          if (match && match[1]) {
            jsonText = match[1].trim();
            break;
          }
        }
        
        if (!jsonText) {
          throw new Error("Could not extract JSON from the response");
        }
        
        // Parse the JSON
        let parsedResumeData;
        try {
          parsedResumeData = JSON.parse(jsonText);
        
          // Map received data to match ResumeData interface
          const mappedData: ResumeData = {
            personalInfo: parsedResumeData.personalInfo || {
              name: "",
              email: "",
              phone: "",
              address: "",
              summary: ""
            },
            education: parsedResumeData.education || [],
            experience: parsedResumeData.experience || [],
            skills: parsedResumeData.skills || [],
            ugInstitute: parsedResumeData.UG_InstituteName || "",
            pgInstitute: parsedResumeData.PG_InstituteName || "",
            phdInstitute: parsedResumeData.PhD_Institute || 0,
            longevityYears: parsedResumeData.Longevity_Years || 0,
            numberOfJobs: parsedResumeData.No_of_Jobs || 0,
            averageExperience: parsedResumeData.Experience_Average || 0,
            skillsCount: parsedResumeData.Skills_No || 0,
            achievementsCount: parsedResumeData.Achievements_No || 0,
            achievements: parsedResumeData.Achievements || [],
            trainingsCount: parsedResumeData.Trainings_No || 0,
            trainings: parsedResumeData.Trainings || [],
            workshopsCount: parsedResumeData.Workshops_No || 0,
            workshops: parsedResumeData.Workshops || [],
            researchPapers: parsedResumeData.Research_Papers || [],
            patents: parsedResumeData.Patents || [],
            books: parsedResumeData.Books || [],
            isJK: parsedResumeData.State_JK || 0,
            projectsCount: parsedResumeData.Projects_No || 0,
            projects: parsedResumeData.Projects || [],
            bestFitFor: parsedResumeData.Best_Fit_For || ""
          };

          // Store resume data in Supabase - FIX: Correct the insert syntax
          const { data: resumeData, error: insertError } = await supabase
            .from('candidate_resume')
            .insert({
              education: mappedData.education,
              experience: mappedData.experience,
              personal_info: mappedData.personalInfo,
              email: mappedData.personalInfo.email,
              phd_institute: mappedData.phdInstitute,
              best_fit_for: mappedData.bestFitFor,
              skills: mappedData.skills.join(', '),
              skills_no: mappedData.skillsCount,
              achievements: mappedData.achievements.join(', '),
              achievements_no: mappedData.achievementsCount,
              projects: mappedData.projects.join(', '),
              projects_no: mappedData.projectsCount,
              longevity_years: mappedData.longevityYears,
              number_of_jobs: mappedData.numberOfJobs,
              experience_average: mappedData.averageExperience,
              trainings: mappedData.trainingsCount,
              workshops: mappedData.workshopsCount,
              ug_institute_name: mappedData.ugInstitute,
              pg_institute_name: mappedData.pgInstitute,
              state_jk: mappedData.isJK === 1,
              total_papers: mappedData.researchPapers?.length || 0,
              total_patents: mappedData.patents?.length || 0,
              books: mappedData.books?.length || 0
            })
            .select()
            .single();

          if (insertError) throw insertError;

          // Send personality test invitation email
          const { error: inviteError } = await supabase.functions.invoke('send-personality-test-invite', {
            body: {
              resumeId: resumeData.id,
              email: mappedData.personalInfo.email,
              name: mappedData.personalInfo.name,
              personalityTestUrl: 'http://localhost:5173/' // Replace with your actual URL
            }
          });

          if (inviteError) throw inviteError;

          // Clear progress interval and set to 100%
          clearInterval(interval);
          setProgress(100);
          
          // Notify user and return data
          setTimeout(() => {
            toast({
              title: "Resume Processed Successfully",
              description: "The resume has been parsed and the candidate has been notified.",
            });
            onResumeUploaded(mappedData, file);
            setUploading(false);
            onParsingStateChange(false);
          }, 500);
        } catch (jsonError) {
          console.error("Error parsing JSON:", jsonError);
          console.error("Raw JSON text:", jsonText);
          throw new Error("Invalid JSON response from API");
        }
      } catch (error) {
        clearInterval(interval);
        setError("Failed to process resume. Please try again.");
        setUploading(false);
        onParsingStateChange(false);
        console.error("Error parsing resume:", error);
      }
    } catch (error) {
      setError("Failed to process resume. Please try again.");
      setUploading(false);
      onParsingStateChange(false);
      console.error("Error parsing resume:", error);
    }
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Extract base64 data without the prefix
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to read file as base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const sendPersonalityTestInvite = async (parsedResumeData: ResumeData) => {
    try {
      const { data, error } = await supabase
        .from('candidate_resume')
        .select('id')
        .eq('best_fit_for', parsedResumeData.bestFitFor)
        .single();

      if (error) throw error;

      await supabase.functions.invoke('send-personality-test-invite', {
        body: JSON.stringify({
          resumeId: data.id,
          email: parsedResumeData.personalInfo.email,
          name: parsedResumeData.personalInfo.name,
          personalityTestUrl: 'http://localhost:5173/' // Replace with your actual URL
        })
      });
    } catch (error) {
      console.error('Failed to send personality test invite:', error);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        className={`border-2 border-dashed rounded-lg p-10 w-full text-center cursor-pointer transition-colors
          ${dragging ? 'bg-purple-50 border-purple-400' : 'bg-gray-50 border-gray-300'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <input
          id="file-upload"
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
        />
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 flex items-center justify-center bg-purple-50 rounded-full">
            {getFileIcon()}
          </div>
          
          <div>
            {!file && (
              <>
                <p className="text-lg font-medium mb-2">Drop your resume here or click to browse</p>
                <p className="text-sm text-gray-500">Supports PDF, DOC, DOCX (Max 10MB)</p>
              </>
            )}
            
            {file && (
              <div className="mt-2">
                <p className="text-lg font-medium">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mt-4 w-full">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {file && !uploading && (
        <div className="mt-6 flex gap-4">
          <Button 
            variant="outline" 
            onClick={() => { setFile(null); setError(null); }}
          >
            Choose Different File
          </Button>
          <Button 
            onClick={parseResume}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Parse Resume
          </Button>
        </div>
      )}
      
      {uploading && (
        <div className="mt-6 w-full">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Parsing resume...</span>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
    </div>
  );
}
