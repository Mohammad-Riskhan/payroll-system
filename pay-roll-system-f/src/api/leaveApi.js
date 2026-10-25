import axiosClient from './axiosClient';

export const leaveApi = {
  getTypes: () => axiosClient.get('/leaves/types'),
  getBalances: (empId, year = 2026) => axiosClient.get(`/leaves/balances/employee/${empId}?year=${year}`),
  apply: (data) => axiosClient.post('/leaves/apply', data),
  getAllRequests: (status) => axiosClient.get(`/leaves/requests${status ? `?status=${status}` : ''}`),
  getEmployeeRequests: (empId) => axiosClient.get(`/leaves/requests/employee/${empId}`),
  updateStatus: (id, status) => axiosClient.patch(`/leaves/requests/${id}/status?status=${status}`),
};
