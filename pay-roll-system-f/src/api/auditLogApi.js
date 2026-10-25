import axiosClient from './axiosClient';

export const auditLogApi = {
  getRecentLogs: (entityName) => axiosClient.get(`/audit-logs${entityName ? `?entityName=${entityName}` : ''}`),
};
