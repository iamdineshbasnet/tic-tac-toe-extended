// pages/AvatarPage.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface SeedDataProps {
	name: string;
	image: string;
}

const AvatarPage: React.FC = () => {
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
	const [seedData, setSeedData] = useState<SeedDataProps[]>([]);

	const handleUseAvatar = (index: number, link: string) => {
		setSelectedIndex(index);
		console.log('Selected PNG URL:', link);
	};

	useEffect(() => {
		const fetchAvatars = async () => {
			try {
				const response = await axios.get('http://localhost:3000/api/v1/avatar/generate');
				setSeedData(response.data);
			} catch (error) {
				console.error('Error fetching avatars:', error);
			}
		};
		fetchAvatars();
	}, []);
	return (
		<section className="text-center mt-12">
			<div className="w-[500px] mx-auto text-left">
				<h3 className="font-semibold text-xl">Avatars</h3>
				<h6 className="my-4">Bot</h6>
				<section className="grid grid-cols-4 gap-4 max-h-[80vh] overflow-auto">
					{seedData.map((seed: SeedDataProps, index) => (
						<div
							key={index}
							className={`text-center border rounded-md p-4 cursor-pointer ${
								selectedIndex === index ? 'border-green-500' : ''
							}`}
							onClick={() => handleUseAvatar(index, seed.image)}>
							<div className={`border mx-auto object-cover rounded-lg`}>
								<img src={seed?.image} />
							</div>
						</div>
					))}
				</section>
			</div>
		</section>
	);
};

export default AvatarPage;
