// Store for active import sessions
const importSessions = new Map<
  string,
  {
    progress: number;
    current: number;
    total: number;
    message: string;
    status: "processing" | "completed" | "error";
    errors: string[];
    result?: unknown;
  }
>();

export function updateImportProgress(
  sessionId: string,
  current: number,
  total: number,
  message: string,
  status: "processing" | "completed" | "error" = "processing",
  errors: string[] = []
) {
  const progress = total > 0 ? Math.round((current / total) * 100) : 0;

  importSessions.set(sessionId, {
    progress,
    current,
    total,
    message,
    status,
    errors,
  });
}

export function completeImportProgress(sessionId: string, result: unknown) {
  console.log(`🎉 Completing import progress for session ${sessionId}`);
  const session = importSessions.get(sessionId);
  if (session) {
    session.status = "completed";
    session.progress = 100;
    session.result = result;
    session.message = `Import completed: ${
      (result as { imported: number }).imported
    } patients imported, ${
      (result as { errors: string[] }).errors.length
    } errors`;
    console.log(`🎉 Session marked as completed: ${session.message}`);

    // Keep the session alive for 30 seconds after completion to allow frontend polling
    setTimeout(() => {
      console.log(`🧹 Cleaning up completed session ${sessionId}`);
      importSessions.delete(sessionId);
    }, 30000);
  } else {
    console.log(`❌ Session ${sessionId} not found for completion`);
  }
}

export function failImportProgress(sessionId: string, error: string) {
  const session = importSessions.get(sessionId);
  if (session) {
    session.status = "error";
    session.message = error;
    session.errors.push(error);
  }
}

export function getImportSession(sessionId: string) {
  return importSessions.get(sessionId);
}

export function setImportSession(
  sessionId: string,
  data: {
    progress: number;
    current: number;
    total: number;
    message: string;
    status: "processing" | "completed" | "error";
    errors: string[];
    result?: unknown;
  }
) {
  importSessions.set(sessionId, data);
}

export function deleteImportSession(sessionId: string) {
  importSessions.delete(sessionId);
}
