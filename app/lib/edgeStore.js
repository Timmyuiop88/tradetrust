import { EdgeStore } from '@edgestore/sdk';

const edgeStore = new EdgeStore({
  projectId: process.env.EDGE_STORE_PROJECT_ID,
  apiKey: process.env.EDGE_STORE_API_KEY,
});

export const uploadKycDocument = async (file) => {
  const response = await edgeStore.upload(file);
  return response.url; // Return the URL of the uploaded document
}; 