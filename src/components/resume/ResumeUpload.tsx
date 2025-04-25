
import { useState } from "react";
import { Upload, FileText, File as FileIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ResumeData } from "@/types/resume";
import { useToast } from "@/hooks/use-toast";

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
      
      // Prepare the request to Gemini API
      const geminiEndpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
      const prompt = `
        I have a resume in ${file.type.includes("pdf") ? "PDF" : "DOCX"} format. 
        Parse the following resume and return ONLY a JSON object with these fields:
        - personalInfo: object with name, email, phone, address, summary
        - education: array of objects with institution, degree, field, startDate, endDate, gpa
        - experience: array of objects with company, position, startDate, endDate, description, location
        - skills: array of skills
        - ugInstitute: string (undergraduate institution name)
        - pgInstitute: string (postgraduate institution name)
        - phdInstitute: number (0 for no, 1 for yes)
        - longevityYears: number (working years count)
        - numberOfJobs: number
        - averageExperience: number (longevity/number of jobs)
        - skillsCount: number
        - achievementsCount: number
        - achievements: array of strings
        - trainingsCount: number
        - trainings: array of strings
        - workshopsCount: number
        - workshops: array of strings
        - researchPapers: array of strings
        - patents: array of strings
        - books: array of strings
        - isJK: number (0 for no, 1 for yes - for J&K resident)
        - projectsCount: number
        - projects: array of strings
        
        Please make sure the format matches exactly, and all fields are included. 
        Don't add any explanations, just return the JSON.
      `;
      
      try {
        // Simulate the actual API call with a delay for demonstration
        // In a real implementation, uncomment the fetch block below
        /*
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
              maxOutputTokens: 2048,
              topP: 0.95,
              topK: 40
            }
          })
        });

        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error.message || "Failed to parse resume");
        }
        
        const parsedContent = data.candidates[0].content.parts[0].text;
        const jsonMatch = parsedContent.match(/```json\n([\s\S]*?)\n```/) || 
                          parsedContent.match(/\{[\s\S]*\}/);
        
        const cleanedJson = jsonMatch ? jsonMatch[1] || jsonMatch[0] : parsedContent;
        const parsedResumeData = JSON.parse(cleanedJson);
        */

        // For demonstration, create sample data that matches our schema
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mock data that matches our schema exactly
        const parsedResumeData: ResumeData = {
          personalInfo: {
            name: "Saksham Gupta",
            email: "2022a6041@mietjammu.in",
            phone: "+91 9876543210",
            address: "Jammu, Jammu and Kashmir, India",
            summary: "Computer Science student at MIET Jammu with experience in full-stack development and machine learning. Passionate about creating innovative solutions and contributing to open-source projects."
          },
          education: [
            {
              institution: "MIET Jammu",
              degree: "B.Tech",
              field: "Computer Science",
              startDate: "2022",
              endDate: "2026",
              gpa: "8.9"
            }
          ],
          experience: [
            {
              company: "TechCorp Inc.",
              position: "Software Engineering Intern",
              startDate: "May 2023",
              endDate: "August 2023",
              description: "Developed a web application using React, TypeScript, and Node.js. Implemented responsive designs and RESTful APIs. Collaborated with cross-functional teams to deliver features on time.",
              location: "Remote"
            },
            {
              company: "AI Solutions Ltd.",
              position: "Machine Learning Intern",
              startDate: "January 2023",
              endDate: "April 2023",
              description: "Worked on image classification models using TensorFlow. Improved model accuracy by 15% through data augmentation and hyperparameter tuning.",
              location: "Jammu, J&K"
            }
          ],
          skills: ["React", "JavaScript", "TypeScript", "Python", "TensorFlow", "Node.js", "MongoDB", "Git", "AWS", "Docker", "HTML/CSS", "UI/UX Design"],
          ugInstitute: "MIET Jammu",
          pgInstitute: "", 
          phdInstitute: 0,
          longevityYears: 1.5,
          numberOfJobs: 2,
          averageExperience: 0.75,
          skillsCount: 12,
          achievementsCount: 3,
          achievements: [
            "Dean's List 2023", 
            "Winner, National Coding Hackathon 2022", 
            "Best Project Award, College Tech Fest 2022"
          ],
          trainingsCount: 2,
          trainings: [
            "Full Stack Development Bootcamp, Udemy",
            "Machine Learning Specialization, Coursera"
          ],
          workshopsCount: 2,
          workshops: [
            "AI/ML Workshop by Google Developers",
            "Cloud Computing Workshop by AWS"
          ],
          researchPapers: [
            "Application of Deep Learning in Medical Image Analysis"
          ],
          patents: [],
          books: [],
          isJK: 1,
          projectsCount: 3,
          projects: [
            "E-Learning Platform with AI Recommendations",
            "Real-time Chat Application with End-to-End Encryption",
            "Smart Home Automation System using IoT"
          ]
        };
        
        // Clear progress interval and set to 100%
        clearInterval(interval);
        setProgress(100);
        
        // Notify user and return data
        setTimeout(() => {
          toast({
            title: "Resume Parsed Successfully",
            description: "The resume information has been extracted. Please review and verify the details.",
          });
          onResumeUploaded(parsedResumeData, file);
          setUploading(false);
          onParsingStateChange(false);
        }, 500);
        
      } catch (apiError) {
        console.error("Error with Gemini API:", apiError);
        setError("Failed to parse resume with Gemini AI. Please try again.");
        clearInterval(interval);
        setUploading(false);
        onParsingStateChange(false);
      }
      
    } catch (error) {
      setError("Failed to parse resume. Please try again.");
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
