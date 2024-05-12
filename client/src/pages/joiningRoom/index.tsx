import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { setRoomCode } from '@/redux/slice';
import { socket } from '@/socket'
import { useAppDispatch } from '@/utils/hooks/appHooks';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const JoiningRoom: React.FC = () => {
  const [roomId, setRoomId] = useState<string>("")
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const generateRoomCode = () =>{
    socket.emit('createRoom')
  }
  
  const joinRoom = () =>{
    socket.emit('joinRoom', roomId)
  }

  socket.on('roomCreated', (roomId)=>{
    dispatch(setRoomCode(roomId))
    navigate('/waiting-room')
  })

  socket.on('joinedRoom', (roomId)=>{
    console.log(`Joined room with ID: ${roomId}`);
  })

	return (
		<main className="mt-12">
			<Card className="max-w-[500px] mx-auto">
				<CardHeader className="text-center font-semibold text-2xl">Enter Code</CardHeader>
				<CardContent>
					<Input value={roomId} onChange={(e)=> setRoomId(e.target.value)} placeholder='Enter 6 digits code' className="text-2xl text-center font-semibold my-6 py-6 tracking-wider" />

          <Button className='w-full font-semibold my-4' onClick={joinRoom}>
            Join Now
          </Button>

          <p className="text-center font-semibold">OR</p>

          <Button className='w-full font-semibold mt-4' variant="outline" onClick={generateRoomCode}>
            Generate Code
          </Button>

          
				</CardContent>
			</Card>
		</main>
	);
};

export default JoiningRoom;
