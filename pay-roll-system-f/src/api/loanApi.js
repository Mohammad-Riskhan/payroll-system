import axiosClient from './axiosClient';

export const loanApi = {
  getAll: () => axiosClient.get('/loans'),
  create: (data) => axiosClient.post('/loans', data),
  getEmployeeLoans: (empId) => axiosClient.get(`/loans/employee/${empId}`),
};
