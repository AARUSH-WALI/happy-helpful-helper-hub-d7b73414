
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ResumeUpload from "@/components/resume/ResumeUpload";
import ResumeForm from "@/components/resume/ResumeForm";
import { ResumeData } from "@/types/resume";

export default function Resume() {
  const [activeTab, setActiveTab] = useState("upload");
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [parsedFile, setParsedFile] = useState<File | null>(null);

  const handleResumeUploaded = (data: ResumeData, file: File) => {
    setResumeData(data);
    setParsedFile(file);
    setActiveTab("form");
  };

  const handleParsing = (loading: boolean) => {
    setIsLoading(loading);
  };

  return (
    <div className="page-container p-6">
      <h1 className="text-2xl font-bold mb-6">Resume Parser</h1>
      
      <Card className="shadow-lg">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger 
              value="upload" 
              disabled={isLoading}
              className="text-base py-3"
            >
              Upload Resume
            </TabsTrigger>
            <TabsTrigger 
              value="form" 
              disabled={!resumeData || isLoading} 
              className="text-base py-3"
            >
              Review & Edit
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="p-6">
            <ResumeUpload 
              onResumeUploaded={handleResumeUploaded} 
              onParsingStateChange={handleParsing}
            />
          </TabsContent>
          
          <TabsContent value="form" className="p-6">
            {resumeData ? (
              <ResumeForm 
                resumeData={resumeData} 
                setResumeData={setResumeData} 
                parsedFile={parsedFile}
              />
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">Please upload a resume first</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setActiveTab("upload")}
                >
                  Go to Upload
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
