import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from "react-router-dom";
import '../App.css';
import { signOut } from '../../node_modules/firebase/auth/';
import { auth, db } from '../firebase-config';

const Dashboard = () => {

	const [zipCodeCount, setZipCodeCount] = useState({});

	useEffect(() => {
		if (!auth.currentUser) {
			navigate("/sign-in");
		} else {
			isUserAdmin();
			getCurrentUser();
			getAffiliates();
		}
	}, []);

	const userZip = (obj) => {
		if (document.getElementById('userTable').getElementsByTagName('td').length) {
			return
		}
		let html = '';
		if(obj[0] && obj[0].Data) {
		}
		if (obj[0] && obj[0].Data && typeof obj[0].Data === 'object') {
				Object.keys(obj[0].Data).forEach((key) => {
					if (key === "Total") {
						setUserCount(obj[0].Data[key]);
					} else {
						let tab = document.getElementById('userTable');
						let tr = document.createElement("tr");
						let td1 = document.createElement("td");
						td1.textContent = key;
						let td2 = document.createElement("td");
						td2.textContent = obj[0].Data[key];
						tr.appendChild(td1);
						tr.appendChild(td2);
						tab.appendChild(tr);
					}
				});
			
				
		}
		
	}

	const resetUserTable = () => {
		let usrTab = document.getElementById("userTable");
		while (usrTab.childElementCount > 1) {
			usrTab.removeChild(usrTab.lastChild);
		}
	}

	const showUserTable = () => {
		document.getElementsByClassName("table user")[0].classList.remove("hide");
		document.getElementsByClassName("table vendor")[0].classList.add("hide");
		document.getElementById("vend_tab").classList.remove("active");
		document.getElementById("vend_tab").classList.add("inactive");
		document.getElementById("user_tab").classList.add("active");
		document.getElementById("user_tab").classList.remove("inactive");
		document.getElementById("UserCount").classList.remove("hide");
		document.getElementById("VendorCount").classList.add("hide");
		document.getElementById("search").classList.add("hide");

		//userZip();
	}

	const showVendorTable = () => {
		document.getElementsByClassName("table user")[0].classList.add("hide");
		document.getElementsByClassName("table vendor")[0].classList.remove("hide");
		document.getElementById("vend_tab").classList.add("active");
		document.getElementById("vend_tab").classList.remove("inactive");
		document.getElementById("user_tab").classList.remove("active");
		document.getElementById("user_tab").classList.add("inactive");
		document.getElementById("UserCount").classList.add("hide");
		document.getElementById("VendorCount").classList.remove("hide");
		document.getElementById("search").classList.remove("hide");
	}
	const navigate = useNavigate();

	const [affiliates, setAffiliates] = useState({});

	const [userCount, setUserCount] = useState(0);
	const [vendorCount, setVendorCount] = useState(0);
	const [vendors, setVendors] = useState([]);
	const [vendorsCP, setVendorsCP] = useState([]);
	const [sortColumn, setSortColumn] = useState("Name");
	const [sortAsc, setSortAsc] = useState(true);

	const logout = async () => {
		await signOut(auth);
		navigate("/sign-in");
	}

	const isUserAdmin = async () => {
		const snapshot = await db.collection("Admins").get();
		getZipCount();
		if (snapshot.docs[0].data().IDs.includes(auth.currentUser.uid)) {
			getVendorsAdmin();
			document.getElementById("add-user").classList.remove('hide');
			document.getElementById("add-user2").classList.remove('hide');
			document.getElementById("refresh").classList.remove('hide');
		} else {
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

		const snapshot2 = await db.collection("Establishments")
		.where('SecondaryAffiliate', '==', auth.currentUser.uid).orderBy('Name').get();
		const documents2 = snapshot2.docs.map(doc => ({
			id: doc.id,
			...doc.data(),
		}));
		setVendorCount(snapshot.size + snapshot2.size);
		setVendors([...documents, ...documents2]);
		setVendorsCP([...documents, ...documents2]);
	}

	const getZipCount = async () => {
		const snapshot = await db.collection("ZipCount").get();
		const documents = snapshot.docs.map(doc => ({
			id: doc.id,
			...doc.data(),
		}));
		setZipCodeCount({
			Data: documents[0].Data
		});

		userZip(documents);
	}

	/*const deleteAllUsers = async () => {
		const snapshot = await db.collection("Users").get();
		snapshot.forEach((doc) => {
			doc.ref.delete();
		})
	}*/

	// OLD CODE
	/*const getZipCodes = async () => {
		const snapshot = await db.collection("Users").get();
		const zipData = {};
		let counter = 0;
		snapshot.forEach((doc) => {
			counter += 1;
			if (doc.data().ZipCode) {
				let zip = parseInt(doc.data().ZipCode);
				if (zipData[zip] >= 1) {
					zipData[zip] += 1;
				} else {
					zipData[zip] = 1;
				}
				
			}
		})
		setUserCount(counter);
		let jsn = {};
		jsn["Total"] = counter;
		Object.entries(zipData).forEach(([key, value]) => {
			jsn[key] = value;
		});
		const ZipRef = db.collection("ZipCount");
		const docSnapshot = await ZipRef.limit(1).get();
		const firstDoc = docSnapshot.docs[0];
		await ZipRef.doc(firstDoc.id).update({
			Data: jsn
		});
		resetUserTable();
		getZipCount();
	}*/

	// NEW VERSION, UPDATES ZipCount WITH NEW USERS INSTEAD OF REPLACING ENTIRE COLLECTION
	const getZipCodesNew = async () => {
		const snapshotZ = await db.collection("ZipCount").get();
		const documents = snapshotZ.docs.map(doc => ({
			id: doc.id,
			...doc.data(),
		}));
		console.log(documents[0].Data);

		const snapshot = await db.collection("Users").get();
		//let counter = userCount;
		let counter = documents[0].Data['Total'];
		snapshot.forEach((doc) => {
			counter += 1;
			if (doc.data().ZipCode) {
				let zip = parseInt(doc.data().ZipCode);
				if (documents[0].Data[zip] >= 1) {
					documents[0].Data[zip] += 1;
				} else {
					documents[0].Data[zip] = 1;
				}
			}
			doc.ref.delete(); // REMOVE USER FROM COLLECTION, MORE EFFICIENT WITH READS THIS WAY
		})
		let jsn = {};
		Object.entries(documents[0].Data).forEach(([key, value]) => {
			if (key === "Total") {
				jsn["Total"] = counter;
			} else {
				jsn[key] = value;
			}
		});
		const ZipRef = db.collection("ZipCount");
		const docSnapshot = await ZipRef.limit(1).get();
		const firstDoc = docSnapshot.docs[0];
		await ZipRef.doc(firstDoc.id).update({
			Data: jsn
		});
		resetUserTable();
		getZipCount();
	}

	const getVendorsAdmin = async () => {
		const snapshot = await db.collection("Establishments").orderBy('Name').get();
		const documents = snapshot.docs.map(doc => ({
			id: doc.id,
			...doc.data(),
		}));
		setVendorCount(snapshot.size);
		setVendors(documents);
		setVendorsCP([...documents]);
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

	function downloadCSVFile(csv_data, csv_name) {
 
		// Create CSV file object and feed
		// our csv_data into it
		let CSVFile = new Blob([csv_data], {
			type: "text/csv"
		});

		// Create to temporary link to initiate
		// download process
		var temp_link = document.createElement('a');

		// Download csv file
		temp_link.download = csv_name;
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

		let csvContent = "";

		if (document.getElementById("user_tab").classList.contains('active')) {
			csvContent = "Zip Code, Number of Users\n";
			if (zipCodeCount.Data && typeof zipCodeCount.Data === 'object') {
				Object.keys(zipCodeCount.Data).forEach((key) => {
					csvContent += key + ", " + zipCodeCount.Data[key] + "\n";
				});
			}
			downloadCSVFile(csvContent, "Users.csv");
		} else {
			csvContent = '"Active","Address","Affiliate","App Launch Date","Category","City","State","Zip","Contact Email",' +
			'"Contact Name","Contact Phone","Contract Ends","Customer Phone","Disclaimer","Discount",' + 
			'"Name","Notes","Latitude","Longitude","Online Ordering","POS Name","POS Setup","Promo Code","Reminder Email","Reminder Phone",' + 
			'"Local Perks Fee","Secondary Affiliate","Terms Signed","Type of Thing","Website"\n';

			vendors.map(doc => {
				csvContent += doc.Active ? `"Yes",` : `"No",`;
				csvContent += doc.Address ? `"${doc.Address}",` : `"N/A",`;
				csvContent += affiliates[doc.AffiliateID] ? `"${affiliates[doc.AffiliateID]}",` : `"N/A",`;
				csvContent += doc.AppLaunchDate ? `"${doc.AppLaunchDate.toDate().toDateString()}",` : `"N/A",`;
				csvContent += doc.Category ? `"${doc.Category}",` : `"N/A",`;
				csvContent += doc.City ? `"${doc.City}",` : `"N/A",`;
				csvContent += doc.State ? `"${doc.State}",` : `"N/A",`;
				csvContent += doc.Zip ? `"${doc.Zip}",` : `"N/A",`;
				csvContent += doc.ContactEmail ? `"${doc.ContactEmail}",` : `"N/A",`;
				csvContent += doc.ContactName ? `"${doc.ContactName}",` : `"N/A",`;
				csvContent += doc.ContactPhone ? `"${doc.ContactPhone}",` : `"N/A",`;
				csvContent += doc.ContractEnds ? `"${doc.ContractEnds.toDate().toDateString()}",` : `"N/A",`;
				csvContent += doc.Phone ? `"${doc.Phone}",` : `"N/A",`;
				csvContent += doc.Disclaimer ? `"${doc.Disclaimer}",` : `"N/A",`;
				csvContent += doc.Discount ? `"${doc.Discount}",` : `"N/A",`;
				csvContent += doc.Name ? `"${doc.Name}",` : `"N/A",`;
				csvContent += doc.Notes ? `"${doc.Notes}",` : `"N/A",`;
				csvContent += doc.latLon._lat ? `"${doc.latLon._lat}",` : `"N/A",`;
				csvContent += doc.latLon._long ? `"${doc.latLon._long}",` : `"N/A",`;
				csvContent += doc.OnlineOrdering ? `"Yes",` : `"No",`;
				csvContent += doc.POSName ? `"${doc.POSName}",` : `"N/A",`;
				csvContent += doc.POSSetup ? `"Yes",` : `"No",`;
				csvContent += doc.PromoCode ? `"${doc.PromoCode}",` : `"N/A",`;
				csvContent += doc.ReminderEmail ? `"${doc.ReminderEmail}",` : `"N/A",`;
				csvContent += doc.ReminderPhone ? `"${doc.ReminderPhone}",` : `"N/A",`;
				csvContent += doc.Fee ? `"${doc.Fee}",` : `"N/A",`;
				csvContent += affiliates[doc.SecondaryAffiliate] ? `"${affiliates[doc.SecondaryAffiliate]}",` : `"N/A",`;
				csvContent += doc.TermsSigned ? `"Yes",` : `"No",`;
				csvContent += doc.TypeOfThing ? `"${doc.TypeOfThing}",` : `"N/A",`;
				csvContent += doc.Website ? `"${doc.Website}"` : `"N/A"`;
				csvContent += "\n";
			});

			downloadCSVFile(csvContent, "Vendors.csv");
		}
	}

	function showSidebar() {
		document.getElementById("overlay").style.display = "block";
		document.getElementById("sidebar").style.display = "flex";
		/*document.body.style.position = "fixed";
		document.body.style.width = "100vw";
		document.body.style.height = "100vh";*/
	}

	function hideSidebar() {
		document.getElementById("overlay").style.display = "none";
		document.getElementById("sidebar").style.display = "none";
		/*document.body.style.position = "initial";
		document.body.style.width = "initial";
		document.body.style.height = "initial";*/
	}

	window.onresize = resize;

	function resize() {
		if(window.innerWidth > 760 ) {
			hideSidebar();
		}
	}

	/*// Wrapper to call correct sort method
	function sort(name) {
		if (name === "Name") {
			if (sortColumn === "Name" && sortAsc) {
				sortNameDesc();
				setSortAsc(false);
			} else {
				sortNameAsc();
				setSortAsc(true);
				setSortColumn(name);
			}
		} else if (name === "City") {
			if (sortColumn === "City" && sortAsc) {
				sortCityDesc();
				setSortAsc(false);
			} else {
				sortCityAsc();
				setSortAsc(true);
				setSortColumn(name);
			}
		}
		changeSortIcon(name);
	}*/

	function vendorSearch(val) {
		if (val !== '') {
			const filteredVendors = vendorsCP.filter(vendor => 
				vendor.Name.toLowerCase().includes(val.toLowerCase())
			);
			setVendors(filteredVendors);
			setVendorCount(filteredVendors.length);
		} else {
			setVendors([...vendorsCP]);
			setVendorCount([...vendorsCP].length);
		}
	}

	// Wrapper to call correct sort method
	function sort(name) {
		if (name === sortColumn) {
			if (sortAsc) {
				const sorted = vendors.slice().sort((a,b) => {
					return b[name].localeCompare(a[name]);
				});
				setVendors(sorted);
				changeSortIcon(name, true);
			} else {
				const sorted = vendors.slice().sort((a,b) => {
					return a[name].localeCompare(b[name]);
				});
				setVendors(sorted);
				changeSortIcon(name, false);
			}
		} else {
			resetSortStatus(sortColumn);
			setSortColumn(name);
			const sorted = vendors.slice().sort((a,b) => {
				return a[name].localeCompare(b[name]);
			});
			setVendors(sorted);
			changeSortIcon(name, false);
		}
	}

	function changeSortIcon(name, sortDesc) {
		document.getElementById(name).classList.remove("fa-sort");
		if (sortDesc) {
			document.getElementById(name).classList.remove("fa-sort-up");
			document.getElementById(name).classList.add("fa-sort-down");
			setSortAsc(false);
		} else {
			document.getElementById(name).classList.remove("fa-sort-down");
			document.getElementById(name).classList.add("fa-sort-up");
			setSortAsc(true);
		}
	}

	function resetSortStatus(name) {
		document.getElementById(name).classList.remove("fa-sort-up");
		document.getElementById(name).classList.remove("fa-sort-down");
		document.getElementById(name).classList.add("fa-sort");
	}

	function allFilter() {
		document.getElementById("all").classList.add("active");
		document.getElementById("active").classList.remove("active");
		document.getElementById("inactive").classList.remove("active");
		filterVendors("all");
	}

	function activeFilter() {
		document.getElementById("active").classList.add("active");
		document.getElementById("inactive").classList.remove("active");
		document.getElementById("all").classList.remove("active");
		filterVendors(true);
	}

	function inactiveFilter() {
		document.getElementById("active").classList.remove("active");
		document.getElementById("inactive").classList.add("active");
		document.getElementById("all").classList.remove("active");
		filterVendors(false);
	}

	function filterVendors(isActive) {
		if (isActive === "all") {
			setVendors([...vendorsCP]);
			setVendorCount([...vendorsCP].length);
		} else {
			const filteredVendors = vendorsCP.filter(vendor => 
				vendor.Active == isActive
			);
			setVendors(filteredVendors);
			setVendorCount(filteredVendors.length);
		}
	}

	return (
		<div>
			<div className='topbar space'>
				<NavLink to="/">
					<img src='https://firebasestorage.googleapis.com/v0/b/localperkstest.appspot.com/o/perkspass.png?alt=media&token=899760db-0c70-4284-9425-f45543329990&_gl=1*1gkdcls*_ga*MTkxMzE3MzM5Mi4xNjg5MTE2MzM4*_ga_CW55HF8NVT*MTY5NjI4MDc4Ni44Ni4xLjE2OTYyODA4MDAuNDYuMC4w' to="/" alt="PerksPass Logo"></img>
				</NavLink>
				<div className='row center'>
					<div className='bars' onClick={() => { showSidebar()}}>
						<i className="fas fa-bars mr40"></i>
					</div>
					<div className='row menu'>
						<NavLink to="/add-user" className="hide" id="add-user">
							<p className='link'>Add User</p>
						</NavLink>
						<NavLink to="/add-vendor">
							<p className='link'>Add Vendor</p>
						</NavLink>
						<div className="profile row center" onClick={() => {document.getElementById("profile").style.visibility === "visible" ? 
							document.getElementById("profile").style.visibility = "hidden" :
							document.getElementById("profile").style.visibility = "visible"}}>
							<i className="fa-solid fa-user mr8"></i>
							<p>{userEmail}</p>
						</div>
					</div>
					<div id="profile" className='center' onClick={logout}>
						<p style={{margin: 0}} className='link'>Sign Out</p>
					</div>
				</div>

			</div>
			<div className='col center' id="rel">
				<h1 id="title">Affiliate Dashboard</h1>
				<h2 className='hide' id="UserCount">Users: {userCount}</h2>
				<h2 id="VendorCount">Vendors: {vendorCount}</h2>
				<i id="download" className="fas fa-download" onClick={() => createCSV()}></i>
				<div id="tabs" className='row'>
					<h2 className='active' id="vend_tab" onClick={() => showVendorTable()}>Vendors</h2>
					<h2 className='ml24 inactive' id="user_tab" onClick={() => showUserTable()}>Users</h2>
				</div>
				<div id="search" className='search row'>
					<input type='text' placeholder='Search by Name' onChange={(e) => vendorSearch(e.target.value)}></input>
					<p className='active filtLab' id='all' onClick={() => allFilter()}>All</p>
					<p className='filtLab' id='active' onClick={() => activeFilter()}>Active</p>
					<p className='filtLab' id='inactive' onClick={() => inactiveFilter()}>Inactive</p>
				</div>
			</div>
			<div className='table user hide'>
				<table id="userTable">
					<thead>
						<tr>
							<th>Zip Code</th>
							<th>Number of Users<i id="refresh" className="fas fa-refresh hide" onClick={() => getZipCodesNew()}></i></th>
						</tr>
					</thead>
					<tbody>
					</tbody>
				</table>
			</div>
			<div className='table vendor'>
				<table>
					<thead>
						<tr>
							<th className='sort' onClick={() => { sort("Name") }}>NAME&nbsp;<i id="Name" className="fa-solid fa-sort-up"></i></th>
							<th>STATUS</th>
							<th>POS SETUP?</th>
							<th>TERMS SIGNED?</th>
							<th className='sort' onClick={() => { sort("City") }}>CITY&nbsp;<i id="City" className="fa-solid fa-sort"></i></th>
							<th className='sort' onClick={() => { sort("State") }}>STATE&nbsp;<i id="State" className='fa-solid fa-sort'></i></th>
							<th className="sort" onClick={() => { sort("Category") }}>CATEGORY&nbsp;<i id="Category" className='fa-solid fa-sort'></i></th>
							<th className='sort' onClick={() => { sort("TypeOfThing")} }>TYPE&nbsp;<i id="TypeOfThing" className='fa-solid fa-sort'></i></th>
							<th>DISCOUNT</th>
							<th className=''>AFFILIATE</th>
							<th className=''>SECONDARY AFFILIATE</th>
						</tr>
					</thead>
					<tbody>
						{vendors.map(doc => (
							<tr key={doc.id} onClick={() => navigate("/" + "vendor-profile/" + doc.id)}>
								<td>{doc.Name}</td>
								<td>{doc.Active === true? "Active" : "Inactive"}</td>
								<td>{doc.POSSetup && doc.POSSetup === true? "Yes" : "No"}</td>
								<td>{doc.TermsSigned && doc.TermsSigned === true? "Yes" : "No"}</td>
								<td>{doc.City}</td>
								<td>{doc.State}</td>
								<td>{doc.Category}</td>
								<td>{doc.TypeOfThing}</td>
								<td>{doc.Discount}</td>
								<td>{affiliates[doc.AffiliateID]}</td>
								<td>{!affiliates[doc.SecondaryAffiliate] ? "None" : affiliates[doc.SecondaryAffiliate]}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<img id ="overlay" className='overlay' alt="overlay" src="https://firebasestorage.googleapis.com/v0/b/localperkstest.appspot.com/o/blank.png?alt=media&token=16e2351b-e608-4471-8c5d-a3011930346f"></img>
			<div className="sidebar light" id="sidebar">
				<div className='col ml24'>
					<div className='end' onClick={() => { hideSidebar() }}>
						<i className='fa-solid fa-x end'></i>
					</div>
					<div className='link'>
						<NavLink to="/add-user" className="hide" id="add-user2">
							<p>Add User</p>
						</NavLink>
					</div>
					<div className='link'>
						<NavLink to="/add-vendor">
							<p>Add Vendor</p>
						</NavLink>
					</div>
					<div className="link mt24">
						<div className='row center'>
							<i className="fa-solid fa-user mr8"></i>
							<p>{userEmail}</p>
						</div>
					</div>
					<div className='link' onClick={logout}>
						<p>Sign Out</p>
					</div>
					<div className='center' id="white-logo">
						<img src="https://firebasestorage.googleapis.com/v0/b/localperkstest.appspot.com/o/PerksPassWhite.png?alt=media&token=de1bf556-55f7-4ce1-906f-99f8b7edd2cc" alt="Perks Pass Logo"></img>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;