import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const auth = {
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

export const createCrudService = (endpoint) => ({
  getAll: () => api.get(`/${endpoint}`),
  getOne: (id) => api.get(`/${endpoint}/${id}`),
  create: (data) => api.post(`/${endpoint}`, data),
  update: (id, data) => api.put(`/${endpoint}/${id}`, data),
  delete: (id) => api.delete(`/${endpoint}/${id}`),
});

export const plots = createCrudService('plots');
export const burialRecords = createCrudService('burial-records');
export const deeds = createCrudService('deeds');
export const intermentSchedules = createCrudService('interment-schedules');
export const preNeedContracts = createCrudService('pre-need-contracts');
export const monumentOrders = createCrudService('monument-orders');
export const perpetualCareFunds = createCrudService('perpetual-care-funds');
export const groundsMaintenance = createCrudService('grounds-maintenance');
export const flowerPlacements = createCrudService('flower-placements');
export const ceremonySchedules = createCrudService('ceremony-schedules');
export const vendors = createCrudService('vendors');
export const complianceRecords = createCrudService('compliance-records');
export const memorialEvents = createCrudService('memorial-events');
export const genealogyRecords = createCrudService('genealogy-records');
export const paymentPlans = createCrudService('payment-plans');
export const cremationNiches = createCrudService('cremation-niches');
export const veteranRecords = createCrudService('veteran-records');
export const deedTransfers = createCrudService('deed-transfers');

export const ai = {
  obituary: (data) => api.post('/ai/obituary', data),
  inscription: (data) => api.post('/ai/inscription', data),
  maintenancePrediction: (data) => api.post('/ai/maintenance-prediction', data),
  genealogy: (data) => api.post('/ai/genealogy', data),
  memorialPage: (data) => api.post('/ai/memorial-page', data),
  bereavement: (data) => api.post('/ai/bereavement', data),
};

export default api;
