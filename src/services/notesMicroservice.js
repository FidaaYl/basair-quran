import { logApiCall } from './quranApi';

const STORAGE_KEY = 'basair_crud_notes';

const INITIAL_NOTES = [
  {
    id: 'note_1',
    surahNumber: 1,
    ayahNumber: 1,
    surahName: 'الفاتحة',
    title: 'افتتاح بالرحمة الشاملة',
    content: 'البدء ببسم الله الرحمن الرحيم يعلمنا استحضار معية الله في كل قول وعمل، وتقديم صفة الرحمة على سائر الصفات.',
    category: 'تدبر',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'note_2',
    surahNumber: 1,
    ayahNumber: 5,
    surahName: 'الفاتحة',
    title: 'حقيقة العبودية والاستعانة',
    content: 'تقديم "إياك نعبد" على "إياك نستعين" تبيان أن العبادة هي الغاية، والاستعانة هي الوسيلة العظمى لبلوغها.',
    category: 'عقيدة',
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    updatedAt: new Date(Date.now() - 43200000).toISOString()
  }
];

function getStoredNotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_NOTES));
      return [...INITIAL_NOTES];
    }
    return JSON.parse(raw);
  } catch {
    return [...INITIAL_NOTES];
  }
}

function persistNotes(notes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (err) {
    console.warn('Failed to persist notes to localStorage:', err);
  }
}

export async function fetchNotes(filters = {}) {
  const startTime = performance.now();
  const url = `/api/v1/notes${filters.surahNumber ? `?surah=${filters.surahNumber}` : ''}`;
  
  await new Promise((res) => setTimeout(res, 60));

  let notes = getStoredNotes();
  if (filters.surahNumber) {
    notes = notes.filter((n) => n.surahNumber === Number(filters.surahNumber));
  }
  if (filters.category && filters.category !== 'all') {
    notes = notes.filter((n) => n.category === filters.category);
  }

  const duration = performance.now() - startTime;
  const payload = {
    status: 'success',
    count: notes.length,
    data: notes,
    timestamp: new Date().toISOString()
  };

  logApiCall('GET', url, 200, duration, JSON.stringify(payload).length, payload);
  return payload;
}

