import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from "react-router-dom";
import '../App.css';
import { signOut } from '../../node_modules/firebase/auth/';
import { auth, db } from '../firebase-config';

const Dashboard = () => {

	useEffect(() => {
		if (!auth.currentUser) {
			navigate("/perkspass/sign-in");
		} else {
			isUserAdmin();
			getCurrentUser();
		}
	}, []);
	const navigate = useNavigate();

	const [userCount, setUserCount] = useState(0);
	const [vendorCount, setVendorCount] = useState(0);
	const [vendors, setVendors] = useState([]);

	const logout = async () => {
		await signOut(auth);
		navigate("/perkspass/sign-in");
	}

	const isUserAdmin = async () => {
		const snapshot = await db.collection("Admins").get();
		if (snapshot.docs[0].data().IDs.includes(auth.currentUser.uid)) {
			countUsersAdmin();
			getVendorsAdmin();
			document.getElementById("add-user").classList.remove('hide');
		} else {
			countUsersAdmin();
			getVendors();
		}
	}

	const getVendors = async () => {
		const snapshot = await db.collection("Establishments")
		.where('AffiliateID', '==', auth.currentUser.uid).orderBy('Name').get();
		const documents = snapshot.docs.map(doc => ({
			id: doc.id,
			...doc.data(),
		}));
		setVendorCount(snapshot.size);
		setVendors(documents);
	}

	const countUsersAdmin = async () => {
		const snapshot = await db.collection("Users").get();
		setUserCount(snapshot.size);
	}

	const getVendorsAdmin = async () => {
		const snapshot = await db.collection("Establishments").orderBy('Name').get();
		const documents = snapshot.docs.map(doc => ({
			id: doc.id,
			...doc.data(),
		}));
		setVendorCount(snapshot.size);
		setVendors(documents);
	}

	const getCurrentUser = async () => {
		const currentUser = await auth.currentUser;
		setUserEmail(currentUser.email);
	}

	/*function showProfile() {
		document.getElementById("profile").style.visibility = "visible";
	}*/

	const [userEmail, setUserEmail] = useState("");

	return (
		<div>
			<div className='topbar space'>
				<NavLink to="/perkspass">
					<img src='https://firebasestorage.googleapis.com/v0/b/localperkstest.appspot.com/o/perkspass.png?alt=media&token=899760db-0c70-4284-9425-f45543329990&_gl=1*1gkdcls*_ga*MTkxMzE3MzM5Mi4xNjg5MTE2MzM4*_ga_CW55HF8NVT*MTY5NjI4MDc4Ni44Ni4xLjE2OTYyODA4MDAuNDYuMC4w' to="/" alt="PerksPass Logo"></img>
				</NavLink>
				<div className='row center'>
					<NavLink to="/perkspass/add-user" className="hide" id="add-user">
						<p className='link'>Add User</p>
					</NavLink>
					<NavLink to="/perkspass/add-vendor">
						<p className='link'>Add Vendor</p>
					</NavLink>
					<div className="profile row center" onClick={() => {document.getElementById("profile").style.visibility === "visible" ? 
					document.getElementById("profile").style.visibility = "hidden" :
					document.getElementById("profile").style.visibility = "visible"}}>
						<i className="fa-solid fa-user mr8"></i>
						<p>{userEmail}</p>
					</div>
					<div id="profile" className='center' onClick={logout}>
						<p style={{margin: 0}} className='link'>Sign Out</p>
					</div>
				</div>

			</div>
			<div className='col center'>
				<h1>Affiliate Dashboard</h1>
				<h2>User Count: {userCount}</h2>
				<h2>Vendors: {vendorCount}</h2>
			</div>
			<div className='table'>
				<table>
					<thead>
						<tr>
							<th>Name</th>
							<th>City</th>
							<th>State</th>
							<th>Status</th>
							<th>Category</th>
							<th>Type</th>
							<th>Discount</th>
							<th>Promo Code</th>
							<th>Phone</th>
							<th>Online Ordering?</th>
						</tr>
					</thead>
					<tbody>
						{vendors.map(doc => (
							<tr key={doc.id} onClick={() => navigate("/perkspass/vendor-profile/" + doc.id)}>
								<td>{doc.Name}</td>
								<td>{doc.City}</td>
								<td>{doc.State}</td>
								<td>{doc.Active === true? "Active" : "Inactive"}</td>
								<td>{doc.Category}</td>
								<td>{doc.TypeOfThing}</td>
								<td>{doc.Discount}</td>
								<td>{doc.PromoCode}</td>
								<td>{doc.Phone}</td>
								<td>{doc.OnlineOrdering === true? "Yes" : "No"}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default Dashboard;