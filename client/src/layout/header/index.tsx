import { ModeToggle } from '@/components/mode-toggle'
import { Button } from '@/components/ui/button'
import { Info } from 'lucide-react'
import React from 'react'

const Header: React.FC = () => {
  return (
    <header className='flex justify-between items-center border-b border-neutral-500 h-[60px] px-4'>

      <h5>TIC TAC TOE</h5>

      <div className='flex items-center gap-4'>
        <Button className='font-semibold capitalize' variant="outline">classic</Button>
        <Button className='font-semibold capitalize' variant="outline">ultimate</Button>
      </div>

      <div className='flex items-center gap-4'>
        <p>
        <Info />
        </p>
        <ModeToggle />
      </div>
      
    </header>
  )
}

export default Header
