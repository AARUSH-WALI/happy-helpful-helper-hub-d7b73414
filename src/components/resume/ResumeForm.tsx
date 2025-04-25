
import { useState } from "react";
import { FileText, Trash, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ResumeData, Education, Experience } from "@/types/resume";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ResumeFormProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData | null>>;
  parsedFile: File | null;
}

export default function ResumeForm({ resumeData, setResumeData, parsedFile }: ResumeFormProps) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  
  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setResumeData({
      ...resumeData,
      personalInfo: {
        ...resumeData.personalInfo,
        [name]: value
      }
    });
  };
  
  const handleEducationChange = (index: number, field: keyof Education, value: string) => {
    const updatedEducation = [...resumeData.education];
    updatedEducation[index] = { ...updatedEducation[index], [field]: value };
    
    setResumeData({
      ...resumeData,
      education: updatedEducation
    });
  };
  
  const handleExperienceChange = (index: number, field: keyof Experience, value: string) => {
    const updatedExperience = [...resumeData.experience];
    updatedExperience[index] = { ...updatedExperience[index], [field]: value };
    
    setResumeData({
      ...resumeData,
      experience: updatedExperience
    });
  };

  const handleStringArrayChange = (field: keyof ResumeData, value: string) => {
    const array = value.split(',').map(item => item.trim()).filter(Boolean);
    
    setResumeData({
      ...resumeData,
      [field]: array,
      [`${field}Count` as keyof ResumeData]: array.length
    });
  };
  
  const handleNumberChange = (field: keyof ResumeData, value: string) => {
    const numValue = Number(value);
    
    setResumeData({
      ...resumeData,
      [field]: numValue
    });
    
    // If we're changing numberOfJobs or longevityYears, update averageExperience
    if (field === 'numberOfJobs' || field === 'longevityYears') {
      const longevity = field === 'longevityYears' ? numValue : resumeData.longevityYears;
      const jobs = field === 'numberOfJobs' ? numValue : resumeData.numberOfJobs;
      
      const avgExp = jobs > 0 ? longevity / jobs : 0;
      
      setResumeData(prev => ({
        ...prev!,
        averageExperience: parseFloat(avgExp.toFixed(2))
      }));
    }
  };
  
  const handleRadioChange = (field: keyof ResumeData, value: string) => {
    setResumeData({
      ...resumeData,
      [field]: Number(value)
    });
  };
  
  const addEducation = () => {
    setResumeData({
      ...resumeData,
      education: [
        ...resumeData.education,
        { institution: "", degree: "" }
      ]
    });
  };
  
  const removeEducation = (index: number) => {
    const updatedEducation = [...resumeData.education];
    updatedEducation.splice(index, 1);
    
    setResumeData({
      ...resumeData,
      education: updatedEducation
    });
  };
  
  const addExperience = () => {
    setResumeData({
      ...resumeData,
      experience: [
        ...resumeData.experience,
        { company: "", position: "" }
      ]
    });
  };
  
  const removeExperience = (index: number) => {
    const updatedExperience = [...resumeData.experience];
    updatedExperience.splice(index, 1);
    
    setResumeData({
      ...resumeData,
      experience: updatedExperience
    });
  };
  
  const handleSkillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skillsText = e.target.value;
    const skillsArray = skillsText.split(',').map(skill => skill.trim()).filter(Boolean);
    
    setResumeData({
      ...resumeData,
      skills: skillsArray,
      skillsCount: skillsArray.length
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // In a real application, you would send the data to your backend here
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Candidate data saved",
        description: "The resume information has been successfully saved.",
      });
    } catch (error) {
      console.error("Error saving resume data:", error);
      toast({
        variant: "destructive",
        title: "Failed to save data",
        description: "There was an error saving the resume information.",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* File Information */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
        <FileText size={24} className="text-purple-600" />
        <div>
          <p className="font-medium">{parsedFile?.name}</p>
          <p className="text-sm text-gray-500">
            {parsedFile && `${(parsedFile.size / (1024 * 1024)).toFixed(2)} MB`}
          </p>
        </div>
      </div>
      
      {/* Personal Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                name="name" 
                value={resumeData.personalInfo.name} 
                onChange={handlePersonalInfoChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                value={resumeData.personalInfo.email} 
                onChange={handlePersonalInfoChange}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                name="phone" 
                value={resumeData.personalInfo.phone} 
                onChange={handlePersonalInfoChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input 
                id="address" 
                name="address" 
                value={resumeData.personalInfo.address || ''} 
                onChange={handlePersonalInfoChange}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="summary">Professional Summary</Label>
            <Textarea 
              id="summary" 
              name="summary" 
              value={resumeData.personalInfo.summary || ''} 
              onChange={handlePersonalInfoChange}
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Educational Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Educational Institutions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ugInstitute">UG Institute</Label>
              <Input 
                id="ugInstitute" 
                value={resumeData.ugInstitute || ''} 
                onChange={(e) => setResumeData({...resumeData, ugInstitute: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pgInstitute">PG Institute</Label>
              <Input 
                id="pgInstitute" 
                value={resumeData.pgInstitute || ''} 
                onChange={(e) => setResumeData({...resumeData, pgInstitute: e.target.value})}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>PhD Institute</Label>
            <RadioGroup 
              value={resumeData.phdInstitute.toString()} 
              onValueChange={(value) => handleRadioChange('phdInstitute', value)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="0" id="phd-no" />
                <Label htmlFor="phd-no">No</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="phd-yes" />
                <Label htmlFor="phd-yes">Yes</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label>J&K Resident</Label>
            <RadioGroup 
              value={resumeData.isJK.toString()} 
              onValueChange={(value) => handleRadioChange('isJK', value)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="0" id="jk-no" />
                <Label htmlFor="jk-no">No</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="jk-yes" />
                <Label htmlFor="jk-yes">Yes</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>
      
      {/* Education */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle>Education</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addEducation}>
            <Plus className="mr-1 h-4 w-4" /> Add Education
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {resumeData.education.map((edu, index) => (
            <div key={index} className="space-y-4">
              {index > 0 && <Separator className="my-4" />}
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Education #{index + 1}</h4>
                {resumeData.education.length > 1 && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeEducation(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`edu-institution-${index}`}>Institution</Label>
                  <Input 
                    id={`edu-institution-${index}`}
                    value={edu.institution} 
                    onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`edu-degree-${index}`}>Degree</Label>
                  <Input 
                    id={`edu-degree-${index}`}
                    value={edu.degree} 
                    onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`edu-field-${index}`}>Field of Study</Label>
                  <Input 
                    id={`edu-field-${index}`}
                    value={edu.field || ''} 
                    onChange={(e) => handleEducationChange(index, 'field', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`edu-gpa-${index}`}>GPA</Label>
                  <Input 
                    id={`edu-gpa-${index}`}
                    value={edu.gpa || ''} 
                    onChange={(e) => handleEducationChange(index, 'gpa', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`edu-start-${index}`}>Start Date</Label>
                  <Input 
                    id={`edu-start-${index}`}
                    value={edu.startDate || ''} 
                    onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`edu-end-${index}`}>End Date</Label>
                  <Input 
                    id={`edu-end-${index}`}
                    value={edu.endDate || ''} 
                    onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
          
          {resumeData.education.length === 0 && (
            <div className="text-center py-4">
              <p className="text-gray-500">No education entries found</p>
              <Button 
                type="button" 
                variant="outline" 
                className="mt-2"
                onClick={addEducation}
              >
                Add Education
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Experience */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle>Work Experience</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addExperience}>
            <Plus className="mr-1 h-4 w-4" /> Add Experience
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {resumeData.experience.map((exp, index) => (
            <div key={index} className="space-y-4">
              {index > 0 && <Separator className="my-4" />}
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Experience #{index + 1}</h4>
                {resumeData.experience.length > 1 && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeExperience(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`exp-company-${index}`}>Company</Label>
                  <Input 
                    id={`exp-company-${index}`}
                    value={exp.company} 
                    onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`exp-position-${index}`}>Position</Label>
                  <Input 
                    id={`exp-position-${index}`}
                    value={exp.position} 
                    onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`exp-location-${index}`}>Location</Label>
                  <Input 
                    id={`exp-location-${index}`}
                    value={exp.location || ''} 
                    onChange={(e) => handleExperienceChange(index, 'location', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`exp-start-${index}`}>Start Date</Label>
                  <Input 
                    id={`exp-start-${index}`}
                    value={exp.startDate || ''} 
                    onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`exp-end-${index}`}>End Date</Label>
                  <Input 
                    id={`exp-end-${index}`}
                    value={exp.endDate || ''} 
                    onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`exp-description-${index}`}>Description</Label>
                <Textarea 
                  id={`exp-description-${index}`}
                  value={exp.description || ''} 
                  onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          ))}
          
          {resumeData.experience.length === 0 && (
            <div className="text-center py-4">
              <p className="text-gray-500">No experience entries found</p>
              <Button 
                type="button" 
                variant="outline" 
                className="mt-2"
                onClick={addExperience}
              >
                Add Experience
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Experience Metrics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Experience Metrics</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="longevityYears">Longevity Years</Label>
              <Input 
                id="longevityYears" 
                type="number"
                min="0"
                value={resumeData.longevityYears} 
                onChange={(e) => handleNumberChange('longevityYears', e.target.value)}
              />
              <p className="text-xs text-gray-500">Count only working years (not studying)</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="numberOfJobs">Number of Jobs</Label>
              <Input 
                id="numberOfJobs" 
                type="number"
                min="0"
                value={resumeData.numberOfJobs} 
                onChange={(e) => handleNumberChange('numberOfJobs', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="averageExperience">Average Experience</Label>
              <Input 
                id="averageExperience" 
                type="number"
                step="0.01"
                value={resumeData.averageExperience} 
                readOnly
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">Longevity / Number of Jobs</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Skills */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Skills</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="skills">Skills (comma separated)</Label>
              <span className="text-sm text-gray-500">Count: {resumeData.skillsCount}</span>
            </div>
            <Input 
              id="skills" 
              value={resumeData.skills.join(', ')} 
              onChange={handleSkillChange}
            />
          </div>
          
          <div className="flex flex-wrap gap-2 pt-2">
            {resumeData.skills.map((skill, index) => (
              <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                {skill}
              </Badge>
            ))}
            
            {resumeData.skills.length === 0 && (
              <p className="text-gray-500 text-sm">No skills found</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="achievements">Achievements (comma separated)</Label>
              <span className="text-sm text-gray-500">Count: {resumeData.achievementsCount}</span>
            </div>
            <Input 
              id="achievements" 
              value={resumeData.achievements?.join(', ') || ''} 
              onChange={(e) => handleStringArrayChange('achievements', e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2 pt-2">
            {resumeData.achievements?.map((item, index) => (
              <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {item}
              </Badge>
            ))}
            
            {(!resumeData.achievements || resumeData.achievements.length === 0) && (
              <p className="text-gray-500 text-sm">No achievements found</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Training & Workshops */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Training & Workshops</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="trainings">Trainings (comma separated)</Label>
                <span className="text-sm text-gray-500">Count: {resumeData.trainingsCount}</span>
              </div>
              <Input 
                id="trainings" 
                value={resumeData.trainings?.join(', ') || ''} 
                onChange={(e) => handleStringArrayChange('trainings', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="workshops">Workshops (comma separated)</Label>
                <span className="text-sm text-gray-500">Count: {resumeData.workshopsCount}</span>
              </div>
              <Input 
                id="workshops" 
                value={resumeData.workshops?.join(', ') || ''} 
                onChange={(e) => handleStringArrayChange('workshops', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Publications */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Academic Publications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="researchPapers">Research Papers (comma separated)</Label>
              <Input 
                id="researchPapers" 
                value={resumeData.researchPapers?.join(', ') || ''} 
                onChange={(e) => handleStringArrayChange('researchPapers', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="patents">Patents (comma separated)</Label>
              <Input 
                id="patents" 
                value={resumeData.patents?.join(', ') || ''} 
                onChange={(e) => handleStringArrayChange('patents', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="books">Books (comma separated)</Label>
              <Input 
                id="books" 
                value={resumeData.books?.join(', ') || ''} 
                onChange={(e) => handleStringArrayChange('books', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Projects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="projects">Projects (comma separated)</Label>
              <span className="text-sm text-gray-500">Count: {resumeData.projectsCount}</span>
            </div>
            <Input 
              id="projects" 
              value={resumeData.projects?.join(', ') || ''} 
              onChange={(e) => handleStringArrayChange('projects', e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2 pt-2">
            {resumeData.projects?.map((item, index) => (
              <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {item}
              </Badge>
            ))}
            
            {(!resumeData.projects || resumeData.projects.length === 0) && (
              <p className="text-gray-500 text-sm">No projects found</p>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end gap-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          className="bg-purple-600 hover:bg-purple-700"
          disabled={submitting}
        >
          {submitting ? "Saving..." : "Save Candidate Data"}
        </Button>
      </div>
    </form>
  );
}
