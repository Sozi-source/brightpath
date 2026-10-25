export type UserRole = "student" | "trainer" | "admin";
export type TrainerStatus = "pending" | "approved" | "suspended";
export type ContentStatus = "draft" | "pending_review" | "published" | "rejected";
export type OrderStatus = "pending" | "paid" | "failed";

export interface UserProfile {
  id: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  course: string | null;
  level: string | null;
  institution: string | null;
  created_at: string;
}

export interface TrainerProfile {
  user_id: string;
  bio: string | null;
  subjects: string[] | null;
  status: TrainerStatus;
  paystack_subaccount_code: string | null;
  approved_at: string | null;
  profiles?: UserProfile | null;
}

export interface Project {
  id: string;
  trainer_id: string;
  title: string;
  description: string | null;
  category: string | null;
  price_kes: number;
  file_path: string;
  preview_path: string | null;
  status: ContentStatus;
  created_at: string;
  profiles?: {
    full_name: string;
  } | null;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  body: string | null;
  video_url: string | null;
  position: number;
  is_free: boolean;
  created_at: string;
}

export interface Module {
  id: string;
  trainer_id: string;
  title: string;
  description: string | null;
  position: number;
  status: ContentStatus;
  created_at: string;
  lessons?: Lesson[];
  profiles?: {
    full_name: string;
  } | null;
}

export interface Order {
  id: string;
  student_id: string;
  project_id: string;
  trainer_id: string;
  amount_kes: number;
  commission_kes: number;
  trainer_share_kes: number;
  paystack_reference: string;
  status: OrderStatus;
  paid_at: string | null;
  created_at: string;
}

export interface ContentReport {
  id: string;
  reporter_id: string | null;
  project_id: string | null;
  lesson_id: string | null;
  reason: string;
  created_at: string;
}

export interface PlatformSettings {
  id: number;
  commission_percent: number;
}

export interface LessonProgress {
  user_id: string;
  lesson_id: string;
  completed_at: string;
}

export interface ModuleAccess {
  user_id: string;
  module_id: string;
  granted_by: "purchase" | "institution" | "admin";
  created_at: string;
}
