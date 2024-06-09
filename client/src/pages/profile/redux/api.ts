import { axiosInstance } from "@/utils/axiosInstance"


// get player
export const getPlayer = () =>{
  return axiosInstance.get(`/player`)
}

// update player
export const updatePlayer = (body: {name?: string, image?: string})=>{
  return axiosInstance.patch(`/player`, body)
}

// delete player
export const deletePlayer = () =>{
  return axiosInstance.delete('/player')
}