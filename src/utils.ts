export const getApiResponse = (data: any, status: string, message: string) => {
  return {
    data,
    status,
    message,
  };
};
