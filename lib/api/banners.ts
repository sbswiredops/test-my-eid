import axiosInstance from "./axios-instance"

const bannersApi = {
  getHeroBanners: () => 
    axiosInstance.get("/herobanner").then(res => res.data),
  
  createHeroBanner: (data: FormData) => 
    axiosInstance.post("/herobanner", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(res => res.data),
  
  getBottomBanners: () => 
    axiosInstance.get("/herobanner/bottom").then(res => res.data),
  
  createBottomBanner: (data: FormData) => 
    axiosInstance.post("/herobanner/bottom", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(res => res.data),
  
  // Similarly for middle, give
  getMiddleBanners: () => 
    axiosInstance.get("/herobanner/middle").then(res => res.data),
  
  getGiveBanners: () => 
    axiosInstance.get("/herobanner/give").then(res => res.data),
}

export default bannersApi
