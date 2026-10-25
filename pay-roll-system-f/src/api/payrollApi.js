import axiosClient from './axiosClient';

export const payrollApi = {
  calculate: (periodCode) => axiosClient.post('/payroll/calculate', { periodCode }),
  lock: (payrollRunId) => axiosClient.post(`/payroll/${payrollRunId}/lock`),
  getAllRuns: () => axiosClient.get('/payroll/runs'),
  getRunById: (id) => axiosClient.get(`/payroll/runs/${id}`),
  getRunByPeriod: (periodCode) => axiosClient.get(`/payroll/runs/period/${periodCode}`),
  getRunLines: (id) => axiosClient.get(`/payroll/runs/${id}/lines`),
  generateBankBatch: (id) => axiosClient.post(`/payroll/${id}/bank-batch`),
  getBankBatches: (id) => axiosClient.get(`/payroll/${id}/bank-batches`),
};
