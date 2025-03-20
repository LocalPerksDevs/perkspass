import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import '../App.css';
import { auth, db } from '../firebase-config';
import Deal from '../components/Deal.js';
import firebase from "../../node_modules/firebase/compat/app";
import GoldPassSum from "../components/GoldpassSum.js";

const AddDeal = () => {

    const [goldpassSumInstance, setGoldpassSumInstance] = useState(null);

    useEffect(() => {
		if (!auth.currentUser) {
			navigate("/sign-in");
		}

        if (vendorID) {
            getVendorData();
            const instance = new GoldPassSum(db);
			setGoldpassSumInstance(instance);
        }

	}, []);

    const [vendorID, setVendorID] = useState(window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1));
    const [deals, setDeals] = useState([{ deal_name: "", deal_value: 0, deal_desc: "" }]);
    const navigate = useNavigate();
    const [contact, setContact] = useState([{
        name: ""
    }])
    const [msg, setMsg] = useState("Deal successfully added!");

    const getVendorData = async () => {
        const snapshot = await db.collection("Establishments").doc(vendorID).get();
        if (snapshot.exists) {
            setContact((prev) => {
                return {
                    ...prev,
                    name: snapshot.data().Name
                };
            });
        }
    }

    const handleChange = (event, index = null) => {
		event.preventDefault();
		const { name, value, type } = event.target;

		let newValue = value;

		if (type === "number") {
			newValue = parseFloat(value) || 0;
			newValue = roundToTwoDecimals(newValue);
		}

		/*setContact((prev) => {
			if (index != undefined) {
				const updatedDeals = prev.deals.map((deal, i) =>
					i === index ? { ...deal, [name]: newValue } : deal
				);
				return { ...prev, deals: updatedDeals };
			}
			return { ...prev, [name]: newValue };
		});*/
        setDeals((prevDeals) =>
            prevDeals.map((deal, i) =>
                i === index ? { ...deal, [name]: newValue } : deal
            )
        );
	}

    function roundToTwoDecimals(num) {
		return Math.round(num * 100) / 100;
	}

    const isValidDeal = (deal) => {
        return deal.deal_name && deal.deal_desc;
    }

    const addDeal = () => {
        setDeals((prev) => [
            ...prev,
            { deal_name: "", deal_desc: "", deal_value: 0 }]);
    };

    const addDealsToFirebase = (event) => {
        event.preventDefault();

        const allDealsValid = deals.every(isValidDeal);
        if (!allDealsValid) {
            console.error("Error: Some deals are missing required fields");
            return;
        }

        for (const deal of deals) {
            db.collection("EstablishmentDeals").add({
                Name: deal.deal_name,
                Description: deal.deal_desc,
                Amount: deal.deal_value,
                Establishment_Ref: db.doc(`Establishments/${vendorID}`),
                Enabled: false,
                Created_At: firebase.firestore.FieldValue.serverTimestamp(),
                Updated_At: firebase.firestore.FieldValue.serverTimestamp()
            })
        }

        document.getElementById("user-message").classList.remove("hide");
        document.getElementById("add-deal-form").classList.add("hide");

        setDeals([{deal_name: "", deal_desc: "", deal_value: 0 }]);
        goldpassSumInstance.updateSum();
    }

    function resetForm() {
        document.getElementById("user-message").classList.add("hide");
        document.getElementById("add-deal-form").classList.remove("hide");
    }

    return (
        <>
            <div className="topbar space">
                <NavLink to="/">
                    <img src='https://firebasestorage.googleapis.com/v0/b/localperkstest.appspot.com/o/perkspass.png?alt=media&token=899760db-0c70-4284-9425-f45543329990&_gl=1*1gkdcls*_ga*MTkxMzE3MzM5Mi4xNjg5MTE2MzM4*_ga_CW55HF8NVT*MTY5NjI4MDc4Ni44Ni4xLjE2OTYyODA4MDAuNDYuMC4w' to="/" alt="PerksPass Logo"></img>
                </NavLink>
                <div className='row'>
					<NavLink to="/dashboard">
						<p className='link'>Dashboard</p>
					</NavLink>
				</div>
            </div>
            <div className="center">
                <h1>
                    Add New Deal For {contact.name}
                </h1>
            </div>
            <div id="user-message" className="message center col hide">
					<p>{msg}</p>
					<button id="user-btn" className="mt24" onClick={resetForm}>Add Another Deal</button>
			</div>
            <div className="col center App" id="add-deal-form">
                <div className="add-deal">
                    {deals.map((deal, index) => (
                        <Deal
                            key={index}
                            deal={deal}
                            index={index}
                            handleChange={handleChange}
                            className="add-deal-div"
                        />
                    ))}
                    <div className="row">
                        <div className="button" id="addDealBtn" onClick={addDeal}>Add Another Deal</div>
                        <div className="button" id="addDealBtn" onClick={addDealsToFirebase}>Save Deal{deals.length > 1 ? "s" : ""}</div>
                    </div>
                </div>
            </div>
            <div className="center">
                <button onClick={() => {navigate(`/vendor-profile/${vendorID}`)}}>Return to {contact.name}'s profile page</button>
            </div>
        </>
    );
}

export default AddDeal;