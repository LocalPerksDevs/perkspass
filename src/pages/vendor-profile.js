import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { app, db, auth } from '../firebase-config';
import firebase from "../../node_modules/firebase/compat/app";
import { getStorage, ref, getDownloadURL, uploadBytes } from "../../node_modules/firebase/storage";

const VendorProfile = () => {

    const [vendorID, setVendorID] = useState(window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1));

    const [imageUpload, setImageUpload] = useState();

    const [affiliates, setAffiliates] = useState({});

    const navigate = useNavigate();
    const storage = getStorage(app);
    const [logoURL, setLogoURL] = useState("");

    const isUserAdmin = async () => {
		const snapshot = await db.collection("Admins").get();
		if (!snapshot.docs[0].data().IDs.includes(auth.currentUser.uid)) {
			document.getElementById("active").classList.add('disabled');
		}
        getAffiliates();
    }

    function editClick() {
        let inputs = document.querySelectorAll('.vendor-input');
        for (const i of inputs) {
            i.classList.add('update');
        }

        let selects = document.querySelectorAll('.vs');
        for (const s of selects) {
            s.classList.remove("hide");
        }

        let labels = document.querySelectorAll('.vendor-select');
        for (const l of labels) {
            l.classList.add("hide");
        }

        document.getElementById("name").classList.add('update');
        document.getElementById("edit").classList.add('hide');
        document.getElementById("save").classList.remove('hide');
        document.getElementById("cancel").classList.remove('hide');
        document.getElementById("logo").classList.remove('hide');
    }

    const getAffiliates = async () => {
		const snapshot = await db.collection("Affiliates").get();
		const a = {};
		snapshot.forEach(doc => {
			a[doc.id] = doc.data().Name;
		});
		setAffiliates(a);
	}

    function hideBorders() {
        let inputs = document.querySelectorAll('.vendor-input');
        for (const i of inputs) {
            i.classList.remove('update');
        }

        let selects = document.querySelectorAll('.vs');
        for (const s of selects) {
            s.classList.add("hide");
        }

        let labels = document.querySelectorAll('.vendor-select');
        for (const l of labels) {
            l.classList.remove("hide");
        }

        document.getElementById("name").classList.remove('update');
        document.getElementById("edit").classList.remove('hide');
        document.getElementById("save").classList.add('hide');
        document.getElementById("cancel").classList.add('hide');
        document.getElementById("logo").classList.add('hide');
    }

    const saveClick = async () => {
        hideBorders();
        const establishmentRef = db.collection('Establishments').doc(vendorID);
        let date = new Date(contact.appLaunchDate);
		date.setDate(date.getDate() + 1);
		date.setHours(0, 0, 0, 0);
		contact.appLaunchDate = date;

        let date2 = new Date(contact.contractEnds);
		date2.setDate(date2.getDate() + 1);
		date2.setHours(0, 0, 0, 0);
		contact.contractEnds = date2;

        try {
            await establishmentRef.update({
                Active: contact.active === "Yes" ? true : false,
                Address: !contact.address ? "" : contact.address.trim(),
                AppLaunchDate: !contact.appLaunchDate ? null : contact.appLaunchDate,
                Category: !contact.category ? "" : contact.category.trim(),
                City: !contact.city ? "" : contact.city.trim(),
                ContactEmail: !contact.contactEmail ? "" : contact.contactEmail.trim(),
                ContactName: !contact.contactName ? "" : contact.contactName.trim(),
                ContactPhone: !contact.contactPhone ? "" : contact.contactPhone.trim(),
                ContractEnds: !contact.contractEnds ? null : contact.contractEnds,
                Disclaimer: !contact.disclaimer ? "" : contact.disclaimer.trim(),
                Discount: !contact.discount ? "" : contact.discount.trim(),
                discountInstructions: !contact.discountInstructions ? "Show Discount Code to Employee" : contact.discountInstructions,
                discountInstructionsSmall: !contact.discountInstructionsSmall ? "They have a PerksPass discount button in the register." : contact.discountInstructionsSmall,
                Fee: !contact.fee ? "" : contact.fee.trim(),
                latLon: new firebase.firestore.GeoPoint(Number(contact.latitude), Number(contact.longitude)),
                LogoURL: contact.logoURL,
                Name: !contact.name ? "" : contact.name.trim(),
                Notes: !contact.notes ? "" : contact.notes.trim(),
                OnlineOrdering: contact.onlineOrdering === "Yes" ? true : false,
                POSSetup: contact.posSetup === "Yes" ? true : false,
                POSName: contact.posName.trim(),
                Phone: !contact.phone ? "" : contact.phone.trim(),
                PromoCode: !contact.promoCode ? "" : contact.promoCode.trim(),
                ReminderEmail: !contact.reminderEmail ? "" : contact.reminderEmail,
                ReminderPhone: !contact.reminderPhone ? "" : contact.reminderPhone,
                State: !contact.state ? "" : contact.state.trim(),
                TermsSigned: contact.termsSigned === "Yes" ? true : false,
                TypeOfThing: !contact.typeOfThing ? "" : contact.typeOfThing.trim(),
                Website: contact.website.trim(),
                Zip: !contact.zip ? "" : contact.zip.trim(),
                SecondaryAffiliate: contact.secondaryAffiliate === "None" ? "" : contact.secondaryAffiliate
                });
                //console.log("Document successfully updated!");
            } catch (error) {
                console.error('Error updating document: ', error);
            }
      };

    useEffect(() => {
        if (!auth.currentUser) {
            navigate("/sign-in");
        } else {
            isUserAdmin();
            if (vendorID === "vendor-profile") {
                setVendorID('');
            }

            if (vendorID) {
                getVendorData();
            }
        }
    }, []);

    function yyyymmdd(date) {
        var y = date.getFullYear().toString();
        var m = (date.getMonth() + 1).toString();
        var d = date.getDate().toString();
        (d.length == 1) && (d = '0' + d);
        (m.length == 1) && (m = '0' + m);
        var yyyymmdd = y + "-" + m +  "-" + d;
        return yyyymmdd;
    }

    const getVendorData = async () => {
        const snapshot = await db.collection("Establishments").doc(vendorID).get();
        if (snapshot.exists) {
            setLogoURL(snapshot.data().LogoURL);
            setContact((prev) => {
                return {
                    ...prev,
                    active: snapshot.data().Active === true ? "Yes" : "No",
                    address: snapshot.data().Address,
                    affiliateID: snapshot.data().AffiliateID,
                    appLaunchDate: !snapshot.data().AppLaunchDate ? null : yyyymmdd(snapshot.data().AppLaunchDate.toDate()),
                    category: snapshot.data().Category,
                    city: snapshot.data().City,
                    contactEmail: !snapshot.data().ContactEmail ? "N/A" : snapshot.data().ContactEmail,
                    contactName: !snapshot.data().ContactName ? "N/A" : snapshot.data().ContactName,
                    contactPhone: !snapshot.data().ContactPhone ? "N/A" : snapshot.data().ContactPhone,
                    contractEnds: !snapshot.data().ContractEnds ? null : yyyymmdd(snapshot.data().ContractEnds.toDate()),
                    disclaimer: !snapshot.data().Disclaimer ? "None" : snapshot.data().Disclaimer,
                    discount: snapshot.data().Discount,
                    discountInstructions: !snapshot.data().discountInstructions ? "N/A" : snapshot.data().discountInstructions,
                    discountInstructionsSmall: !snapshot.data().discountInstructionsSmall ? "N/A" : snapshot.data().discountInstructionsSmall,
                    fee: !snapshot.data().Fee ? "N/A" : snapshot.data().Fee,
                    latitude: snapshot.data().latLon._lat,
                    longitude: snapshot.data().latLon._long,
                    logoURL: snapshot.data().LogoURL,
                    name: snapshot.data().Name,
                    notes: !snapshot.data().Notes ? "None" : snapshot.data().Notes,
                    onlineOrdering: snapshot.data().OnlineOrdering === true ? "Yes" : "No",
                    posSetup: snapshot.data().POSSetup === true ? "Yes" : "No",
                    posName: !snapshot.data().POSName ? "N/A" : snapshot.data().POSName,
                    phone: snapshot.data().Phone,
                    promoCode: snapshot.data().PromoCode,
                    reminderEmail: !snapshot.data().ReminderEmail ? "N/A" : snapshot.data().ReminderEmail,
                    reminderPhone: !snapshot.data().ReminderPhone ? "N/A" : snapshot.data().ReminderPhone,
                    secondaryAffiliate: !snapshot.data().SecondaryAffiliate ? "None" : snapshot.data().SecondaryAffiliate,
                    state: snapshot.data().State,
                    termsSigned: snapshot.data().TermsSigned === true ? "Yes" : "No",
                    typeOfThing: snapshot.data().TypeOfThing,
                    website: !snapshot.data().Website ? "" : snapshot.data().Website,
                    zip: !snapshot.data().Zip ? "N/A" : snapshot.data().Zip
                };
            });
        }
    }

    const [contact, setContact] = useState({
        active: "false", address: "", affiliateID: "",
        appLaunchDate: null, category: "", city: "", contactEmail: "",
        contactName: "", contactPhone: "", contractEnds: "",
        disclaimer: "", discount: "", discountInstructions: "", discountInstructionsSmall: "",
        fee: "", logoURL: "", name: "", notes: "", onlineOrdering: "true", posCall: "",
        posName: "", posSetup: "", phone: "", promoCode: "", reminderEmail: "",
        reminderPhone: "", state: "",
        termsSigned: "", typeOfThing: "", website: "", zip: "", secondaryAffiliate: ""
    });

    const handleChange = (event) => {
		event.preventDefault();
		const { name, value } = event.target;
		setContact((prev) => {
			return { ...prev, [name]: value };
		});
	}

    const uploadFile = async () => {
		if (!imageUpload) return;

		const imageRef = ref(storage, `${imageUpload.name}`);

		await uploadBytes(imageRef, imageUpload).then((snapshot) => {
			getDownloadURL(snapshot.ref).then((url) => {
				setLogoURL(url);
				contact.logoURL = url;
			});
		});

        document.getElementById("upload").classList.add('hide');
        const establishmentRef = db.collection('Establishments').doc(vendorID);

        try {
            await establishmentRef.update({
                LogoURL: logoURL
                });
            } catch (error) {
                console.error('Error updating document: ', error);
            }
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
            <div className="center col">
                <div className="vendor-profile">
                    <div className="col center mt24 mb24">
                        <img src={logoURL} id="logo-img"></img>
                        <input type="file" id="logo" className="hide" name="logo" onChange={(event) => { 
                            setImageUpload(event.target.files[0]);
                            document.getElementById("upload").classList.remove("hide");
                            }} />
                        <button onClick={uploadFile} className='mt24 hide' id='upload'>Upload Logo</button>
                        <p id="edit" onClick={() => editClick()}>EDIT</p>
                        <p className="hide" id="save" onClick={() => saveClick()}>SAVE</p>
                        <p className="hide" id="cancel" onClick={() => hideBorders()}>CANCEL</p>
                        <input name="name" id="name" className="vendor-name" defaultValue={contact.name} onChange={handleChange}></input>
                    </div>
                    <div className="col" id="info">
                        <div className="col">
                            <div className="row m24">
                                <div className="col">
                                    <p className="label">ACTIVE</p>
                                    <p className="vendor-select">{contact.active}</p>
                                    <select name="active" id="active" className="vendor-input vs hide" value={contact.active} onChange={handleChange}>
								        <option value="Yes">Yes</option>
								        <option value="No">No</option>
							        </select>
                                </div>
                                <div className="col">
                                    <p className="label">APP LAUNCH DATE</p>
                                    <input name="appLaunchDate" type="date" className="vendor-input" defaultValue={contact.appLaunchDate} onChange={handleChange}></input>
                                </div>
                            </div>
                        </div>
                        <div className="row m24">
                            <div className="col">
                                <p className="label">CATEGORY</p>
                                <input name="category" className="vendor-input" defaultValue={contact.category} onChange={handleChange}></input>
                            </div>
                            <div className="col">
                                <p className="label">ADDRESS</p>
                                <input name="address" className="vendor-input" defaultValue={contact.address} onChange={handleChange}></input>
                            </div>
                        </div>
                        <div className="col">
                            <div className="row m24">
                                <div className="col">
                                    <p className="label">CUSTOMER PHONE</p>
                                    <input name="phone" className="vendor-input" defaultValue={contact.phone} onChange={handleChange}></input>
                                </div>
                                <div className="col">
                                    <p className="label">TYPE</p>
                                    <p className="vendor-select">{contact.typeOfThing}</p>
                                    <select name="typeOfThing" id="typeOfThing" className="vendor-input vs hide" value={contact.typeOfThing} onChange={handleChange}>
								        <option value="Food">Food</option>
								        <option value="Service">Service</option>
                                        <option value="Entertainment">Entertainment</option>
							        </select>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="row m24">
                                <div className="col">
                                    <p className="label">CITY</p>
                                    <input name="city" className="vendor-input" defaultValue={contact.city} onChange={handleChange}></input>
                                </div>
                                <div className="col">
                                    <p className="label">STATE</p>
                                    <input name="state" className="vendor-input" defaultValue={contact.state} onChange={handleChange}></input>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="row m24">
                                <div className="col">
                                    <p className="label">ZIP</p>
                                    <input name="zip" className="vendor-input" defaultValue={contact.zip} onChange={handleChange}></input>
                                </div>
                                <div className="col">
                                    <p className="label">DISCOUNT</p>
                                    <input name="discount" className="vendor-input" defaultValue={contact.discount} onChange={handleChange}></input>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="row m24">
                                <div className="col">
                                    <p className="label">CONTACT NAME</p>
                                    <input name="contactName" className="vendor-input" defaultValue={contact.contactName} onChange={handleChange}></input>
                                </div>
                                <div className="col">
                                    <p className="label">CONTACT PHONE</p>
                                    <input name="contactPhone" className="vendor-input" defaultValue={contact.contactPhone} onChange={handleChange}></input>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="row m24">
                                <div className="col">
                                    <p className="label">CONTACT EMAIL</p>
                                    <input name="contactEmail" className="vendor-input" defaultValue={contact.contactEmail} onChange={handleChange}></input>
                                </div>
                                <div className="col">
                                    <p className="label">CONTRACT ENDS</p>
                                    <input name="contractEnds" type="date" className="vendor-input" defaultValue={contact.contractEnds} onChange={handleChange}></input>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="row m24">
                                <div className="col">
                                    <p className="label">REVETIZE FEE</p>
                                    <input name="fee" className="vendor-input" defaultValue={contact.fee} onChange={handleChange}></input>
                                </div>
                                <div className="col">
                                    <p className="label">NOTES</p>
                                    <textarea rows="5" cols="25" name="notes" className="vendor-input" defaultValue={contact.notes} onChange={handleChange}></textarea>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="row m24">
                                <div className="col">
                                    <p className="label">ONLINE ORDERING?</p>
                                    <p className="vendor-select">{contact.onlineOrdering}</p>
                                    <select name="onlineOrdering" id="onlineOrdering" className="vendor-input vs hide" value={contact.onlineOrdering} onChange={handleChange}>
								        <option value="Yes">Yes</option>
								        <option value="No">No</option>
							        </select>
                                </div>
                                <div className="col">
                                    <p className="label">ONLINE ORDERING FORM</p>
                                    <input name="website" className="vendor-input" defaultValue={contact.website} onChange={handleChange}></input>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="row m24">
                                <div className="col">
                                    <p className="label">POS SETUP?</p>
                                    <p className="vendor-select">{contact.posSetup}</p>
                                    <select name="posSetup" id="posSetup" className="vendor-input vs hide" value={contact.posSetup} onChange={handleChange}>
								        <option value="Yes">Yes</option>
								        <option value="No">No</option>
							        </select>
                                </div>
                                <div className="col">
                                    <p className="label">PROMO CODE</p>
                                    <input name="promoCode" className="vendor-input" defaultValue={contact.promoCode} onChange={handleChange}></input>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="row m24">
                                <div className="col">
                                    <p className="label">REMINDER EMAIL</p>
                                    <input name="reminderEmail" className="vendor-input" defaultValue={contact.reminderEmail} onChange={handleChange}></input>
                                </div>
                                <div className="col">
                                    <p className="label">REMINDER PHONE</p>
                                    <input name="reminderPhone" className="vendor-input" defaultValue={contact.reminderPhone} onChange={handleChange}></input>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="row m24">
                                <div className="col">
                                    <p className="label">LATITUDE</p>
                                    <input name="latitude" className="vendor-input" defaultValue={contact.latitude} onChange={handleChange}></input>
                                </div>
                                <div className="col">
                                    <p className="label">LONGITUDE</p>
                                    <input name="longitude" className="vendor-input" defaultValue={contact.longitude} onChange={handleChange}></input>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="row m24">
                                <div className="col">
                                    <p className="label">TERMS SIGNED?</p>
                                    <p className="vendor-select">{contact.termsSigned}</p>
                                    <select name="termsSigned" id="termsSigned" className="vendor-input vs hide" value={contact.termsSigned} onChange={handleChange}>
								        <option value="Yes">Yes</option>
								        <option value="No">No</option>
							        </select>
                                </div>
                                <div className="col">
                                    <p className="label">POS NAME</p>
                                    <input name="posName" className="vendor-input" defaultValue={contact.posName} onChange={handleChange}></input>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="row m24">
                                <div className="col">
                                    <p className="label">DISCOUNT INSTRUCTIONS TOP</p>
                                    <input name="discountInstructions" className="vendor-input" defaultValue={contact.discountInstructions} onChange={handleChange}></input>
                                </div>
                                <div className="col">
                                    <p className="label">DISCOUNT INSTRUCTIONS BOTTOM</p>
                                    <input name="discountInstructionsSmall" className="vendor-input" defaultValue={contact.discountInstructionsSmall} onChange={handleChange}></input>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="row m24">
                                <div className="col">
                                    <p className="label">Secondary Affiliate</p>
                                    <p className="vendor-select">{!affiliates[contact.secondaryAffiliate] ? "None" : affiliates[contact.secondaryAffiliate]}</p>
                                    <select name="secondaryAffiliate" id="secondaryAffiliate" className="vendor-input vs hide" value={contact.secondaryAffiliate} onChange={handleChange}>
								        <option value="None">None</option>
                                        {Object.keys(affiliates).map((key) => (
									        <option value={key} id={key}>{affiliates[key]}</option>
								        ))}
							        </select>
                                </div>
                                <div className="col">
                                    &nbsp;
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="row m24">
                                <div className="col">
                                    <p className="label">DISCLAIMER</p>
                                    <textarea name="disclaimer"  rows="5" cols="25" className="vendor-input" defaultValue={contact.disclaimer} onChange={handleChange}></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
            );

};

            export default VendorProfile;