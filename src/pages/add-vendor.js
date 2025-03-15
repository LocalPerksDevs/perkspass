import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { app, db, auth } from '../firebase-config';
import { getStorage, ref, getDownloadURL, uploadBytes } from "../../node_modules/firebase/storage";
import axios from '../axios';
import firebase from "../../node_modules/firebase/compat/app";
import GoldPassSum from "../components/GoldpassSum.js";
import GoldpassForm from "../components/GoldpassForm.js"


const AddVendor = () => {

	const title = "Perks Pass Vendor Onboarding Form";
	const [sum, setSum] = useState(null);
	const [goldpassSumInstance, setGoldpassSumInstance] = useState(null);

	useEffect(() => {
		if (!auth.currentUser) {
			navigate("/sign-in");
		} else {
			getAffiliates();
			const instance = new GoldPassSum(db);
			setGoldpassSumInstance(instance);
		}
	}, []);

	const navigate = useNavigate();

	const [errors, setErrors] = useState({
		logo: ""
	});

	const [contact, setContact] = useState({
		address: "", category: "", reminderEmail: "", reminderNumber: "",
		city: "", discount: "", logoURL: "", name: "", onlineOrdering: "true",
		phone: "", promoCode: "", state: "", zip: "", appLaunchDate: "",
		typeOfThing: "Food", website: "", contractEnds: "", disclaimer: "",
		contactName: "", contactEmail: "", contactNumber: "",
		fee: "", terms: "true", notes: "", posName: "", secondaryAffiliate: "",
		goldpass: "", deals: []
	});

	const [affiliates, setAffiliates] = useState({});

	let message = "Success! " + contact.name + " was added to the database";
	let logourl = '';

	const [imageUpload, setImageUpload] = useState();

	let LAT = 0;
	let LON = 0;

	let latLong = null;
	let response = null;

	const storage = getStorage(app);

	const handleChange = (event, index = null) => {
		event.preventDefault();
		const { name, value, type } = event.target;

		let newValue = value;

		if (type === "number") {
			newValue = parseFloat(value) || 0;
			newValue = roundToTwoDecimals(newValue);
		}

		setContact((prev) => {
			if (index != undefined) {
				const updatedDeals = prev.deals.map((deal, i) =>
					i === index ? { ...deal, [name]: newValue } : deal
				);
				return { ...prev, deals: updatedDeals };
			}
			return { ...prev, [name]: newValue };
		});
	}

	const goldpassFormProps = {
		con: contact,
		setC: setContact,
		hc: handleChange
	};

	async function updateSum() {

		const currentSum = await goldpassSumInstance.getSum();
		setSum(currentSum);

		let newSum = currentSum;

		if (contact.deal_1_value > 0) {
			newSum += contact.deal_1_value;
			setSum(newSum);
		}

		if (contact.deal_2_value > 0) {
			newSum += contact.deal_2_value;
			setSum(newSum);
		}

		if (contact.deal_3_value > 0) {
			newSum += contact.deal_3_value;
			setSum(newSum);
		}

		if (contact.deal_4_value > 0) {
			newSum += contact.deal_4_value;
			setSum(newSum);
		}

		if (newSum > currentSum) {
			await goldpassSumInstance.updateSum(newSum);
		}
	}

	function roundToTwoDecimals(num) {
		return Math.round(num * 100) / 100;
	}

	const getAffiliates = async () => {
		const snapshot = await db.collection("Affiliates").get();
		const a = {};
		snapshot.forEach(doc => {
			a[doc.id] = doc.data().Name;
		});
		setAffiliates(a);
	}

	async function getLatLonGoogle() {
		if (!contact.address) {
			return;
		}
		response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + encodeURI(contact.address) + '&key=AIzaSyC-N8P43eh7n8_82SzcHXZ6h6rmgk7q448');
		const { status, results } = response.data;
		let p = document.createElement("p");
		if (status === 'OK' && results.length > 0) {
			p.innerText = "Latitude: " + results[0].geometry.location.lat + " Longitude: " + results[0].geometry.location.lng;
		}
		p.setAttribute("class", "lat-lon");
		p.setAttribute("id", "lat");
		document.getElementsByName("address")[0].after(p);
		document.getElementById("lat-btn").classList.add("hide");
		document.getElementById("latError").classList.add('hide');
		document.getElementById("lat-lon-form").classList.remove("error");

		validateAddress();
	}

	const addDoc = (event) => {
		event.preventDefault();
		if (errorHandling()) {
			return;
		}

		if (contact.onlineOrdering === "true") {
			contact.onlineOrdering = true;
		} else {
			contact.onlineOrdering = false;
		}

		let date = new Date(contact.contractEnds);
		date.setDate(date.getDate() + 1);
		date.setHours(0, 0, 0, 0);
		contact.appLaunchDate = date;

		let date2 = new Date(contact.contractEnds);
		date2.setDate(date2.getDate() +1);
		date2.setHours(0, 0, 0, 0);
		date2.setFullYear(date2.getFullYear() + 1);
		contact.contractEnds = date2;

		let pa = document.getElementById("lat");
		LAT = parseFloat(pa.innerText.substring(10, pa.innerText.lastIndexOf('L')));
		LON = parseFloat(pa.innerText.substring(pa.innerText.lastIndexOf(' ')));
		latLong = new firebase.firestore.GeoPoint(Number(LAT), Number(LON));

		// CALCULATE NEW GOLDPASS SUM
		//updateSum();

		db.collection("Establishments").add({
			Goldpass: contact.goldpass,
			Name: contact.name.trim(),
			Phone: contact.phone,
			Address: contact.address.trim(),
			Category: contact.category.trim(),
			TypeOfThing: contact.typeOfThing,
			City: contact.city.trim(),
			State: contact.state.trim(),
			Discount: contact.discount.trim(),
			discountInstructions: "Show This Screen to an Employee",
			discountInstructionsSmall: "They have a PerksPass discount button in the register.",
			Disclaimer: contact.disclaimer.trim(),
			OnlineOrdering: contact.onlineOrdering,
			PromoCode: "PerksPass",
			Website: contact.website.trim(),
			LogoURL: contact.logoURL,
			ContractEnds: contact.contractEnds,
			latLon: latLong,
			Active: false,
			ID: generateRandomString(8),
			AffiliateID: auth.currentUser.uid,
			Zip: contact.zip.trim(),
			AppLaunchDate: contact.appLaunchDate,
			ContactName: contact.contactName.trim(),
			ContactEmail: contact.contactEmail.trim(),
			ContactPhone: contact.contactNumber,
			Fee: contact.fee.trim(),
			TermsSigned: contact.terms === "true" ? true : false,
			Notes: contact.notes.trim(),
			POSSetup: false,
			ReminderEmail: contact.reminderEmail.trim(),
			ReminderPhone: contact.reminderNumber,
			POSName: contact.posName.trim(),
			SecondaryAffiliate: contact.secondaryAffiliate
		}).then((docRef) => {
			document.getElementsByClassName("message")[0].classList.remove('hide');
			document.getElementsByClassName("form")[0].classList.add('hide');
			document.getElementsByClassName("local-perks")[0].classList.add('hide');
			document.getElementById('logo-form').classList.add('hide');
			document.getElementById('lat-lon-form').classList.add('hide');
			document.getElementById('companyInfo').classList.add('hide');
			for (const deal of contact.deals) {
				db.collection("EstablishmentDeals").add({
					Name: deal.deal_name,
					Description: deal.deal_desc,
					Amount: deal.deal_value,
					Establishment_Ref: db.doc(`Establishments/${docRef.id}`),
					Enabled: false,
					Created_At: firebase.firestore.FieldValue.serverTimestamp(),
					Updated_At: firebase.firestore.FieldValue.serverTimestamp()
				})
			}
		}).catch((err) => {
			message = "Error " + err.message;
		});

		setContact((prev) => ({ ...prev, deals: [] }));
	}

	function ResetForm() {
		ClearInputs();
		message = "Success! " + contact.name + " was added to the database";
		document.getElementsByClassName("message")[0].classList.add('hide');
		document.getElementById("logo-form").classList.remove('hide');
		document.getElementById("lat-lon-form").classList.remove('hide');
		document.getElementById("logo-img").remove();
		document.getElementsByClassName("form")[0].classList.remove('hide');
		document.getElementById("logo").classList.remove('hide');
		document.getElementById("lat").remove();
		document.getElementById("logo").disabled = false;
		document.getElementById("upload").classList.add('hide');
		document.getElementById("success").classList.add('hide');
		document.getElementById("lat-btn").classList.remove("hide");
		document.getElementsByClassName("local-perks")[0].classList.remove('hide');
		document.getElementById('companyInfo').classList.remove('hide');
	}


	function ClearInputs() {
		contact.name = '';
		document.getElementsByName("name")[0].value = "";
		contact.phone = '';
		document.getElementsByName("phone")[0].value = "";
		contact.address = '';
		document.getElementsByName("address")[0].value = "";
		contact.category = '';
		document.getElementsByName("category")[0].value = "";
		contact.typeOfThing = 'Food';
		document.getElementsByName("typeOfThing")[0].value = "Food";
		contact.goldpass = 'PerksPass';
		document.getElementsByName("goldpass")[0].value = "PerksPass";
		contact.city = '';
		document.getElementsByName("city")[0].value = "";
		contact.state = '';
		document.getElementsByName("state")[0].value = "";
		contact.discount = '';
		document.getElementsByName("discount")[0].value = "";
		contact.onlineOrdering = 'true';
		document.getElementsByName("onlineOrdering")[0].value = "true";
		contact.promoCode = '';
		document.getElementsByName("promoCode")[0].value = "";
		contact.website = '';
		document.getElementsByName("website")[0].value = "";
		contact.contractEnds = '';
		document.getElementsByName("contractEnds")[0].value = "";
		contact.disclaimer = '';
		document.getElementsByName("disclaimer")[0].value = "";
		LAT = 0;
		LON = 0;
		contact.zip = '';
		document.getElementsByName("zip")[0].value = "";
		contact.appLaunchDate = '';
		contact.contactName = '';
		document.getElementsByName("contactName")[0].value = "";
		contact.contactEmail = '';
		document.getElementsByName("contactEmail")[0].value = "";
		contact.contactPhone = '';
		document.getElementsByName("contactNumber")[0].value = "";
		contact.posName = '';
		document.getElementsByName("posName")[0].value = "";
		contact.fee = '';
		document.getElementsByName("fee")[0].value = "";
		contact.terms = '';
		document.getElementsByName("terms")[0].value = "";
		contact.notes = '';
		document.getElementsByName("notes")[0].value = "";
		contact.secondaryAffiliate = '';
		document.getElementsByName("secondaryAffiliate")[0].value = "None";
	}

	const uploadFile = () => {
		if (!imageUpload) return;

		const imageRef = ref(storage, `${imageUpload.name}`);

		uploadBytes(imageRef, imageUpload).then((snapshot) => {
			getDownloadURL(snapshot.ref).then((url) => {
				logourl = url;
				contact.logoURL = url;
				showLogo();
			});
		});

		document.getElementById("logoError").classList.add('hide');
		document.getElementById("logo-form").classList.remove("error");
	}

	function phoneMask(phoneName) {
		let element = document.getElementsByName(phoneName)[0];
		if (!element) {
			return;
		}
		let num = element.value.replace(/\D/g, '');
		
		let val = '(' + num.substring(0, 3);
		if (num.length > 3) {
			val += ') ' + num.substring(3, 6);
		}
		if (num.length > 6) {
			val += '-' + num.substring(6, 10);
		}
		element.value = val;
		if (phoneName === 'phone') {
			contact.phone = val;
		} else if (phoneName === 'contactNumber') {
			contact.contactNumber = val;
		} else if (phoneName === 'reminderNumber') {
			contact.reminderNumber = val;
		}
		
	}

	function CheckInput(inputName) {
		if (document.getElementsByName(inputName)[0].value) {
			document.getElementById(inputName + "Error").classList.add('hide');
			document.getElementsByName(inputName)[0].classList.remove("error");
		}
	}

	function showLogo() {
		let file = document.getElementsByName('logo')[0];
		let img = new Image();
		img.setAttribute("id", "logo-img");
		img.src = logourl;
		file.after(img);
		document.getElementById("logo").value = null;
		document.getElementById("logo").classList.add('hide');
		document.getElementById("logo").disabled = true;
		document.getElementById("upload").classList.add('hide');
		document.getElementById("success").classList.remove('hide');
	}

	function generateRandomString(length) {
		const characters = '0123456789abcdefghijklmnopqrstuvwxyz';
		let result = '';

		for (let i = 0; i < length; i++) {
			const randomIndex = Math.floor(Math.random() * characters.length);
			result += characters[randomIndex];
		}

		return result;
	}

	function errorHandling() {
		let errorFound = false;
		let tempErrors = {};
		let scrollToID = '';
		let val = '';

		// LOGO
		if(!document.getElementById('logo-img')) {
			tempErrors.logo = "Please upload the company logo";
			document.getElementById("logoError").classList.remove('hide');
			document.getElementById("logo-form").classList.add("error");
			scrollToID = 'logo-form';
			errorFound = true;
		} else {
			tempErrors.logo = '';
			document.getElementById("logoError").classList.add('hide');
			document.getElementById("logo-form").classList.remove("error");
		}

		// LATITUDE AND LONGITUDE
		if(!document.getElementById('lat')) {
			tempErrors.lat = "Please calculate the latitude and longitude";
			document.getElementById("latError").classList.remove('hide');
			document.getElementById("lat-lon-form").classList.add("error");
			if (!scrollToID) {
				scrollToID = 'lat-lon-form';
			}
			errorFound = true;
		} else {
			tempErrors.lat = '';
			document.getElementById("latError").classList.add('hide');
			document.getElementById("lat-lon-form").classList.remove("error");
		}

		// ADDRESS
		/*if(document.getElementsByName("address")[0].value === '') {
			tempErrors.lat = "Please enter the vendor's address";
			document.getElementById("latError").classList.remove('hide');
			document.getElementsByName("address")[0].classList.add("error");
			if (!scrollToID) {
				scrollToID = 'lat-lon-form';
			}
			errorFound = true;
		} else {
			tempErrors.lat = '';
			document.getElementById("latError").classList.add('hide');
			document.getElementsByName("address")[0].classList.remove("error");
		}*/

		// VENDOR NAME
		if(document.getElementsByName("name")[0].value === "") {
			tempErrors.name = "Please enter the Vendor's name";
			document.getElementById("nameError").classList.remove('hide');
			document.getElementsByName("name")[0].classList.add("error");
			if (!scrollToID) {
				scrollToID = 'name';
			}
			errorFound = true;
		} else {
			tempErrors.name = '';
			document.getElementById("nameError").classList.add('hide');
			document.getElementsByName("name")[0].classList.remove("error");
		}

		// CUSTOMER PHONE
		val = document.getElementsByName("phone")[0].value;
		if(val === "" || val.length < 14) {
			tempErrors.phone = "Please enter the customer phone number";
			if (val.length < 14 && val.length > 0) {
				tempErrors.phone = "Please enter the full phone number"
			}
			document.getElementById("phoneError").classList.remove('hide');
			document.getElementsByName("phone")[0].classList.add("error");
			if (!scrollToID) {
				scrollToID = 'phone';
			}
			errorFound = true;
		} else {
			tempErrors.phone = '';
			document.getElementById("phoneError").classList.add('hide');
			document.getElementsByName("phone")[0].classList.remove("error");
		}

		// CATEGORY
		val = document.getElementsByName("category")[0].value;
		if(val === "") {
			tempErrors.category = "Please enter the Vendor's Category";
			document.getElementById("categoryError").classList.remove('hide');
			document.getElementsByName("category")[0].classList.add("error");
			if (!scrollToID) {
				scrollToID = 'category';
			}
			errorFound = true;
		} else {
			tempErrors.category = '';
			document.getElementById("phoneError").classList.add('hide');
			document.getElementsByName("phone")[0].classList.remove("error");
		}

		// CITY
		val = document.getElementsByName("city")[0].value;
		if(val === "") {
			tempErrors.city = "Please enter the city the Vendor is located in";
			document.getElementById("cityError").classList.remove('hide');
			document.getElementsByName("city")[0].classList.add("error");
			if (!scrollToID) {
				scrollToID = 'city';
			}
			errorFound = true;
		} else {
			tempErrors.city = '';
			document.getElementById("cityError").classList.add('hide');
			document.getElementsByName("city")[0].classList.remove("error");
		}

		// STATE
		val = document.getElementsByName("state")[0].value;
		if(val === "") {
			tempErrors.state = "Please enter the state the Vendor is located in";
			document.getElementById("stateError").classList.remove('hide');
			document.getElementsByName("state")[0].classList.add("error");
			if (!scrollToID) {
				scrollToID = 'state';
			}
			errorFound = true;
		} else {
			tempErrors.state = '';
			document.getElementById("stateError").classList.add('hide');
			document.getElementsByName("state")[0].classList.remove("error");
		}

		// ZIP CODE
		val = document.getElementsByName("zip")[0].value;
		if(val === "") {
			tempErrors.zip = "Please enter the zip code the Vendor is located in";
			document.getElementById("zipError").classList.remove('hide');
			document.getElementsByName("zip")[0].classList.add("error");
			if (!scrollToID) {
				scrollToID = 'zip';
			}
			errorFound = true;
		} else {
			tempErrors.zip = '';
			document.getElementById("zipError").classList.add('hide');
			document.getElementsByName("zip")[0].classList.remove("error");
		}

		// UPDATE ERRORS
		setErrors(() => {
			return { logo: tempErrors.logo,
			lat: tempErrors.lat,
			name: tempErrors.name,
			phone: tempErrors.phone,
			category: tempErrors.category,
			city: tempErrors.city,
			state: tempErrors.state,
			zip: tempErrors.zip };
		});

		// SCROLL TO ERROR
		if (scrollToID) {
			if (document.getElementById) {
				document.getElementById(scrollToID).scrollIntoView({
					behavior: 'smooth'
				})
			} else if (document.getElementsByName(scrollToID)[0]) {
				document.getElementsByName(scrollToID)[0].scrollIntoView({
					behavior: 'smooth'
				})
			}
		}
		return errorFound;
	}

	function validateAddress() {
		// LATITUDE AND LONGITUDE
		let error = '';
		if(!document.getElementById('lat')) {
			error = "Please calculate the latitude and longitude";
			document.getElementById("latError").classList.remove('hide');
			document.getElementById("lat-lon-form").classList.add("error");
		} else {
			document.getElementById("latError").classList.add('hide');
			document.getElementById("lat-lon-form").classList.remove("error");
		}

		// ADDRESS
		if(document.getElementsByName("address")[0].value === '') {
			error = "Please enter the vendor's address";
			document.getElementById("latError").classList.remove('hide');
			document.getElementsByName("address")[0].classList.add("error");
		} else {
			document.getElementById("latError").classList.add('hide');
			document.getElementsByName("address")[0].classList.remove("error");
		}

		setErrors((prev) => {
			return { ...prev, lat: error };
		});
	}

	return (

		<div>
			<div className='topbar space'>
				<NavLink to="/">
					<img src='https://firebasestorage.googleapis.com/v0/b/localperkstest.appspot.com/o/perkspass.png?alt=media&token=899760db-0c70-4284-9425-f45543329990&_gl=1*1gkdcls*_ga*MTkxMzE3MzM5Mi4xNjg5MTE2MzM4*_ga_CW55HF8NVT*MTY5NjI4MDc4Ni44Ni4xLjE2OTYyODA4MDAuNDYuMC4w' to="/" alt="PerksPass Logo"></img>
				</NavLink>
				<div className='row'>
					<NavLink to="/dashboard">
						<p className='link'>Dashboard</p>
					</NavLink>
				</div>

			</div>
			<div className="App">
				<header className="App-header-form">
					<h1 className='title'>
						{title}
					</h1>
				</header>
				<div className="message hide">
					<p>{message}</p>
					<button className="mt24" onClick={ResetForm}>Submit Another Vendor</button>
				</div>
				<div className="local-perks">
					<p>Fill out this form with the vendor to initiate the onboarding process</p>
					<p>Before you fill out this form <b>MAKE SURE TO DO THIS:</b></p>
					<ol>
						<li>Fill out <a href="https://vendoragreement.paperform.co/" target="_blank">this short form.</a></li>
						<li>Have vendor share <a href="https://perkspassvendoremployeetraining.paperform.co" target="_blank">this training form</a> with all employees that take payments (only if there is a discount button in register).</li>
					</ol>
					<p>Once this form is submitted it will:</p>
					<ol>
						<li>Send the e-signature vendor agreement to your email for you to sign first and then to theirs, with the custom fields from the form.</li>
						<li>Send an email to the vendor requesting the creation of a promotional code in their Point of Sale (POS) system, include our <a href="https://qx78hjqq.paperform.co/" target="_blank">POS form</a> for completion and provide them with clear instructions on when and where to send the monthly report.</li>
					</ol>
				</div>
				<GoldpassForm 
					{...goldpassFormProps}
				/>
				<div className='logoForm' id="logo-form">
					<div className='col center'>
						<label htmlFor="logo" className='mt24 label'>Upload the company logo</label>
						<p className="sub-label">Must be formatted as JPG, JPEG, PNG or SVG</p>
						<p id="logoError" className="errorMessage hide">{errors.logo}</p>
						<input type="file" id="logo" name="logo" onChange={(event) => {
							setImageUpload(event.target.files[0]);
							document.getElementById("upload").classList.remove("hide");
						}} />
						<button onClick={uploadFile} className='mt24 hide' id='upload'>Upload Logo</button>
						<p id="success" className='success hide'>Success! Logo was uploaded to the database</p>
					</div>
				</div>
				<div className="lat-lon-form" id="lat-lon-form">
					<div className='col center'>
						<p className="label">Address</p>
						<p className="sub-label">What is the Physical Location of Vendor's Business? If this is a home based business just delete the address after clicking "Get Latitude & Longitude"</p>
						<p id="latError" className="errorMessage hide">{errors.lat}</p>
						<input type="text" className="mb0" placeholder="address" name="address" value={contact.address} onChange={handleChange}></input>
						<div className="button" id="lat-btn" onClick={getLatLonGoogle}>Get Latitude & Longitude</div>
					</div>
				</div>
				<div className="form" id="companyInfo">
					<form onSubmit={addDoc}>
						<div className="col center">
							<p className="label">Vendor Name</p>
							<p className="sub-label">This will be the name displayed in the app</p>
							<p id="nameError" className="errorMessage hide">{errors.name}</p>
							<input type="text" placeholder="vendor name" name="name" value={contact.name} onChange={handleChange} className="" onKeyUp={() => CheckInput("name")}></input>
							<p className="label">Customer Phone Number</p>
							<p className="sub-label">Phone number for customer call-ins</p>
							<p id="phoneError" className="errorMessage hide">{errors.phone}</p>
							<input type="tel" placeholder="customer phone number" name="phone" value={contact.phone} onChange={handleChange} onKeyUp={() => {phoneMask("phone"); CheckInput("phone");}}></input>
							<p className="label">Vendor Category</p>
							<p className="sub-label">e.g. Mexican Restaurant, Car Wash, Oil Change etc...</p>
							<p id="categoryError" className="errorMessage hide">{errors.category}</p>
							<input type="text" placeholder="vendor category" name="category" value={contact.category} onChange={handleChange} onKeyUp={() => CheckInput("category")}></input>
							<label htmlFor="typeOfThing" className="label">Business Type</label>
							<select name="typeOfThing" id="typeOfThing" value={contact.typeOfThing} onChange={handleChange}>
								<option value="Food" id="Food">Food</option>
								<option value="Service" id="Service">Service</option>
								<option value="Entertainment" id="Entertainment">Entertainment</option>
							</select>
							<p className="label">City</p>
							<p className="sub-label">City, State and Zip Code are needed for searches in the app</p>
							<p id="cityError" className="errorMessage hide">{errors.city}</p>
							<input type="text" placeholder="city" name="city" value={contact.city} onChange={handleChange} onKeyUp={() => CheckInput("city")}></input>
							<p className="label">State</p>
							<p id="stateError" className="errorMessage hide">{errors.state}</p>
							<p className="sub-label">Spell it out. E.G. Utah, Colorado, Missouri, etc.</p>
							<input type="text" placeholder="state" name="state" value={contact.state} onChange={handleChange} onKeyUp={() => CheckInput("state")}></input>
							<p className="label">Zip Code</p>
							<p id="zipError" className="errorMessage hide">{errors.zip}</p>
							<input type="text" placeholder="zip code" name="zip" value={contact.zip} onChange={handleChange} onKeyUp={() => CheckInput("zip")}></input>
							<p className="label">Discount Amount</p>
							<p className="sub-label">e.g. 10%, 15%, 20%, 25%, 30%, 35%, 40%, 45% or 50%</p>
							<input type="text" placeholder="discount amount" name="discount" value={contact.discount} onChange={handleChange}></input>
							<p className="label">Local Perks Fee</p>
							<p className="sub-label">e.g. 5%-8%</p>
							<input type="text" placeholder="local perks fee" name="fee" value={contact.fee} onChange={handleChange}></input>
							<label htmlFor="onlineOrdering" className="label mt24">Online Ordering Offered?</label>
							<select name="onlineOrdering" id="onlineOrdering" value={contact.onlineOrdering} onChange={handleChange}>
								<option value="true">Yes</option>
								<option value="false">No</option>
							</select>
							<p className="label">Online Ordering Form URL</p>
							<p className="sub-label">Paste the URL to the vendor's online order form here (before adding this make sure they can actually plug in the promo code into the checkout form). The online ordering must be through the POS (no doordash, grubhub etc...)</p>
							<input type="text" placeholder="online ordering form URL" name="website" value={contact.website} onChange={handleChange}></input>
							<p className="label">Promo Code</p>
							<p className="sub-label">Promo code must be "PerksPass"</p>
							<input type="text" placeholder="promo code" name="promoCode" value="PerksPass" disabled></input>
							<p className="label">App Disclaimer</p>
							<p className="sub-label">Any disclaimers that should accompany this discount? e.g. "*Discount valid on all food and drink purchases at Provo location only. Can't be combined with any other offers."</p>
							<input type="text" placeholder="app disclaimer" name="disclaimer" value={contact.disclaimer} onChange={handleChange}></input>
							<label htmlFor="contractEnds" className="label">App Launch Date:</label>
							<input type="date" id="contractEnds" name="contractEnds" onChange={handleChange}></input>
							<p className="label">Primary Contact</p>
							<p className="sub-label">Enter main contact's full name at vendor</p>
							<input type="text" placeholder="primary contact's name" name="contactName" value={contact.contactName} onChange={handleChange}></input>
							<p className="label">Contact Email</p>
							<p className="sub-label">Contact's email address</p>
							<input type="text" placeholder="primary contact's email" name="contactEmail" value={contact.contactEmail} onChange={handleChange}></input>
							<p className="label">Contact Phone Number</p>
							<p className="sub-label">Enter main contact's phone number</p>
							<input type="text" placeholder="primary contact's phone number" name="contactNumber" value={contact.contactNumber} onChange={handleChange} onKeyUp={() => phoneMask("contactNumber")}></input>
							<label htmlFor="terms" className="label mt24">Terms Signed?</label>
							<p className="sub-label">Has the vendor signed the Local Perks terms yet? (Have them look over the agreement and sign while you are filling out this form)</p>
							<select name="terms" id="terms" value={contact.terms} onChange={handleChange}>
								<option value="true">Yes</option>
								<option value="false">No</option>
							</select>
							<p className="label">Reminder Email</p>
							<p className="sub-label">Email address for monthly report reminders</p>
							<input type="text" placeholder="reminder email" name="reminderEmail" value={contact.reminderEmail} onChange={handleChange}></input>
							<p className="label">Reminder Phone Number</p>
							<p className="sub-label">Phone number for monthly report reminders</p>
							<input type="text" placeholder="reminder phone number" name="reminderNumber" value={contact.reminderNumber} onChange={handleChange} onKeyUp={() => phoneMask("reminderNumber")}></input>
							<p className="label">Name of POS</p>
							<p className="sub-label">E.g. Square, Toast, Clover...</p>
							<input type="text" placeholder="name of pos" name="posName" value={contact.posName} onChange={handleChange}></input>
							<label htmlFor="secondaryAffiliate" className="label">Secondary Affiliate</label>
							<select name="secondaryAffiliate" id="secondaryAffiliate" value={contact.secondaryAffiliate} onChange={handleChange}>
								<option value="none" id="none">None</option>
								{Object.keys(affiliates).map((key) => (
									<option value={key} id={key}>{affiliates[key]}</option>
								))}
							</select>
							<p className="label">Notes/Homework</p>
							<p className="sub-label">Any additional custom notes that should be included in the agreement on this one? Anything else our team should know about the account to get it launched?</p>
							<input type="text" placeholder="notes" name="notes" value={contact.notes} onChange={handleChange}></input>
							<button className="mt24">Submit Vendor</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

/*
{affiliates.map((option, index) => (
									<option value={index} id={index}>{option}</option>
								))}
*/
export default AddVendor;