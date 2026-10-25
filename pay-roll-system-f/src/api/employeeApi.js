import axiosClient from './axiosClient';

export const employeeApi = {
  getAll: () => axiosClient.get('/employees'),
  getById: (id) => axiosClient.get(`/employees/${id}`),
  create: (data) => axiosClient.post('/employees', data),
  update: (id, data) => axiosClient.put(`/employees/${id}`, data),
  delete: (id) => axiosClient.delete(`/employees/${id}`),
  getSalaryComponents: (id) => axiosClient.get(`/employees/${id}/salary-components`),
  addSalaryComponent: (id, data) => axiosClient.post(`/employees/${id}/salary-components`, data),
  removeSalaryComponent: (componentId) => axiosClient.delete(`/employees/salary-components/${componentId}`),
};
