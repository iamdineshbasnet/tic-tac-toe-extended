import React from 'react';
import {
	Card,
	CardContent,
} from '@/components/ui/card';

const UserCard: React.FC = () => {
	return (
		<Card className='relative w-full'>
			<CardContent className='p-4'>
				<h5 className='text-center font-semibold mt-5'>Name</h5>
        <div className='absolute top-0 left-1/2 w-[60px] h-[60px] -translate-x-1/2 -translate-y-1/2 aspect-square border rounded-full overflow-hidden  '>
          <img src="https://placehold.co/200x200" alt="" className='w-full h-full aspect-square' />
        </div> 
			</CardContent>
		</Card>
	);
};

export default UserCard;
