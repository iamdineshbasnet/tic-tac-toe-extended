import React from 'react'
import Header from './header'

interface LayoutProps{
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <main className='max-w-[1200px] mx-auto'>
      <Header />
      {children}
    </main>
  )
}

export default Layout
