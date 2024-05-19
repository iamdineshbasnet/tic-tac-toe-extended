import { axiosInstance } from "@/utils/axiosInstance"


export const createRoom = () =>{
  return axiosInstance.post(`/room`)
}

export const joinRoom = (id: string) =>{
  return axiosInstance.put(`/room/${id}`)
}

export const getRoom = (id: string) =>{
  return axiosInstance.get(`/room/${id}`)
}
