import { ModeToggle } from '@/components/mode-toggle'
import { Button } from '@/components/ui/button'
import React, { useEffect } from 'react'
import ProfileDropdown from './dropdown/profile'
import { useAppDispatch } from '@/utils/hooks/appHooks'
import { getPlayer } from '@/pages/profile/redux/thunk'
import getCookie from '@/utils/cookies/getCookie'

const Header: React.FC = () => {
  const dispatch = useAppDispatch()

  const isAuthenticated = getCookie('accessToken')

  useEffect(()=>{
    isAuthenticated && dispatch(getPlayer())
  }, [isAuthenticated])
  return (
    <header className='flex justify-between items-center border-b border-neutral-500 h-[60px] px-4'>

      <a href='/'>TIC TAC TOE</a>

      <div className='flex items-center gap-4'>
        <Button className='font-semibold capitalize'>classic</Button>
        <Button className='font-semibold capitalize' variant="outline">ultimate</Button>
      </div>

      <div className='flex items-center gap-4'>
        <ModeToggle />
        <ProfileDropdown />
      </div>
      
    </header>
  )
}

export default Header
