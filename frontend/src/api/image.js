import api from "./client";

export const generateImageProcess = async (prompt) => {

  const {data} = await api.post("/images/generate", {prompt});
  return data;
  
};

export const getImageResult = async (jobId) => {
  const { data } = await api.get(`/images/status/${jobId}`);
  return data;
};

export const getImageHistory = async (page = 0, size = 10) => {
  const { data } = await api.get(`/images/history?page=${page}&size=${size}`);
  return data;
};


export const getUploadUrl = async (rootImageId) => {
  console.log(rootImageId)
  const { data } = await api.get(`uploads/images/${rootImageId}/edit`);
  console.log(data);
  return data;
};

export const imageUploadComplete = async (jobId) => {
  const { data } = await api.post(`uploads/images/edit/${jobId}/complete`);
  console.log(data);
  return data;
};