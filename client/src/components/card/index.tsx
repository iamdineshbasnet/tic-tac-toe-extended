import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PlayerProps } from '@/pages/room/redux/types';

interface UserCardProps {
	data: PlayerProps
}
const UserCard: React.FC<UserCardProps> = ({ data }) => {
	const { name, mark, image } = data
	console.log(name, mark, image, 'name mark and image	')
	return (
		<Card className="relative w-full">
			<CardContent className="p-4">
				<h5 className="text-center font-semibold mt-5">
					{name} <span className="capitalize">({mark})</span>
				</h5>
				<div className="absolute top-0 left-1/2 w-[60px] h-[60px] -translate-x-1/2 -translate-y-1/2 aspect-square border rounded-full overflow-hidden  ">
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
