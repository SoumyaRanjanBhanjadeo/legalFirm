import api from './api';

const CLIENTS_ENDPOINT = '/clients';
const CASES_ENDPOINT = '/cases';

// ==================== CLIENTS ====================

export const getClients = async (page = 1, limit = 10) => {
  const response = await api.get(CLIENTS_ENDPOINT, {
    params: { page, limit }
  });
  return response.data;
};

export const createClient = async (clientData) => {
  const response = await api.post(CLIENTS_ENDPOINT, clientData);
  return response.data;
};

export const updateClient = async (clientId, clientData) => {
  const response = await api.put(`${CLIENTS_ENDPOINT}/${clientId}`, clientData);
  return response.data;
};

export const deleteClient = async (clientId) => {
  const response = await api.delete(`${CLIENTS_ENDPOINT}/${clientId}`);
  return response.data;
};

// ==================== CASES ====================

export const getCases = async (page = 1, limit = 10) => {
  const response = await api.get(CASES_ENDPOINT, {
    params: { page, limit }
  });
  return response.data;
};

export const createCase = async (caseData) => {
  const response = await api.post(CASES_ENDPOINT, caseData);
  return response.data;
};

export const updateCase = async (caseId, caseData) => {
  const response = await api.put(`${CASES_ENDPOINT}/${caseId}`, caseData);
  return response.data;
};

export const deleteCase = async (caseId) => {
  const response = await api.delete(`${CASES_ENDPOINT}/${caseId}`);
  return response.data;
};

export default {
  getClients,
  createClient,
  updateClient,
  deleteClient,
  getCases,
  createCase,
  updateCase,
  deleteCase
};
