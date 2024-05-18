import { Card, CardHeader } from '@/components/ui/card';
import { profileSelector } from '@/pages/profile/redux/selector';
import { socket } from '@/socket';
import { useAppDispatch, useAppSelector } from '@/utils/hooks/appHooks';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setRoomCode, setRoomDetails } from '../redux/roomSlice';

const FindingRoom: React.FC = () => {
	const { player } = useAppSelector(profileSelector);
  
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

	useEffect(() => {
		player &&
			socket.on('find', (data) => {
        dispatch(setRoomDetails(data))
				dispatch(setRoomCode(data?.roomId))
				if(data){
          setTimeout(()=>{
            navigate(`/playground/${data?.roomId}`)
          }, 3000)
        }
			});

		return () => {
			socket.off('find');
		};
	}, [player]);

	useEffect(() => {
		player && socket.emit('find', player);
	}, [player]);
	return (
		<main className="mt-12">
			<Card>
				<CardHeader className="text-center font-semibold text-2xl">
					Finding Opponent
				</CardHeader>
			</Card>
		</main>
	);
};

export default FindingRoom;
