import axiosClient from './axiosClient';

export const organizationApi = {
  getCompany: () => axiosClient.get('/organization/company'),
  getBranches: () => axiosClient.get('/organization/branches'),
  getDepartments: () => axiosClient.get('/organization/departments'),
  getDesignations: () => axiosClient.get('/organization/designations'),
  getPayComponents: () => axiosClient.get('/organization/pay-components'),
  createPayComponent: (data) => axiosClient.post('/organization/pay-components', data),
  getSalaryStructures: () => axiosClient.get('/organization/salary-structures'),
  createSalaryStructure: (data) => axiosClient.post('/organization/salary-structures', data),
};
