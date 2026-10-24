import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  writeBatch,
  type DocumentData,
  type DocumentSnapshot,
  type FirestoreError,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import { firestore } from "@/firebase";
import type {
  ApplicationEvent,
  ApplicationInput,
  ApplicationStatus,
  JobApplication,
  JobTask,
  JobTaskInput,
} from "@/models/job-tracker.models";
import { APPLICATION_STATUSES } from "@/models/job-tracker.models";

function isApplicationStatus(value: unknown): value is ApplicationStatus {
  return (
    typeof value === "string" &&
    (APPLICATION_STATUSES as readonly string[]).includes(value)
  );
}

function applicationFromDocument(
  snapshot: DocumentSnapshot<DocumentData>,
): JobApplication {
  const data = snapshot.data() ?? {};
  return {
    id: snapshot.id,
    title: typeof data.title === "string" ? data.title : "",
    company: typeof data.company === "string" ? data.company : "",
    status: isApplicationStatus(data.status) ? data.status : "Saved",
    location: typeof data.location === "string" ? data.location : "",
    jobUrl: typeof data.jobUrl === "string" ? data.jobUrl : "",
    appliedOn: typeof data.appliedOn === "string" ? data.appliedOn : "",
    nextAction: typeof data.nextAction === "string" ? data.nextAction : "",
    nextActionDate:
      typeof data.nextActionDate === "string" ? data.nextActionDate : "",
    notes: typeof data.notes === "string" ? data.notes : "",
    createdAt: typeof data.createdAt === "number" ? data.createdAt : 0,
    updatedAt: typeof data.updatedAt === "number" ? data.updatedAt : 0,
  };
}

function taskFromDocument(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): JobTask {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    title: typeof data.title === "string" ? data.title : "",
    dueDate: typeof data.dueDate === "string" ? data.dueDate : "",
    applicationId:
      typeof data.applicationId === "string" ? data.applicationId : "",
    completed: data.completed === true,
    createdAt: typeof data.createdAt === "number" ? data.createdAt : 0,
    updatedAt: typeof data.updatedAt === "number" ? data.updatedAt : 0,
  };
}

function applicationsCollection(userId: string) {
  return collection(firestore, "users", userId, "applications");
}

function tasksCollection(userId: string) {
  return collection(firestore, "users", userId, "tasks");
}

export function subscribeApplications(
  userId: string,
  onValue: (applications: JobApplication[]) => void,
  onError: (error: FirestoreError) => void,
) {
  const applicationsQuery = query(
    applicationsCollection(userId),
    orderBy("updatedAt", "desc"),
  );
  return onSnapshot(
    applicationsQuery,
    (snapshot) => onValue(snapshot.docs.map(applicationFromDocument)),
    onError,
  );
}

export function subscribeTasks(
  userId: string,
  onValue: (tasks: JobTask[]) => void,
  onError: (error: FirestoreError) => void,
) {
  const tasksQuery = query(tasksCollection(userId), orderBy("dueDate", "asc"));
  return onSnapshot(
    tasksQuery,
    (snapshot) => onValue(snapshot.docs.map(taskFromDocument)),
    onError,
  );
}

export async function createApplication(
  userId: string,
  input: ApplicationInput,
) {
  const now = Date.now();
  const applicationRef = doc(applicationsCollection(userId));
  const eventRef = doc(collection(applicationRef, "events"));
  const batch = writeBatch(firestore);

  batch.set(applicationRef, {
    ...input,
    createdAt: now,
    updatedAt: now,
  });
  batch.set(eventRef, {
    type: "created",
    description: `Application added as ${input.status}.`,
    createdAt: now,
  });

  await batch.commit();
  return applicationRef.id;
}

export async function updateApplication(
  userId: string,
  applicationId: string,
  input: ApplicationInput,
  previousStatus: ApplicationStatus,
) {
  const applicationRef = doc(
    applicationsCollection(userId),
    applicationId,
  );
  const batch = writeBatch(firestore);
  const now = Date.now();

  batch.update(applicationRef, { ...input, updatedAt: now });
  if (input.status !== previousStatus) {
    const eventRef = doc(collection(applicationRef, "events"));
    batch.set(eventRef, {
      type: "status_changed",
      description: `Status changed from ${previousStatus} to ${input.status}.`,
      createdAt: now,
    });
  } else {
    const eventRef = doc(collection(applicationRef, "events"));
    batch.set(eventRef, {
      type: "updated",
      description: "Application details updated.",
      createdAt: now,
    });
  }
  await batch.commit();
}

export function subscribeApplicationEvents(
  userId: string,
  applicationId: string,
  onValue: (events: ApplicationEvent[]) => void,
  onError: (error: FirestoreError) => void,
) {
  const eventsQuery = query(
    collection(
      firestore,
      "users",
      userId,
      "applications",
      applicationId,
      "events",
    ),
    orderBy("createdAt", "desc"),
  );
  return onSnapshot(
    eventsQuery,
    (snapshot) =>
      onValue(
        snapshot.docs.map((event) => {
          const data = event.data();
          return {
            id: event.id,
            type:
              data.type === "created" ||
              data.type === "status_changed" ||
              data.type === "updated"
                ? data.type
                : "updated",
            description:
              typeof data.description === "string" ? data.description : "",
            createdAt:
              typeof data.createdAt === "number" ? data.createdAt : 0,
          };
        }),
      ),
    onError,
  );
}

export async function getApplicationEvents(
  userId: string,
  applicationId: string,
): Promise<ApplicationEvent[]> {
  const eventsQuery = query(
    collection(
      firestore,
      "users",
      userId,
      "applications",
      applicationId,
      "events",
    ),
    orderBy("createdAt", "desc"),
  );
  const snapshot = await getDocs(eventsQuery);
  return snapshot.docs.map((event) => {
    const data = event.data();
    return {
      id: event.id,
      type:
        data.type === "created" ||
        data.type === "status_changed" ||
        data.type === "updated"
          ? data.type
          : "updated",
      description:
        typeof data.description === "string" ? data.description : "",
      createdAt: typeof data.createdAt === "number" ? data.createdAt : 0,
    };
  });
}

export async function getApplication(
  userId: string,
  applicationId: string,
): Promise<JobApplication | null> {
  const snapshot = await getDoc(
    doc(applicationsCollection(userId), applicationId),
  );
  return snapshot.exists()
    ? applicationFromDocument(snapshot)
    : null;
}

export async function createTask(userId: string, input: JobTaskInput) {
  const now = Date.now();
  await addDoc(tasksCollection(userId), {
    ...input,
    completed: false,
    createdAt: now,
    updatedAt: now,
  });
}

export async function setTaskCompleted(
  userId: string,
  taskId: string,
  completed: boolean,
) {
  await updateDoc(doc(tasksCollection(userId), taskId), {
    completed,
    updatedAt: Date.now(),
  });
}
