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
			getAffiliates();
		}
	}, []);
	const navigate = useNavigate();

	const [affiliates, setAffiliates] = useState({});

	const [userCount, setUserCount] = useState(0);
	const [vendorCount, setVendorCount] = useState(0);
	const [vendors, setVendors] = useState([]);
	const [zipCodeData, setZipCodeData] = useState({});
	const [zipCodeCount, setZipCodeCount] = useState({});

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

	const getZipCount = async () => {
		const snapshot = await db.collection("ZipCount").get();
		const documents = snapshot.docs.map(doc => ({
			id: doc.id,
			...doc.data(),
		}));
		setZipCodeCount(documents);
		console.log(zipCodeCount);
		let csvContent = "Zip, Number of Users\n";

		for (const key in zipCodeCount) {
			csvContent += key + ", ";
			csvContent += zipCodeCount[key] + "\n";
		}

		downloadCSVFile(csvContent);
	}

	const getZipCodes = async () => {
		const snapshot = await db.collection("Users").get();
		const zipData = {};
		snapshot.forEach((doc) => {
			if (doc.data().ZipCode) {
				let zip = parseInt(doc.data().ZipCode);
				//zipData[zip] = 1;
				if (zipData[zip] >= 1) {
					zipData[zip] += 1;
				} else {
					zipData[zip] = 1;
				}
				
			}
		})
		setZipCodeData(zipData);
		let jsn = {};
		Object.entries(zipCodeData).forEach(([key, value]) => {
			jsn[key] = value;
		});
		//console.log(jsn);
		const ZipRef = db.collection("ZipCount");
		const docSnapshot = await ZipRef.limit(1).get();
		const firstDoc = docSnapshot.docs[0];
		await ZipRef.doc(firstDoc.id).update({
			Data: jsn
		});
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

	const getAffiliates = async () => {
		const snapshot = await db.collection("Affiliates").get();
		const a = {};
		snapshot.forEach(doc => {
			a[doc.id] = doc.data().Name;
		});
		setAffiliates(a);
	}

	const getCurrentUser = async () => {
		const currentUser = await auth.currentUser;
		setUserEmail(currentUser.email);
	}

	/*function showProfile() {
		document.getElementById("profile").style.visibility = "visible";
	}*/

	const [userEmail, setUserEmail] = useState("");

	function downloadCSVFile(csv_data) {
 
		// Create CSV file object and feed
		// our csv_data into it
		let CSVFile = new Blob([csv_data], {
			type: "text/csv"
		});

		// Create to temporary link to initiate
		// download process
		var temp_link = document.createElement('a');

		// Download csv file
		temp_link.download = "Vendors.csv";
		var url = window.URL.createObjectURL(CSVFile);
		temp_link.href = url;

		// This link should not be displayed
		temp_link.style.display = "none";
		document.body.appendChild(temp_link);

		// Automatically click the link to
		// trigger download
		temp_link.click();
		document.body.removeChild(temp_link);
	}

	function createCSV() {
		let csvContent = "Active, Address, Affiliate, App Launch Date, Category, City, Contact Email," +
			" Contact Name, Contact Phone, Contract Ends, Customer Phone, Disclaimer, Discount," + 
			" Name, Notes, Latitude, Longitude, Online Ordering, POS Name, POS Setup, Promo Code, Reminder Email, Reminder Phone," + 
			" Revetize Fee, State, Terms Signed, Type of Thing, Website, Zip\n";

		vendors.map(doc => {
			csvContent += doc.Active ? "Yes, " : "No, ";
			csvContent += doc.Address ? `"${doc.Address}", ` : "N/A, ";
			csvContent += affiliates[doc.AffiliateID] ? `"${affiliates[doc.AffiliateID]}", ` : "N/A, ";
			csvContent += doc.AppLaunchDate ? doc.AppLaunchDate.toDate().toDateString() + ", " : "N/A, ";
			csvContent += doc.Category ? `"${doc.Category}", ` : "N/A, ";
			csvContent += doc.City ? `"${doc.City}", ` : "N/A, ";
			csvContent += doc.ContactEmail ? `"${doc.ContactEmail}", ` : "N/A, ";
			csvContent += doc.ContactName ? `"${doc.ContactName}", ` : "N/A, ";
			csvContent += doc.ContactPhone ? `"${doc.ContactPhone}", ` : "N/A, ";
			csvContent += doc.ContractEnds ? doc.ContractEnds.toDate().toDateString() + ", " : "N/A, ";
			csvContent += doc.Phone ? `"${doc.Phone}", ` : "N/A, ";
			csvContent += doc.Disclaimer ? `"${doc.Disclaimer}", ` : "N/A, ";
			csvContent += doc.Discount ? doc.Discount + ", " : "N/A, ";
			csvContent += doc.Name ? `"${doc.Name}", ` : "N/A, ";
			csvContent += doc.Notes ? `"${doc.Notes}", ` : "N/A, ";
			csvContent += doc.latLon._lat ? doc.latLon._lat + ", " : "N/A, ";
			csvContent += doc.latLon._long ? doc.latLon._long + ", " : "N/A, ";
			csvContent += doc.OnlineOrdering ? "Yes, " : "No, ";
			csvContent += doc.POSName ? `"${doc.POSName}", ` : "N/A, ";
			csvContent += doc.POSSetup ? "Yes, " : "No, ";
			csvContent += doc.PromoCode ? `"${doc.PromoCode}", ` : "N/A, ";
			csvContent += doc.ReminderEmail ? `"${doc.ReminderEmail}", ` : "N/A, ";
			csvContent += doc.ReminderPhone ? `"${doc.ReminderPhone}", ` : "N/A, ";
			csvContent += doc.Fee ? `"${doc.Fee}", ` : "N/A, ";
			csvContent += doc.State ? `"${doc.State}", ` : "N/A, ";
			csvContent += doc.TermsSigned ? "Yes, " : "No, ";
			csvContent += doc.TypeOfThing ? `"${doc.TypeOfThing}", ` : "N/A, ";
			csvContent += doc.Website ? `"${doc.Website}", ` : "N/A, ";
			csvContent += doc.Zip ? `"${doc.Zip}", ` : "N/A, ";
			csvContent += "\n";
		});

		downloadCSVFile(csvContent);
	}

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
			<div className='col center' id="rel">
				<h1>Affiliate Dashboard</h1>
				<h2>User Count: {userCount}</h2>
				<h2>Vendors: {vendorCount}</h2>
				<i id="download" className="fas fa-download" onClick={() => createCSV()}></i>
				<div id="usersTab" className='row'>
					<h2 className='active'>Vendors</h2>
					<h2 className='ml24 inactive' onClick={() => getZipCodes()}>Users</h2>
				</div>
				
			</div>
			<div className='table'>
				<table>
					<thead>
						<tr>
							<th className='name'>NAME</th>
							<th>STATUS</th>
							<th>POS SETUP?</th>
							<th>TERMS SIGNED?</th>
							<th>CITY</th>
							<th>STATE</th>
							<th>CATEGORY</th>
							<th>TYPE</th>
							<th>DISCOUNT</th>
							<th>PROMO CODE</th>
							<th className='phone'>PHONE</th>
							<th className='name'>AFFILIATE</th>
						</tr>
					</thead>
					<tbody>
						{vendors.map(doc => (
							<tr key={doc.id} onClick={() => navigate("/perkspass/" + "vendor-profile/" + doc.id)}>
								<td>{doc.Name}</td>
								<td>{doc.Active === true? "Active" : "Inactive"}</td>
								<td>{doc.POSSetup && doc.POSSetup === true? "Yes" : "No"}</td>
								<td>{doc.TermsSigned && doc.TermsSigned === true? "Yes" : "No"}</td>
								<td>{doc.City}</td>
								<td>{doc.State}</td>
								<td>{doc.Category}</td>
								<td>{doc.TypeOfThing}</td>
								<td>{doc.Discount}</td>
								<td>{doc.PromoCode}</td>
								<td>{doc.Phone}</td>
								<td>{affiliates[doc.AffiliateID]}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default Dashboard;