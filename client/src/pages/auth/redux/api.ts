import { axiosInstance } from "@/utils/axiosInstance"

export const guestRegistration = (body: {name: string}) =>{
  return axiosInstance.post(`/auth/guest-registration`, body)
}