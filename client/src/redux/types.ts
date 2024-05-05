export interface PlayerProps{
  id: number;
  name: string;
  mark: string;
  image?: string;
  win: number;
}

export interface CommonProps{
  round: number;
  mode: string;
}