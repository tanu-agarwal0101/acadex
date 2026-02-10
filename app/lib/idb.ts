export type DayLabel = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export type ColorKey =
  | "cobalt"
  | "moss"
  | "amber"
  | "rose"
  | "slate"
  | "violet";

export type TimeBlock = {
  id: string;
  title: string;
  subjectId?: string;
  groupId?: string;
  part?: 1 | 2;
  day: DayLabel;
  start: string;
  end: string;
  location: string;
  color: ColorKey;
  createdAt: number;
};

export type Subject = {
  id: string;
  name: string;
  code?: string;
  instructor?: string;
  room?: string;
  type: "lecture" | "lab";
  durationSlots: 1 | 2;
  sessionsPerWeek: number;
  color: ColorKey;
  createdAt: number;
};

export type AttendanceStatus = "present" | "absent" | "holiday" | "bunk";

export type AttendanceRecord = {
  id: string;
  subjectId: string;
  date: string;
  day: DayLabel;
  start: string;
  end: string;
  status: AttendanceStatus;
  teacherPresent: boolean;
  substituteName?: string;
  notes?: string;
  homeworkSubmitted?: string;
  homeworkNext?: string;
  homeworkDueDate?: string;
  homeworkDone?: boolean;
  updatedAt: number;
};

const DB_NAME = "academics-pwa";
const DB_VERSION = 3;
const STORE_BLOCKS = "blocks";
const STORE_SUBJECTS = "subjects";
const STORE_ATTENDANCE = "attendance";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_BLOCKS)) {
        db.createObjectStore(STORE_BLOCKS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_SUBJECTS)) {
        db.createObjectStore(STORE_SUBJECTS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_ATTENDANCE)) {
        db.createObjectStore(STORE_ATTENDANCE, { keyPath: "id" });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });

  return dbPromise;
}

export async function getAllBlocks(): Promise<TimeBlock[]> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_BLOCKS, "readonly");
    const store = tx.objectStore(STORE_BLOCKS);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve((request.result as TimeBlock[]) ?? []);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function upsertBlock(block: TimeBlock): Promise<void> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_BLOCKS, "readwrite");
    const store = tx.objectStore(STORE_BLOCKS);
    const request = store.put(block);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function deleteBlock(id: string): Promise<void> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_BLOCKS, "readwrite");
    const store = tx.objectStore(STORE_BLOCKS);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function getAllSubjects(): Promise<Subject[]> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SUBJECTS, "readonly");
    const store = tx.objectStore(STORE_SUBJECTS);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve((request.result as Subject[]) ?? []);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function upsertSubject(subject: Subject): Promise<void> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SUBJECTS, "readwrite");
    const store = tx.objectStore(STORE_SUBJECTS);
    const request = store.put(subject);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function deleteSubject(id: string): Promise<void> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SUBJECTS, "readwrite");
    const store = tx.objectStore(STORE_SUBJECTS);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function clearAllData(): Promise<void> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(
      [STORE_BLOCKS, STORE_SUBJECTS, STORE_ATTENDANCE],
      "readwrite",
    );
    tx.objectStore(STORE_BLOCKS).clear();
    tx.objectStore(STORE_SUBJECTS).clear();
    tx.objectStore(STORE_ATTENDANCE).clear();

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllAttendance(): Promise<AttendanceRecord[]> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ATTENDANCE, "readonly");
    const store = tx.objectStore(STORE_ATTENDANCE);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve((request.result as AttendanceRecord[]) ?? []);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function upsertAttendance(
  record: AttendanceRecord,
): Promise<void> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ATTENDANCE, "readwrite");
    const store = tx.objectStore(STORE_ATTENDANCE);
    const request = store.put(record);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}
