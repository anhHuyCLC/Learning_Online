import apiClient from './apiClient';

export const getTransactions = async () => {
  const res = await apiClient.get('/transactions');
  return res.data;
};

export const getTransactionStats = async () => {
  const res = await apiClient.get('/transactions/stats');
  return res.data;
};