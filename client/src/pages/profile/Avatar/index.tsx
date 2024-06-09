// pages/AvatarPage.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAppDispatch, useAppSelector } from '@/utils/hooks/appHooks';
import { updatePlayer } from '../redux/thunk';
import { profileSelector } from '../redux/selector';



const AvatarPage: React.FC = () => {
	const dispatch = useAppDispatch();
	const [seedData, setSeedData] = useState<string[]>([]);
	const { player } = useAppSelector(profileSelector)

	const handleUseAvatar = (link: string) => {
		dispatch(updatePlayer({ image: link }))
			.unwrap()
			.then((res) => {
				console.log(res, 'response');
			})
			.catch((error) => {
				console.log(error.message, 'error message');
			});
	};

	useEffect(() => {
		const fetchAvatars = async () => {
			try {
				const response = await axios.get('http://localhost:3000/api/v1/avatar');
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
					{seedData.map((seed, index) => (
						<div
							key={index}
							className={`text-center border rounded-md p-4 cursor-pointer ${
								player?.image === seed ? 'border-green-500' : ''
							}`}
							onClick={() => handleUseAvatar(seed)}>
							<div className={`border mx-auto object-cover rounded-lg`}>
								<img src={seed} />
							</div>
						</div>
					))}
				</section>
			</div>
		</section>
	);
};

export default AvatarPage;
