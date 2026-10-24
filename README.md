# JobTrack

JobTrack is an Expo application for organizing a job search. It uses Firebase
Authentication and Cloud Firestore, with a monochrome interface across web and
mobile.

## Run locally

```bash
npm install
npx expo start
```

Configure the Firebase project used by `src/environment.ts`, enable
Email/Password sign-in, and create a Cloud Firestore database before signing in.

## Current workflow

- Create, search, filter, edit, and archive job applications.
- Track role details, application status, notes, and next steps.
- Review append-only activity history for application changes.
- Create reminders linked to applications and mark them complete.
- View dashboard totals and insights derived from the signed-in user's records.
- Use interview and follow-up prompts in the career toolkit.
- Export applications, tasks, and status history to CSV (download on web, share as a file on mobile).

## Firestore access rules

Application, task, and activity records are stored below `users/{uid}`. The
rules in `firestore.rules` restrict access to the authenticated owner, validate
writes, and disallow hard deletion of application history and tasks. Configure
the Firebase CLI for your project, then deploy the rules before using the data
screens:

```bash
firebase use --add
firebase deploy --only firestore:rules
```

Do not ship the app with permissive Firestore rules. Firebase client
configuration identifies a project but does not replace server-side access
rules.

Reminders currently appear inside the app; push notifications, email reminders,
document uploads, CSV import, account deletion, and external job-board
integrations are not included.
