import { axiosInstance } from "@/utils/axiosInstance"


export const getPlayer = () =>{
  return axiosInstance.get(`/player`)
}