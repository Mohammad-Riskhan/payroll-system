import axiosClient from './axiosClient';

export const statutoryRuleApi = {
  getAll: () => axiosClient.get('/statutory-rules'),
  getById: (id) => axiosClient.get(`/statutory-rules/${id}`),
  create: (data) => axiosClient.post('/statutory-rules', data),
  update: (id, data) => axiosClient.put(`/statutory-rules/${id}`, data),
  delete: (id) => axiosClient.delete(`/statutory-rules/${id}`),
};
