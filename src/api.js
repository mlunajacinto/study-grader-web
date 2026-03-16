const BASE = import.meta.env.VITE_RELAY_URL ?? 'http://localhost:8000'

async function request(method, path, body) {
  const opts = {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  }
  const res = await fetch(`${BASE}${path}`, opts)
  if (!res.ok) {
    const detail = await res.json().catch(() => ({ detail: res.statusText }))
    throw Object.assign(new Error(detail.detail ?? res.statusText), { status: res.status })
  }
  return res.json()
}

export const api = {
  health: () => request('GET', '/api/health'),
  models: () => request('GET', '/api/models'),
  chapters: () => request('GET', '/api/chapters'),
  sections: (path) => request('GET', `/api/sections?path=${encodeURIComponent(path)}`),
  grade: (model, sectionText, recallText) =>
    request('POST', '/api/grade', { model, section_text: sectionText, recall_text: recallText }),
  flashcards: (model, gradingResult, chapterName) =>
    request('POST', '/api/flashcards', {
      model,
      grading_result: gradingResult,
      chapter_name: chapterName,
    }),
}
