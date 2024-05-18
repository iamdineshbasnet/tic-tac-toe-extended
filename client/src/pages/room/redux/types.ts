export interface PlayerProps{
  _id: number;
  name: string;
  mark: string;
  image?: string;
  win?: number;
}


export interface RoomDetailsProps{
  roomId: number;
  participants: PlayerProps[]
  turn?: string;
  board?: string[]
}
export interface RoomProps{
  round: number;
  mode: string;
  roomCode: string;
  roomDetails:  RoomDetailsProps | null
}