export interface PlayerProps{
  _id: string;
  name: string;
  mark: string;
  image: string;
  win: number;
  username: string;
}


export interface RoomDetailsProps{
  roomId: number;
  participants: PlayerProps[]
  turn?: string;
  board?: string[]
  creator: PlayerProps 
}
export interface RoomProps{
  round: number;
  mode: string;
  roomCode: string;
  roomDetails:  RoomDetailsProps | null
  loadingCreateRoom: boolean;
  loadingJoinRoom : boolean;
  loadingRoomDetails: boolean;
}