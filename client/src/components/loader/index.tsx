import React from 'react';
import { tailChase } from 'ldrs';
import { useTheme } from '../theme-provider';

tailChase.register();

interface LoaderProps{
	variant?: "outline" | "solid"
	size?: string;
}
const Loader: React.FC<LoaderProps> = ({ variant = "outline", size="24" }) => {
	const { theme } = useTheme()
	let loaderColor;
	if (variant === "solid") {
		loaderColor = theme === 'light' ? "white" : "black"; 
	} else {
		loaderColor = theme === 'light' ? "black" : "white";
	}

	return (
		<>
			<l-tail-chase size={size} speed="1.5" color={loaderColor}></l-tail-chase>
		</>
	);
};

export default Loader;
