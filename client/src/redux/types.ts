

export interface CommonProps{
  turn: string;
  data: string[];
  isDraw: boolean;
  history: number[];
  disabledCell: number | null;
  winningCombination: number[]
}