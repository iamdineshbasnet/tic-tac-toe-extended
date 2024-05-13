export interface PlayerProps{
  id: number;
  name: string;
  mark: string;
  image?: string;
  win: number;
}

export interface RoomProps{
  round: number;
  mode: string;
  roomCode: string;
}