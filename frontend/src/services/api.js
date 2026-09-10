const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function processAIPrompt({ prompt, currentFormData, conversationHistory, apiKey, model }) {
  const response = await fetch(`${API_BASE_URL}/api/ai/process`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      current_form_data: currentFormData,
      conversation_history: conversationHistory,
      api_key: apiKey || null,
      model: model || 'gemma2-9b-it'
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Network request failed' }));
    throw new Error(errorData.detail || `Server error: ${response.status}`);
  }

  return await response.json();
}

export async function uploadComplaintDocument({ file, apiKey, model }) {
  const formData = new FormData();
  formData.append('file', file);
  if (apiKey) formData.append('api_key', apiKey);
  if (model) formData.append('model', model);

  const response = await fetch(`${API_BASE_URL}/api/ai/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Upload processing failed' }));
    throw new Error(errorData.detail || `Server error: ${response.status}`);
  }

  return await response.json();
}

export async function getSampleDocuments() {
  const response = await fetch(`${API_BASE_URL}/api/ai/samples`);
  if (!response.ok) throw new Error('Failed to fetch sample documents');
  return await response.json();
}

export async function saveComplaint(complaintData) {
  const response = await fetch(`${API_BASE_URL}/api/complaints`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(complaintData)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Save failed' }));
    throw new Error(errorData.detail || `Server error: ${response.status}`);
  }

  return await response.json();
}

export async function getComplaints(filters = {}) {
  const params = new URLSearchParams(filters);
  const response = await fetch(`${API_BASE_URL}/api/complaints?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to load complaints registry');
  return await response.json();
}

export async function updateComplaintStatus(id, status) {
  const response = await fetch(`${API_BASE_URL}/api/complaints/${id}/status?status=${encodeURIComponent(status)}`, {
    method: 'PATCH'
  });
  if (!response.ok) throw new Error('Failed to update status');
  return await response.json();
}
