import UserCard from '@/components/card'
import { getOrdinalSuffix } from '@/utils/functions/AppFunctions'
import React, { useEffect } from 'react'
import OfflineBoard from '@/components/board/offlineBoard'
import { useAppDispatch, useAppSelector } from '@/utils/hooks/appHooks'
import { roomSelector } from '../redux/selector'
import { useLocation } from 'react-router-dom'
import { setMode } from '../redux/roomSlice'

const pvp =[
  {
    _id: "1",
    name: 'Player 1',
    username: 'player1',
    image: 'https://i.imgur.com/A0vPzPd.jpg',
    isGuest: true,
    mark: 'x',
    win: 0,
  },
  {
    _id: "2",
    name: 'Player 2',
    username: 'player2',
    image: 'https://i.imgur.com/A0vPzPd.jpg',
    isGuest: true,
    mark: 'o',
    win: 0,
   },
]
const bot = [
  {
    _id: "1",
    name: 'Player 1',
    username: 'player1',
    image: 'https://i.imgur.com/A0vPzPd.jpg',
    isGuest: true,
    mark: 'x',
    win: 0,
  },
  {
    _id: "2",
    name: 'Player 2',
    username: 'player2',
    image: 'https://i.imgur.com/A0vPzPd.jpg',
    isGuest: true,
    mark: 'o',
    win: 0,
  }
]
const Offline: React.FC = () => {
  const dispatch = useAppDispatch()
  const { round, mode } = useAppSelector(roomSelector)
  const players = mode === 'pvp' ? pvp : bot
  const { pathname } = useLocation()

  const type = pathname.split('/offline/')[1]
  useEffect(()=>{
    dispatch(setMode(type))
  }, [type])
  return (
    <main className="mt-20 max-w-[900px] w-[100vw] px-4 mx-auto">
    <section className="flex justify-between gap-12">
      {players && <UserCard data={players[0]} />}
      <div className="w-[80px] h-[80px] min-w-[80px] aspect-square border rounded-full flex items-center flex-col justify-center">
        <p className="text-center text-sm">
          {round}
          <sup>{getOrdinalSuffix(round)}</sup>
        </p>
        <h5 className="text-center text-sm">Round</h5>
      </div>
      {players && <UserCard data={players[1]} />}
    </section>
    <section className="flex items-center justify-center mt-24">
        <OfflineBoard
          type={mode === 'pvp' ? "player" : 'bot'}
          choice="x"
          random={false}
          player={players}
        />
      
    </section>
  </main>
  )
}

export default Offline
