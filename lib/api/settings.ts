import axiosInstance from "./axios-instance"

const settingsApi = {
  get: () => 
    axiosInstance.get("/settings").then(res => res.data),
  
  update: (data: any) => 
    axiosInstance.post("/settings", data).then(res => res.data),
}

export default settingsApi
