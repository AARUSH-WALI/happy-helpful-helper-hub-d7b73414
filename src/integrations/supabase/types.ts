export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      auth: {
        Row: {
          change_role: string | null
          created_at: string
          email: string | null
          fname: string | null
          id: string
          lname: string | null
          number: string | null
          password: string | null
          profile_pic: string | null
          role: string | null
          user_device: string | null
          user_ip: string | null
        }
        Insert: {
          change_role?: string | null
          created_at?: string
          email?: string | null
          fname?: string | null
          id?: string
          lname?: string | null
          number?: string | null
          password?: string | null
          profile_pic?: string | null
          role?: string | null
          user_device?: string | null
          user_ip?: string | null
        }
        Update: {
          change_role?: string | null
          created_at?: string
          email?: string | null
          fname?: string | null
          id?: string
          lname?: string | null
          number?: string | null
          password?: string | null
          profile_pic?: string | null
          role?: string | null
          user_device?: string | null
          user_ip?: string | null
        }
        Relationships: []
      }
      category: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          job_desc: string | null
          job_name: string | null
          job_req: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          job_desc?: string | null
          job_name?: string | null
          job_req?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          job_desc?: string | null
          job_name?: string | null
          job_req?: string | null
        }
        Relationships: []
      }
      personality: {
        Row: {
          A: number | null
          auth_id: string | null
          C: number | null
          created_at: string
          E: number | null
          id: string
          N: number | null
          O: number | null
        }
        Insert: {
          A?: number | null
          auth_id?: string | null
          C?: number | null
          created_at?: string
          E?: number | null
          id?: string
          N?: number | null
          O?: number | null
        }
        Update: {
          A?: number | null
          auth_id?: string | null
          C?: number | null
          created_at?: string
          E?: number | null
          id?: string
          N?: number | null
          O?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "personality_auth_id_fkey"
            columns: ["auth_id"]
            isOneToOne: false
            referencedRelation: "auth"
            referencedColumns: ["id"]
          },
        ]
      }
      previousEmployees: {
        Row: {
          Achievements: number | null
          Books: number | null
          created_at: string
          Employee_Code: number | null
          Fitment_Score: number | null
          id: string
          IS_Assistant_Professor: boolean | null
          IS_Professor: boolean | null
          Longevity: number | null
          Number_of_Jobs: number | null
          Number_of_Unique_Designations: number | null
          PG_Institute: number | null
          PHD_Institute: number | null
          Sector_Defense: number | null
          Sector_Education: number | null
          Sector_Government: number | null
          Sector_Industry: number | null
          State_J_and_K: boolean | null
          Total_Experience: number | null
          TotalPapers: number | null
          TotalPatents: number | null
          Trainings: number | null
          UG_Institute: number | null
          Workshops: number | null
        }
        Insert: {
          Achievements?: number | null
          Books?: number | null
          created_at?: string
          Employee_Code?: number | null
          Fitment_Score?: number | null
          id?: string
          IS_Assistant_Professor?: boolean | null
          IS_Professor?: boolean | null
          Longevity?: number | null
          Number_of_Jobs?: number | null
          Number_of_Unique_Designations?: number | null
          PG_Institute?: number | null
          PHD_Institute?: number | null
          Sector_Defense?: number | null
          Sector_Education?: number | null
          Sector_Government?: number | null
          Sector_Industry?: number | null
          State_J_and_K?: boolean | null
          Total_Experience?: number | null
          TotalPapers?: number | null
          TotalPatents?: number | null
          Trainings?: number | null
          UG_Institute?: number | null
          Workshops?: number | null
        }
        Update: {
          Achievements?: number | null
          Books?: number | null
          created_at?: string
          Employee_Code?: number | null
          Fitment_Score?: number | null
          id?: string
          IS_Assistant_Professor?: boolean | null
          IS_Professor?: boolean | null
          Longevity?: number | null
          Number_of_Jobs?: number | null
          Number_of_Unique_Designations?: number | null
          PG_Institute?: number | null
          PHD_Institute?: number | null
          Sector_Defense?: number | null
          Sector_Education?: number | null
          Sector_Government?: number | null
          Sector_Industry?: number | null
          State_J_and_K?: boolean | null
          Total_Experience?: number | null
          TotalPapers?: number | null
          TotalPatents?: number | null
          Trainings?: number | null
          UG_Institute?: number | null
          Workshops?: number | null
        }
        Relationships: []
      }
      profile: {
        Row: {
          achievements: string | null
          auth_id: string | null
          bio: string | null
          books: string | null
          created_at: string | null
          exp_new: string | null
          from_jk: string | null
          highest_education: string | null
          id: string
          is_as_professor: string | null
          is_pg: string | null
          is_phd: string | null
          is_professor: string | null
          is_ug: string | null
          job_role: string | null
          longevity: string | null
          pg_institute: string | null
          phd_institute: string | null
          score: string | null
          skills: string | null
          total_papers: string | null
          total_patents: string | null
          trainings: string | null
          ug_institute: string | null
          workshops: string | null
        }
        Insert: {
          achievements?: string | null
          auth_id?: string | null
          bio?: string | null
          books?: string | null
          created_at?: string | null
          exp_new?: string | null
          from_jk?: string | null
          highest_education?: string | null
          id?: string
          is_as_professor?: string | null
          is_pg?: string | null
          is_phd?: string | null
          is_professor?: string | null
          is_ug?: string | null
          job_role?: string | null
          longevity?: string | null
          pg_institute?: string | null
          phd_institute?: string | null
          score?: string | null
          skills?: string | null
          total_papers?: string | null
          total_patents?: string | null
          trainings?: string | null
          ug_institute?: string | null
          workshops?: string | null
        }
        Update: {
          achievements?: string | null
          auth_id?: string | null
          bio?: string | null
          books?: string | null
          created_at?: string | null
          exp_new?: string | null
          from_jk?: string | null
          highest_education?: string | null
          id?: string
          is_as_professor?: string | null
          is_pg?: string | null
          is_phd?: string | null
          is_professor?: string | null
          is_ug?: string | null
          job_role?: string | null
          longevity?: string | null
          pg_institute?: string | null
          phd_institute?: string | null
          score?: string | null
          skills?: string | null
          total_papers?: string | null
          total_patents?: string | null
          trainings?: string | null
          ug_institute?: string | null
          workshops?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_auth_id_fkey"
            columns: ["auth_id"]
            isOneToOne: false
            referencedRelation: "auth"
            referencedColumns: ["id"]
          },
        ]
      }
      profilescores: {
        Row: {
          achievements: number | null
          auth_id: string | null
          books: number | null
          created_at: string
          id: string
          is_assistant_professor: number | null
          is_professor: number | null
          pg_institute: number | null
          phd_institute: number | null
          total_score: number | null
          totalpapers: number | null
          totalpatents: number | null
          trainings: number | null
          ug_institute: number | null
          wrokshops: number | null
        }
        Insert: {
          achievements?: number | null
          auth_id?: string | null
          books?: number | null
          created_at?: string
          id?: string
          is_assistant_professor?: number | null
          is_professor?: number | null
          pg_institute?: number | null
          phd_institute?: number | null
          total_score?: number | null
          totalpapers?: number | null
          totalpatents?: number | null
          trainings?: number | null
          ug_institute?: number | null
          wrokshops?: number | null
        }
        Update: {
          achievements?: number | null
          auth_id?: string | null
          books?: number | null
          created_at?: string
          id?: string
          is_assistant_professor?: number | null
          is_professor?: number | null
          pg_institute?: number | null
          phd_institute?: number | null
          total_score?: number | null
          totalpapers?: number | null
          totalpatents?: number | null
          trainings?: number | null
          ug_institute?: number | null
          wrokshops?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profilescores_auth_id_fkey"
            columns: ["auth_id"]
            isOneToOne: false
            referencedRelation: "auth"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      task_priority: "low" | "medium" | "high"
      task_status: "backlog" | "in-progress" | "paused" | "ready-for-launch"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      task_priority: ["low", "medium", "high"],
      task_status: ["backlog", "in-progress", "paused", "ready-for-launch"],
    },
  },
} as const
