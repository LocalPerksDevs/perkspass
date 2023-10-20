import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { db, auth } from '../firebase-config';
import { signInAnonymously } from "firebase/auth";

const VendorProfile = () => {

    let vendorID = '';

    const navigate = useNavigate();

    useEffect(() => {
        if (!auth.currentUser) {
            navigate("/perkspass/sign-in");
        } else {
            vendorID = window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1)
            if (vendorID === "vendor-profile") {
                vendorID = '';
            }

            if (vendorID) {
                getVendorData();
            }
        }
    }, []);

    const getVendorData = async () => {
        const snapshot = await db.collection("Establishments").doc(vendorID).get();
        if (snapshot.exists) {
            setContact(() => {
                return {
                    active: snapshot.data().Active === true ? "Yes" : "No",
                    address: snapshot.data().Address,
                    affiliateID: snapshot.data().AffiliateID,
                    appLaunchDate: !snapshot.data().AppLaunchDate ? "N/A" : snapshot.data().AppLaunchDate.toDate().toDateString(),
                    category: snapshot.data().Category,
                    city: snapshot.data().City,
                    contactEmail: !snapshot.data().ContactEmail ? "N/A" : snapshot.data().ContactEmail,
                    contactName: !snapshot.data().ContactName ? "N/A" : snapshot.data().ContactName,
                    contactPhone: !snapshot.data().ContactPhone ? "N/A" : snapshot.data().ContactPhone,
                    contractEnds: !snapshot.data().ContractEnds ? "N/A" : snapshot.data().ContractEnds.toDate().toDateString(),
                    disclaimer: !snapshot.data().Disclaimer ? "None" : snapshot.data().Disclaimer,
                    discount: snapshot.data().Discount,
                    fee: !snapshot.data().Fee ? "N/A" : snapshot.data().Fee,
                    latLon: snapshot.data().latLon,
                    logoURL: snapshot.data().LogoURL,
                    name: snapshot.data().Name,
                    notes: !snapshot.data().Notes ? "None" : snapshot.data().Notes,
                    onlineOrdering: snapshot.data().OnlineOrdering === true ? "Yes" : "No",
                    posCall: !snapshot.data().POSCall ? "N/A" : snapshot.data().POSCall.toDate().toDateString(),
                    posName: !snapshot.data().POSName ? "N/A" : snapshot.data().POSName,
                    posSetup: snapshot.data().POSSetup === true ? "Yes" : "No",
                    phone: snapshot.data().Phone,
                    promoCode: snapshot.data().PromoCode,
                    state: snapshot.data().State,
                    termsSigned: snapshot.data().termsSigned === "true" ? "Yes" : "No",
                    typeOfThing: snapshot.data().TypeOfThing,
                    website: !snapshot.data().Website ? "None" : snapshot.data().Website,
                    zip: !snapshot.data().Zip ? "N/A" : snapshot.data().Zip, 
                };
            });
        }
    }

    const [contact, setContact] = useState({
        address: "", category: "",
        city: "", discount: "", logoURL: "", name: "", onlineOrdering: "true",
        phone: "", promoCode: "", state: "",
        typeOfThing: "Food", website: "", contractEnds: "", disclaimer: ""
    });

    return (
        <div>
            <div className='topbar space'>
                <NavLink to="/perkspass">
                    <img src='https://firebasestorage.googleapis.com/v0/b/localperkstest.appspot.com/o/perkspass.png?alt=media&token=899760db-0c70-4284-9425-f45543329990&_gl=1*1gkdcls*_ga*MTkxMzE3MzM5Mi4xNjg5MTE2MzM4*_ga_CW55HF8NVT*MTY5NjI4MDc4Ni44Ni4xLjE2OTYyODA4MDAuNDYuMC4w' to="/" alt="PerksPass Logo"></img>
                </NavLink>
                <div className='row'>
                    <NavLink to="/perkspass/dashboard">
                        <p className='link'>Dashboard</p>
                    </NavLink>
                </div>
            </div>
            <div className="center col">
                <h1>
                    Vendor Profile
                </h1>
                <div className="vendor-profile">
                    <div className="col center mt24 mb24">
                        <img src={contact.logoURL} id="logo-img"></img>
                        <p className="vendor-name">{contact.name}</p>
                    </div>
                    <div className="row space-between">
                        <div className="col w50 mr12">
                            <p className="label">CATEGORY</p>
                            <p className="vendor-category">{contact.category}</p>
                            <p className="label">CUSTOMER PHONE</p>
                            <p className="vendor-category">{contact.phone}</p>
                            <p className="label">CITY</p>
                            <p className="vendor-category">{contact.city}</p>
                            <p className="label">ZIP</p>
                            <p className="vendor-category">{contact.zip}</p>
                            <p className="label">ACTIVE?</p>
                            <p className="vendor-category">{contact.active}</p>
                            <p className="label">CONTACT NAME</p>
                            <p className="vendor-category">{contact.contactName}</p>
                            <p className="label">CONTACT EMAIL</p>
                            <p className="vendor-category">{contact.contactEmail}</p>
                            <p className="label">REVETIZE FEE</p>
                            <p className="vendor-category">{contact.fee}</p>
                            <p className="label">ONLINE ORDERING?</p>
                            <p className="vendor-category">{contact.onlineOrdering}</p>
                            <p className="label">POS NAME</p>
                            <p className="vendor-category">{contact.posName}</p>
                            <p className="label">POS CALL DATE </p>
                            <p className="vendor-category">{contact.posCall}</p>
                            <p className="label">TERMS SIGNED? </p>
                            <p className="vendor-category">{contact.termsSigned}</p>
                        </div>
                        <div className="col w50">
                            <p className="label">ADDRESS</p>
                            <p className="vendor-category">{contact.address}</p>
                            <p className="label">TYPE</p>
                            <p className="vendor-category">{contact.typeOfThing}</p>
                            <p className="label">STATE</p>
                            <p className="vendor-category">{contact.state}</p>
                            <p className="label">DISCOUNT</p>
                            <p className="vendor-category">{contact.discount}</p>
                            <p className="label">APP LAUNCH DATE</p>
                            <p className="vendor-category">{contact.appLaunchDate}</p>
                            <p className="label">CONTACT PHONE</p>
                            <p className="vendor-category">{contact.contactPhone}</p>
                            <p className="label">CONTRACT ENDS</p>
                            <p className="vendor-category">{contact.contractEnds}</p>
                            <p className="label">NOTES</p>
                            <p className="vendor-category">{contact.notes}</p>
                            <p className="label">ONLINE ORDERING FORM</p>
                            <p className="vendor-category">{contact.website}</p>
                            <p className="label">POS SETUP?</p>
                            <p className="vendor-category">{contact.posSetup}</p>
                            <p className="label">PROMO CODE</p>
                            <p className="vendor-category">{contact.promoCode}</p>
                            <p className="label">DISCLAIMER</p>
                            <p className="vendor-category">{contact.disclaimer}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

};

export default VendorProfile;