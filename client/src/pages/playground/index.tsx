import Board from '@/components/board';
import UserCard from '@/components/card';
import { Button } from '@/components/ui/button';
import React from 'react';

const Playground: React.FC = () => {
	return (
		<main className="mt-20 w-[900px] mx-auto">
			<section className="flex justify-between gap-12">
				<UserCard />
				<div className="w-[80px] h-[80px] aspect-square border rounded-full flex items-center flex-col justify-center">
					<p className="text-center text-sm">
						1<sup>st</sup>
					</p>
					<h5 className="text-center text-sm">Round</h5>
				</div>
				<UserCard />
			</section>
			<section className="flex items-center justify-center mt-24">
				<Board type="bot" />
			</section>
		</main>
	);
};

export default Playground;
