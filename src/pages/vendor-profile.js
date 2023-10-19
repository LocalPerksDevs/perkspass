import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { db, auth } from '../firebase-config';

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
            setContact((prev) => {
                return {
                    ...prev, address: snapshot.data().Address,
                    name: snapshot.data().Name,
                    phone: snapshot.data().Phone,
                    category: snapshot.data().Category,
                    typeOfThing: snapshot.data().TypeOfThing,
                    city: snapshot.data().City,
                    state: snapshot.data().State,
                    discount: snapshot.data().Discount,
                    onlineOrdering: snapshot.data().OnlineOrdering === true ? "true" : "false",
                    website: snapshot.data().Website,
                    promoCode: snapshot.data().PromoCode,
                    disclaimer: snapshot.data().Disclaimer,
                    contractEnds: snapshot.data().ContractEnds
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
            <div className="center">
                <h1>
                    Vendor Profile
                </h1>
            </div>
        </div>
    );

};

export default VendorProfile;