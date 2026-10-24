export const APPLICATION_STATUSES = [
  "Saved",
  "Preparing",
  "Applied",
  "Assessment",
  "Interview",
  "Offer",
  "Accepted",
  "Rejected",
  "Withdrawn",
  "Archived",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export interface JobApplication {
  id: string;
  title: string;
  company: string;
  status: ApplicationStatus;
  location: string;
  jobUrl: string;
  appliedOn: string;
  nextAction: string;
  nextActionDate: string;
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export interface ApplicationInput {
  title: string;
  company: string;
  status: ApplicationStatus;
  location: string;
  jobUrl: string;
  appliedOn: string;
  nextAction: string;
  nextActionDate: string;
  notes: string;
}

export interface ApplicationEvent {
  id: string;
  type: "created" | "status_changed" | "updated";
  description: string;
  createdAt: number;
}

export interface JobTask {
  id: string;
  title: string;
  dueDate: string;
  applicationId: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface JobTaskInput {
  title: string;
  dueDate: string;
  applicationId: string;
}
