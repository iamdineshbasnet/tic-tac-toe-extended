import React from 'react';
import { tailChase } from 'ldrs';

tailChase.register();
const Loader: React.FC = () => {

	return (
		<>
			<l-tail-chase size="24" speed="1.5" color="black"></l-tail-chase>
		</>
	);
};

export default Loader;
