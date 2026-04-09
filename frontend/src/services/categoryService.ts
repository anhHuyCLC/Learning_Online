import apiClient from './apiClient';

export const getCategories = async () => {
  const res = await apiClient.get('/categories');
  return res.data;
};

export const deleteCategory = async (id: number) => {
  const res = await apiClient.delete(`/categories/${id}`);
  return res.data;
};

export const saveCategory = async (category: any) => {
  const url = category.id ? `/categories/${category.id}` : `/categories`;
  const res = await apiClient({ method: category.id ? 'put' : 'post', url, data: category });
  return res.data;
};