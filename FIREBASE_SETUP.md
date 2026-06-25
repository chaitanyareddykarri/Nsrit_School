# NSRIT Connect — Firebase Setup Guide

**Project ID:** `nsrit-school-2b749`
**App type:** React Native CLI (Android-first)

---

## 1. Firebase Services in Use

| Service | Purpose |
|---|---|
| Firebase Auth | Login with phone (OTP) |
| Firebase Data Connect (PostgreSQL) | Main relational data: students, teachers, fees, attendance, sections, classes |
| Cloud Firestore | Flexible/schemaless: notices, timetable |
| Firebase Storage | (planned) Bulk student CSV uploads |

---

## 2. Firestore Collections

### 2.1 `notices`
School notice board — created by Principal/Coordinator, read by all roles in the same branch.

```
notices/{noticeId}
  title: string            // Required
  body: string             // Required
  category: string         // 'Academic' | 'Fee' | 'Holiday' | 'Event' | 'Urgent'
  branchId: string         // Branch that owns this notice
  author: string           // Display name of the author
  authorId: string         // UID of the creating user
  pinned: boolean          // Whether pinned to top
  readCount: number        // Incremented on read (optional)
  date: string             // ISO date string 'YYYY-MM-DD'
  createdAt: Timestamp     // Firestore server timestamp
  updatedAt: Timestamp     // Updated on each edit
```

**Queries used:**
- `where('branchId', '==', branchId) + orderBy('createdAt', 'desc')` — list all notices for a branch
- `where('branchId', '==', branchId) + where('category', '==', cat) + orderBy('createdAt', 'desc')` — category-filtered

**Real-time:**
- `onSnapshot` used in `PrincipalNoticeBoardScreen` and `ParentNoticeBoardScreen`

**Required Firestore Index:**
```
Collection: notices
Fields indexed: branchId ASC, createdAt DESC
```

---

### 2.2 `timetable`
Weekly class timetables — one document per section, keyed by `sectionId`.

```
timetable/{sectionId}
  branchId: string         // Branch owning the section
  classId: string          // e.g. 'class_10'
  className: string        // Display name e.g. 'Class X'
  sectionId: string        // Same as document ID
  sectionName: string      // e.g. 'A'
  updatedAt: Timestamp
  periods: Array<Period>
    Period {
      day: string          // 'Monday'|'Tuesday'|...|'Saturday'
      periodNum: number    // 1–8
      subject: string      // e.g. 'Mathematics'
      teacherId: string    // Optional: linked teacher ID
      teacherName: string  // Display name
      room: string         // e.g. 'Room 101'
    }
```

**Queries used:**
- `where('branchId', '==', branchId)` — all timetables for a branch (Principal view)
- `getDoc(sectionId)` — single section timetable
- Filter in-app by `teacherId` for teacher's personal timetable

**Required Firestore Index:**
```
Collection: timetable
Fields indexed: branchId ASC, className ASC, sectionName ASC
```

---