export async function createNote(noteData, authToken = 'valid-token') {
  const startTime = performance.now();
  const url = '/api/v1/notes';
  
  await new Promise((res) => setTimeout(res, 85));

  if (!authToken || authToken === 'invalid') {
    const duration = performance.now() - startTime;
    const errorPayload = {
      status: 'error',
      statusCode: 401,
      message: 'Unauthorized: Missing or invalid Bearer authentication token',
      hint: 'Include a valid Authorization header: Bearer <jwt-token>'
    };
    logApiCall('POST', url, 401, duration, JSON.stringify(errorPayload).length, errorPayload);
    const err = new Error(errorPayload.message);
    err.status = 401;
    err.payload = errorPayload;
    throw err;
  }

  if (!noteData.title || !noteData.content || !noteData.surahNumber) {
    const duration = performance.now() - startTime;
    const errorPayload = {
      status: 'fail',
      statusCode: 400,
      message: 'Bad Request: Fields [title, content, surahNumber] are required in request body',
      received: noteData
    };
    logApiCall('POST', url, 400, duration, JSON.stringify(errorPayload).length, errorPayload);
    const err = new Error(errorPayload.message);
    err.status = 400;
    err.payload = errorPayload;
    throw err;
  }

  const notes = getStoredNotes();
  const newNote = {
    id: `note_${Date.now()}`,
    surahNumber: Number(noteData.surahNumber),
    ayahNumber: Number(noteData.ayahNumber || 1),
    surahName: noteData.surahName || 'سورة',
    title: noteData.title.trim(),
    content: noteData.content.trim(),
    category: noteData.category || 'تدبر',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  notes.unshift(newNote);
  persistNotes(notes);

  const duration = performance.now() - startTime;
  const payload = {
    status: 'success',
    statusCode: 201,
    message: 'Resource created successfully (201 Created)',
    data: newNote
  };

  logApiCall('POST', url, 201, duration, JSON.stringify(payload).length, payload);
  return payload;
}

export async function updateNote(id, updateData) {
  const startTime = performance.now();
  const url = `/api/v1/notes/${id}`;
  
  await new Promise((res) => setTimeout(res, 75));

  const notes = getStoredNotes();
  const index = notes.findIndex((n) => n.id === id);

  if (index === -1) {
    const duration = performance.now() - startTime;
    const errorPayload = {
      status: 'fail',
      statusCode: 404,
      message: `Not Found: Note with ID [${id}] does not exist on this server`
    };
    logApiCall('PUT', url, 404, duration, JSON.stringify(errorPayload).length, errorPayload);
    const err = new Error(errorPayload.message);
    err.status = 404;
    err.payload = errorPayload;
    throw err;
  }

  notes[index] = {
    ...notes[index],
    ...updateData,
    updatedAt: new Date().toISOString()
  };
  persistNotes(notes);

  const duration = performance.now() - startTime;
  const payload = {
    status: 'success',
    statusCode: 200,
    message: 'Resource updated successfully (200 OK)',
    data: notes[index]
  };

  logApiCall('PUT', url, 200, duration, JSON.stringify(payload).length, payload);
  return payload;
}

export async function deleteNote(id) {
  const startTime = performance.now();
  const url = `/api/v1/notes/${id}`;
  
  await new Promise((res) => setTimeout(res, 65));

  const notes = getStoredNotes();
  const filtered = notes.filter((n) => n.id !== id);

  if (filtered.length === notes.length) {
    const duration = performance.now() - startTime;
    const errorPayload = {
      status: 'fail',
      statusCode: 404,
      message: `Not Found: Cannot delete note with ID [${id}]`
    };
    logApiCall('DELETE', url, 404, duration, JSON.stringify(errorPayload).length, errorPayload);
    const err = new Error(errorPayload.message);
    err.status = 404;
    err.payload = errorPayload;
    throw err;
  }

  persistNotes(filtered);

  const duration = performance.now() - startTime;
  const payload = {
    status: 'success',
    statusCode: 204,
    message: 'Resource deleted (204 No Content)'
  };

  logApiCall('DELETE', url, 204, duration, 0, payload);
  return payload;
}

export async function simulateHttpStatus(code) {
  const startTime = performance.now();
  const url = `/api/v1/test/status/${code}`;
  await new Promise((res) => setTimeout(res, 70));
  const duration = performance.now() - startTime;

  const statusMap = {
    200: {
      status: 'success',
      statusCode: 200,
      description: 'OK — The request has succeeded and the entity has been delivered.'
    },
    201: {
      status: 'success',
      statusCode: 201,
      description: 'Created — The request succeeded and a new resource has been created.'
    },
    400: {
      status: 'error',
      statusCode: 400,
      description: 'Bad Request — The server cannot process the request due to malformed syntax.'
    },
    401: {
      status: 'error',
      statusCode: 401,
      description: 'Unauthorized — The request requires user authentication via Bearer Token.'
    },
    404: {
      status: 'error',
      statusCode: 404,
      description: 'Not Found — The server has not found anything matching the requested URI.'
    },
    429: {
      status: 'error',
      statusCode: 429,
      description: 'Too Many Requests — Rate limit exceeded. TryHackMe: Retry-After: 60s.',
      headers: { 'Retry-After': '60', 'X-RateLimit-Limit': '100', 'X-RateLimit-Remaining': '0' }
    },
    500: {
      status: 'error',
      statusCode: 500,
      description: 'Internal Server Error — Upstream microservice encountered an unexpected condition.'
    }
  };

  const payload = statusMap[code] || {
    status: 'unknown',
    statusCode: code,
    description: `HTTP Code ${code}`
  };

  logApiCall(code === 201 ? 'POST' : 'GET', url, code, duration, JSON.stringify(payload).length, payload);
  return payload;
}

