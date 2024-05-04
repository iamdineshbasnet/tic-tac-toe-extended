import { ThemeProvider } from '@/components/theme-provider';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './pages/home';
import Layout from './layout';
function App() {
	return (
		<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
			<Layout>
				<Router>
					<Routes>
						<Route path="/" element={<Homepage />} />
					</Routes>
				</Router>
			</Layout>
		</ThemeProvider>
	);
}

export default App;