## 3. Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ── Helper functions ──────────────────────────────────────────
    function isSignedIn() {
      return request.auth != null;
    }

    function userRole() {
      return request.auth.token.role;
    }

    function userBranch() {
      return request.auth.token.branchId;
    }

    function isMainAdmin() {
      return userRole() == 'MAIN_ADMIN';
    }

    function isBranchStaff(branchId) {
      return isSignedIn() && (isMainAdmin() || userBranch() == branchId);
    }

    function canWriteNotice() {
      return isSignedIn() && (
        userRole() == 'MAIN_ADMIN' ||
        userRole() == 'PRINCIPAL' ||
        userRole() == 'COORDINATOR'
      );
    }

    // ── notices collection ───────────────────────────────────────
    match /notices/{noticeId} {
      // Any signed-in user whose branchId matches (or MAIN_ADMIN) can read
      allow read: if isSignedIn() && (
        isMainAdmin() ||
        resource.data.branchId == userBranch()
      );

      // Only Principal/Coordinator/MainAdmin can create
      allow create: if canWriteNotice() &&
        request.resource.data.branchId == userBranch() || isMainAdmin();

      // Only original author or Principal/MainAdmin can update
      allow update: if canWriteNotice() &&
        (resource.data.authorId == request.auth.uid ||
         userRole() == 'PRINCIPAL' ||
         isMainAdmin());

      // Only original author or Principal/MainAdmin can delete
      allow delete: if canWriteNotice() &&
        (resource.data.authorId == request.auth.uid ||
         userRole() == 'PRINCIPAL' ||
         isMainAdmin());
    }

    // ── timetable collection ─────────────────────────────────────
    match /timetable/{sectionId} {
      // All branch staff can read timetable
      allow read: if isSignedIn() && (
        isMainAdmin() ||
        resource.data.branchId == userBranch()
      );

      // Only Principal/MainAdmin can write timetable
      allow write: if isSignedIn() && (
        isMainAdmin() ||
        (resource.data.branchId == userBranch() && userRole() == 'PRINCIPAL')
      );

      // Allow create (no resource yet) by Principal
      allow create: if isSignedIn() && (
        isMainAdmin() ||
        (request.resource.data.branchId == userBranch() && userRole() == 'PRINCIPAL')
      );
    }
  }
}
```

---

## 4. Required Firestore Composite Indexes

Create these in **Firebase Console → Firestore → Indexes → Composite**:

| Collection | Field 1 | Field 2 | Query Scope |
|---|---|---|---|
| `notices` | `branchId` ASC | `createdAt` DESC | Collection |
| `notices` | `branchId` ASC, `category` ASC | `createdAt` DESC | Collection |
| `timetable` | `branchId` ASC | `className` ASC | Collection |
| `timetable` | `branchId` ASC | `sectionName` ASC | Collection |

**CLI command to create indexes:**
```bash
firebase firestore:indexes --project nsrit-school-2b749
# Or deploy the firestore.indexes.json file directly
```

---

## 5. Firestore Indexes JSON (`firestore.indexes.json`)

Create this file at the project root:

```json
{
  "indexes": [
    {
      "collectionGroup": "notices",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "branchId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "notices",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "branchId", "order": "ASCENDING" },
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "timetable",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "branchId", "order": "ASCENDING" },
        { "fieldPath": "className", "order": "ASCENDING" },
        { "fieldPath": "sectionName", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

---

## 6. Firestore Security Rules File (`firestore.rules`)

Save the rules from Section 3 to a file named `firestore.rules` at the project root.

---

## 7. Firebase Deployment Commands

### Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules --project nsrit-school-2b749
```

### Deploy Firestore Indexes
```bash
firebase deploy --only firestore:indexes --project nsrit-school-2b749
```

### Deploy Data Connect (existing schema)
```bash
firebase deploy --only dataconnect --project nsrit-school-2b749
```

### Deploy Everything
```bash
firebase deploy --project nsrit-school-2b749
```

### Test with Emulators
```bash
npm run emulators
# Starts Auth emulator on :9099, DataConnect emulator on :9399
```

---

## 8. Manual Firebase Console Steps

1. **Enable Firestore:**
   - Go to Firebase Console → Firestore Database → Create database
   - Choose **Production mode** (start locked, apply rules from Section 3)
   - Select region: `asia-south1` (Mumbai) for India-based school

2. **Enable Firestore offline persistence** (handled in app via SDK config)

3. **Create Firestore Indexes:**
   - Go to Firestore → Indexes → Add index
   - Add all 3 composite indexes from Section 4

4. **Apply Security Rules:**
   - Go to Firestore → Rules
   - Paste rules from Section 3

5. **Data Connect — verify connector is published:**
   - Go to Firebase Console → Data Connect
   - Ensure the connector is published and SDK is generated

6. **Authentication:**
   - Go to Firebase Console → Authentication → Sign-in method
   - Enable **Phone** provider
   - Add test phone numbers for development (e.g. `+91 9999999999` with OTP `123456`)

---

## 9. Custom Claims (Role-Based Access)

The app uses Firebase Auth custom claims for role-based access. The backend (Cloud Functions or Admin SDK) must set these claims on login:

```javascript
// Required custom claims per user
{
  role: 'MAIN_ADMIN' | 'BRANCH_ADMIN' | 'PRINCIPAL' | 'COORDINATOR' | 'TEACHER' | 'PARENT' | 'ACCOUNTANT',
  branchId: string,    // null for MAIN_ADMIN
  wingId: string,      // null for non-COORDINATOR roles
  teacherId: string,   // only for TEACHER role
  parentId: string,    // only for PARENT role
}
```

---

## 10. Data Seed — Notices Collection Bootstrap

To seed initial notices for testing:

```javascript
// Run in Firebase Console → Firestore → + Start collection → notices
{
  title: "Welcome to NSRIT Connect",
  body: "The school management app is now live. Parents can view notices, fees, and attendance here.",
  category: "Academic",
  branchId: "<your-branch-id>",
  author: "Principal Office",
  authorId: "principal-user-id",
  pinned: true,
  readCount: 0,
  date: "2026-06-17",
  createdAt: <Timestamp.now()>,
  updatedAt: <Timestamp.now()>
}
```

---

## 11. Summary of All Firestore Collections

| Collection | Owner | Read | Write |
|---|---|---|---|
| `notices` | Branch | All signed-in branch users | Principal, Coordinator, MainAdmin |
| `timetable` | Branch | All signed-in branch users | Principal, MainAdmin |

---

*Generated: 2026-06-17 — NSRIT Connect Phase 9 Firebase Deployment Preparation*
