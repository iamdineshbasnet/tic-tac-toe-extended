import React from 'react';
import { chaoticOrbit } from 'ldrs';

chaoticOrbit.register();
const Loader: React.FC = () => {

	return (
		<>
			{/* <l-chaotic-orbit size="32" speed="1.5" color="black"></l-chaotic-orbit> */}
			<span className="ms-6 text-base">Please wait a moment</span>
		</>
	);
};

export default Loader;
