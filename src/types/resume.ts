
export interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    summary?: string;
  };
  education: Education[];
  experience: Experience[];
  skills: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
}

export interface Experience {
  company: string;
  position: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  location?: string;
}
