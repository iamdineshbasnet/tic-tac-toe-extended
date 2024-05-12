import UserCard from '@/components/card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { commonAppSelector } from '@/redux/selector';
import { useAppSelector } from '@/utils/hooks/appHooks';
import { Check, Copy } from 'lucide-react';
import React from 'react';

const WaitingRoom: React.FC = () => {
	const { roomCode } = useAppSelector(commonAppSelector)
	const pvp = [
		{
			id: 1,
			name: 'Player 1',
			win: 0,
			mark: 'x',
			image: 'https://i.imgur.com/A0vPzPd.jpg',
		},
		{
			id: 2,
			name: 'Player 2',
			win: 0,
			mark: 'o',
			image: 'https://i.imgur.com/A0vPzPd.jpg',
		},
	];
	return (
		<main className="mt-12">
			<Card className="max-w-[500px] mx-auto">
				<CardHeader className="text-center font-semibold text-2xl">
					Generated Code
				</CardHeader>
				<CardContent>
					<section className="flex items-center gap-4">
						<Input
							value={roomCode}
							readOnly
							className="text-2xl text-center font-semibold my-6 py-6 tracking-wider"
						/>
						<Button variant="outline" size="icon" className="p-6">
							<Copy className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />

							<Check className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
							<span className="sr-only">Copy Code</span>
						</Button>
					</section>
					<p className="text-center font-semibold">OR</p>
					<section className="flex items-center gap-4">
						<Input
							value="https://tictactoe.ultimate.com"
							readOnly
							className="text-lg text-center font-normal my-6 py-6"
						/>
						<Button variant="outline" size="icon" className="p-6">
							<Copy className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />

							<Check className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
							<span className="sr-only">Copy Code</span>
						</Button>
					</section>
				</CardContent>
			</Card>

			<section className="flex justify-between gap-20 max-w-[600px] mx-auto mt-20">
				<div className='w-full'>
					<UserCard data={pvp[0]} />
          <Button className='w-full font-semibold mt-4'>Ready</Button>
				</div>
				<div className='w-full'>
					<UserCard data={pvp[1]} />
          <Button className='w-full font-semibold mt-4'>Ready</Button>
				</div>
			</section>
		</main>
	);
};

export default WaitingRoom;
