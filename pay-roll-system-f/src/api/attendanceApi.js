import axiosClient from './axiosClient';

export const attendanceApi = {
  recordAttendance: (data) => axiosClient.post('/attendance', data),
  getPeriodAttendance: (payPeriod) => axiosClient.get(`/attendance/period/${payPeriod}`),
  getEmployeeAttendance: (empId, payPeriod) => axiosClient.get(`/attendance/employee/${empId}/period/${payPeriod}`),
  recordOvertime: (data) => axiosClient.post('/attendance/overtime', data),
  getPeriodOvertime: (payPeriod) => axiosClient.get(`/attendance/overtime/period/${payPeriod}`),
  getEmployeeOvertime: (empId, payPeriod) => axiosClient.get(`/attendance/overtime/employee/${empId}/period/${payPeriod}`),
};
