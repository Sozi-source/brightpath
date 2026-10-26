export type UserRole = "student" | "trainer" | "admin" | "supervisor";
export type TrainerStatus = "pending" | "approved" | "suspended";
export type ContentStatus = "draft" | "pending_review" | "published" | "rejected";
export type OrderStatus = "pending" | "paid" | "failed";

export type AiMode = "off" | "feedback_only" | "feedback_and_polish";
export type WorkspaceType = "trade_fabrication" | "research_secondary" | "business_plan";
export type WorkspaceLevel = "craft" | "diploma" | "higher_diploma";
export type WorkspaceStatus = "ideation" | "proposal_pending" | "approved" | "submitted" | "closed";
export type SectionPhase = "proposal" | "project";
export type SectionStatus = "empty" | "draft" | "reviewed" | "final";
export type AiEventKind =
  | "coach_question"
  | "rubric_feedback"
  | "language_suggestion"
  | "example_other_topic"
  | "mock_defence"
  | "reference_check"
  | "topic_suggestions";
export type ReviewStatus = "approved" | "changes_requested" | "comment";

export interface Institution {
  id: string;
  name: string;
  code: string | null;
  ai_mode: AiMode;
  created_at: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  course: string | null;
  level: string | null;
  institution: string | null;
  admission_number: string | null;
  institution_id: string | null;
  created_at: string;
  institutions?: Institution | null;
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

export interface TopicBankItem {
  id: string;
  area: string;
  title: string;
  workspace_type: WorkspaceType;
  suggested_indicators: string | null;
  suggested_sources: string | null;
  course_tags: string[] | null;
  active: boolean;
}

export interface ProjectWorkspace {
  id: string;
  student_id: string;
  supervisor_id: string | null;
  institution_id: string | null;
  workspace_type: WorkspaceType;
  level: WorkspaceLevel;
  course: string;
  title: string | null;
  problem_area: string | null;
  status: WorkspaceStatus;
  approved_at: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  student?: UserProfile | null;
  supervisor?: UserProfile | null;
  institution?: Institution | null;
  workspace_sections?: WorkspaceSection[];
}

export interface WorkspaceSection {
  id: string;
  workspace_id: string;
  section_key: string;
  phase: SectionPhase;
  position: number;
  current_text: string;
  status: SectionStatus;
  ai_accepted_chars: number;
  updated_at: string;
}

export interface SectionVersion {
  id: string;
  section_id: string;
  text: string;
  source: "student_typed" | "student_accepted_suggestion";
  ai_chars_accepted: number;
  created_at: string;
}

export interface AiEvent {
  id: string;
  workspace_id: string;
  section_id: string | null;
  user_id: string;
  kind: AiEventKind;
  student_input: string | null;
  response: Record<string, unknown>;
  suggestions_accepted: number;
  suggestions_total: number;
  model: string | null;
  tokens_in: number | null;
  tokens_out: number | null;
  created_at: string;
}

export interface DataPoint {
  id: string;
  workspace_id: string;
  indicator: string;
  value: number;
  unit: string;
  survey_year: number;
  source_title: string;
  source_publisher: string;
  source_location: string;
  source_url: string;
  accessed_on: string;
  verified_against_original: boolean;
  created_at: string;
}

export interface ProjectLogEntry {
  id: string;
  workspace_id: string;
  entry_date: string;
  activity: string;
  problems: string | null;
  supervisor_comment: string | null;
  auto_generated: boolean;
  student_signed_at: string | null;
  supervisor_signed_at: string | null;
  created_at: string;
}

export interface SupervisorReview {
  id: string;
  workspace_id: string;
  section_id: string | null;
  supervisor_id: string;
  status: ReviewStatus;
  comment: string;
  created_at: string;
}
