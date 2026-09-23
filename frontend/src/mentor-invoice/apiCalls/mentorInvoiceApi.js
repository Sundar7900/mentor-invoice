import axios from 'axios';

// Safe BaseUrl resolution supporting Vite, standard browser, and fallback to :8080
const BaseUrl = (typeof window !== 'undefined' && window.REACT_APP_API_BASE_URL) ||
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  'http://localhost:8080';

/**
 * Creates configured axios client with Redux auth token interceptor
 * Adheres to HACKATHON_RULES.md (Rule 5: read token from Redux, no Bearer prefix)
 */
export const createApiClient = (getState) => {
  const client = axios.create({
    baseURL: BaseUrl,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.request.use((config) => {
    // Read token from Redux state: state.reducers.commonData.authToken
    if (typeof getState === 'function') {
      const state = getState();
      const token = state?.reducers?.commonData?.authToken || state?.commonData?.authToken;
      if (token) {
        // Rule 3: Client sends token as Authorization: <token>, with NO Bearer prefix
        config.headers['Authorization'] = token;
      }
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => {
      // Standard Zen response envelope: {"status":"success", "data": ...}
      if (response.data && response.data.status === 'success') {
        return response.data.data;
      }
      return response.data;
    },
    (error) => {
      const message = error.response?.data?.message || error.message || 'API request failed';
      return Promise.reject(new Error(message));
    }
  );

  return client;
};

// Default client instance
let defaultClient = createApiClient(() => null);

export const configureApiClient = (getState) => {
  defaultClient = createApiClient(getState);
};

// API Endpoints
export const fetchSummary = () => defaultClient.get('/mentor-invoice/summary');

export const fetchMentors = (start, end) => {
  let url = '/mentor-invoice/mentors';
  const params = [];
  if (start) params.push(`start=${start}`);
  if (end) params.push(`end=${end}`);
  if (params.length > 0) url += `?${params.join('&')}`;
  return defaultClient.get(url);
};

export const fetchInvoicePreview = (mentorHash, start, end) => {
  let url = `/mentor-invoice/preview?mentorHash=${encodeURIComponent(mentorHash)}`;
  if (start) url += `&start=${start}`;
  if (end) url += `&end=${end}`;
  return defaultClient.get(url);
};

export const generateInvoice = (payload) => defaultClient.post('/mentor-invoice/generate', payload);

export const fetchInvoiceList = () => defaultClient.get('/mentor-invoice/list');

export const fetchInvoiceById = (id) => defaultClient.get(`/mentor-invoice/${id}`);

export const updateInvoiceStatus = (id, status) => defaultClient.patch(`/mentor-invoice/${id}/status`, { status });

export const fetchMentorProfiles = () => defaultClient.get('/mentor-invoice/profiles');

export const saveMentorProfile = (profile) => defaultClient.post('/mentor-invoice/profiles', profile);
