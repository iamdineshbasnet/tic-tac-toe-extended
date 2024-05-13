import { axiosInstance } from "@/utils/axiosInstance"


export const createRoom = () =>{
  return axiosInstance.post(`/room`)
}

export const joinRoom = (uid: string, id: number) =>{
  return axiosInstance.put(`/room/${uid}/${id}`)
}
export const getRoom = (uid: string, id: number) =>{
  return axiosInstance.get(`/room/${uid}/${id}`)
}
