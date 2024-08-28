import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PlayerProps } from '@/pages/room/redux/types';

interface UserCardProps {
	data: PlayerProps;
	showMark?: boolean;
}
const UserCard: React.FC<UserCardProps> = ({ data, showMark = true }) => {
	const { name, mark, image } = data
	return (
		<Card className="relative w-full">
			<CardContent className="p-4">
				<h5 className="text-center font-semibold mt-5">
					{name}{showMark && <span className="capitalize">({mark})</span>}
				</h5>
				<div className="absolute top-0 left-1/2 max-w-[60px] w-full h-[60px] -translate-x-1/2 -translate-y-1/2 aspect-square border rounded-full overflow-hidden  ">
					<img
						src={image}
						alt={name}
						className="w-full h-full aspect-square"
					/>
				</div>
			</CardContent>
		</Card>	
	);
};

export default UserCard;
