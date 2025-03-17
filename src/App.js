import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route }
	from 'react-router-dom';
import Home from './pages';
import AddVendor from './pages/add-vendor';
import SignIn from './pages/sign-in';
import Dashboard from './pages/dashboard';
import AddUser from './pages/add-user';
import VendorProfile from './pages/vendor-profile';
import Privacy from './pages/privacy';
import Receipts from './pages/receipts';
import AddDeal from './pages/add-deal';

function App() {
	document.title = "PerksPass";
	return (
		<Router>
			<Routes>
				<Route path='/' exact element={<Home />} />
				<Route path='/add-vendor' element={<AddVendor />} />
        		<Route path='/sign-in' element={<SignIn />} />
				<Route path='/dashboard' element={<Dashboard />} />
				<Route path='/add-user' element={<AddUser />} />
				<Route path='/vendor-profile/:id' element={<VendorProfile />} />
				<Route path='/privacy' element={<Privacy />} />
				<Route path='/receipts' element={<Receipts />} />
				<Route path='/add-deal/:id' element={<AddDeal />} />
			</Routes>
		</Router>
	);
}

export default App;
