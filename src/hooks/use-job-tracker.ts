import { useEffect, useState } from "react";
import type { FirestoreError } from "firebase/firestore";

import type {
  JobApplication,
  JobTask,
} from "@/models/job-tracker.models";
import {
  subscribeApplications,
  subscribeTasks,
} from "@/services/job-tracker";

interface TrackerState {
  userId: string;
  applications: JobApplication[];
  tasks: JobTask[];
  loading: boolean;
  error: string;
}

export function useJobTracker(userId: string | undefined) {
  const [state, setState] = useState<TrackerState | null>(null);

  useEffect(() => {
    if (!userId) return;

    let applicationsReady = false;
    let tasksReady = false;
    const handleError = (firestoreError: FirestoreError) => {
      setState((previous) => ({
        userId,
        applications:
          previous?.userId === userId ? previous.applications : [],
        tasks: previous?.userId === userId ? previous.tasks : [],
        loading: false,
        error: `Could not load your tracker data: ${firestoreError.message}`,
      }));
    };
    const unsubscribeApplications = subscribeApplications(
      userId,
      (records) => {
        applicationsReady = true;
        setState((previous) => ({
          userId,
          applications: records,
          tasks: previous?.userId === userId ? previous.tasks : [],
          loading:
            previous?.userId === userId && previous.error
              ? false
              : !(applicationsReady && tasksReady),
          error: previous?.userId === userId ? previous.error : "",
        }));
      },
      handleError,
    );
    const unsubscribeTasks = subscribeTasks(
      userId,
      (records) => {
        tasksReady = true;
        setState((previous) => ({
          userId,
          applications:
            previous?.userId === userId ? previous.applications : [],
          tasks: records,
          loading:
            previous?.userId === userId && previous.error
              ? false
              : !(applicationsReady && tasksReady),
          error: previous?.userId === userId ? previous.error : "",
        }));
      },
      handleError,
    );

    return () => {
      unsubscribeApplications();
      unsubscribeTasks();
    };
  }, [userId]);

  if (!userId) {
    return { applications: [], tasks: [], loading: false, error: "" };
  }
  if (state?.userId !== userId) {
    return { applications: [], tasks: [], loading: true, error: "" };
  }
  return state;
}
