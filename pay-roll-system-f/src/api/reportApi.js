import axiosClient from './axiosClient';

export const reportApi = {
  getEPFCForm: (periodCode) => axiosClient.get(`/reports/epf-cform/${periodCode}`),
  getAllPayslips: (periodCode) => axiosClient.get(`/reports/payslips/period/${periodCode}`),
  getEmployeePayslip: (empId, periodCode) => axiosClient.get(`/reports/payslips/employee/${empId}/period/${periodCode}`),
  downloadBankTransferCsv: (payrollRunId) => axiosClient.get(`/reports/bank-transfer-csv/${payrollRunId}`, {
    responseType: 'blob',
  }),
};
