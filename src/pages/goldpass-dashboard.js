import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from "react-router-dom";
import '../App.css';
import { signOut } from '../../node_modules/firebase/auth/';
import { auth, db } from '../firebase-config';

const GoldpassDashboard = () => {

    const [entityTransactions, setEntityTransactions] = useState([]);
    const [entityMembers, setEntityMembers] = useState([]);
    const [subscribers, setSubscribers] = useState([]);
    const [passesSold, setPassesSold] = useState(0);
    const [numSubscribers, setNumSubscribers] = useState(0);

    const navigate = useNavigate();

    const isUserAdmin = async () => {
		const snapshot = await db.collection("Admins").get();
		if (snapshot.docs[0].data().IDs.includes(auth.currentUser.uid)) {
            return true;
		} else {
            return false;
		}
	}

    useEffect(() => {

        const checkAdminStatus = async () => {
            if (!auth.currentUser) {
                navigate("/sign-in");
                return;
            }
		
            const isAdmin = await isUserAdmin();
            if (!isAdmin) {
                navigate("/dashboard");
            }
            getEntityMembers();
            getEntityTransactions();
            getSubscribers();
        };

        checkAdminStatus();
	}, [navigate]);

    const getEntityTransactions = async () => {
		const snapshot = await db.collection("EntityTransactions").get();
        const documents = snapshot.docs.map(doc => ({
			id: doc.id,
			...doc.data(),
		}));

        setEntityTransactions(documents);
        setPassesSold(snapshot.size);
	}

    const getEntityMembers = async () => {
		const snapshot = await db.collection("EntityMembers").get();
        const a = {};
		snapshot.forEach(doc => {
			a[doc.id] = doc.data().name;
		});
		setEntityMembers(a);
	}

    const getSubscribers = async () => {
        const snapshot = await db.collection("revenuecat_customer_subscriptions")
        .orderBy("purchase_date", "desc")
        .get();
        const documents = snapshot.docs.map(doc => ({
			id: doc.id,
			...doc.data(),
		}));
        setSubscribers(documents);
        setNumSubscribers(snapshot.size);
    }

    const showEntitiesTable = () => {
		document.getElementsByClassName("table subscribers")[0].classList.add("hide");
		document.getElementsByClassName("table entities")[0].classList.remove("hide");
		document.getElementById("ent_tab").classList.add("active");
		document.getElementById("ent_tab").classList.remove("inactive");
		document.getElementById("sub_tab").classList.remove("active");
		document.getElementById("sub_tab").classList.add("inactive");
        document.getElementById("SubscriberCount").classList.add("hide");
		document.getElementById("EntityCount").classList.remove("hide");
	}

    const showSubscribersTable = () => {
		document.getElementsByClassName("table subscribers")[0].classList.remove("hide");
		document.getElementsByClassName("table entities")[0].classList.add("hide");
		document.getElementById("ent_tab").classList.remove("active");
		document.getElementById("ent_tab").classList.add("inactive");
		document.getElementById("sub_tab").classList.add("active");
		document.getElementById("sub_tab").classList.remove("inactive");
        document.getElementById("SubscriberCount").classList.remove("hide");
		document.getElementById("EntityCount").classList.add("hide");
	}

    function formatPhoneNumber(raw) {
        // 1) Strip to just digits
        const digits = (raw || '').replace(/\D/g, '');
      
        // 2) Match country code (1–3 digits) and 10‑digit national number
        const match = digits.match(/^(\d{1,3})(\d{3})(\d{3})(\d{4})$/);
        if (!match) {
          // couldn’t parse → return original
          return raw;
        }
      
        const [, country, area, prefix, line] = match;
        // 3) Build formatted string
        return `${country} (${area}) ${prefix}-${line}`;
      }

    return (
        <div>
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
            <div className="col center" id="rel">
                <h1>
                    Goldpass Dashboard
                </h1>
                <div id="tabs" className='row'>
					<h2 className='active' id="ent_tab" onClick={() => showEntitiesTable()}>Entities</h2>
					<h2 className='ml24 inactive' id="sub_tab" onClick={() => showSubscribersTable()}>Subscribers</h2>
				</div>
                <h2 className='hide' id="SubscriberCount">Subscribers: {numSubscribers}</h2>
				<h2 id="EntityCount">Passes Sold: {passesSold}</h2>
            </div>
            <div className='table entities'>
				<table id="entititiesTable">
					<thead>
						<tr>
							<th>NAME</th>
							<th>DATE</th>
							<th>AMOUNT</th>
						</tr>
					</thead>
					<tbody>
                        {entityTransactions.map(et => {
                            const jsDate = et.created_at.toDate?.() ?? new Date();
                            const dateStr = jsDate.toLocaleString(undefined, {
                                year:   'numeric',
                                month:  'short',
                                day:    '2-digit',
                                hour:   '2-digit',
                                minute: '2-digit',
                                hour12: true,
                            });
                            return (
							<tr key={et.id}>
								<td>{entityMembers[et.member_ref.id] ? entityMembers[et.member_ref.id] : "N/A"}</td>
								<td>{dateStr}</td>
								<td>{"$" + et.amount}</td>
							</tr>
						)})}
					</tbody>
				</table>
			</div>
            <div className='table subscribers hide'>
				<table id="subscribersTable">
					<thead>
						<tr>
							<th>DATE PURCHASED</th>
							<th>NAME</th>
							<th>PHONE</th>
                            <th>EMAIL</th>
                            <th>STATUS</th>
						</tr>
					</thead>
					<tbody>
                        {subscribers.map(sub => {
                            const jsDate = sub.purchase_date.toDate?.() ?? new Date();
                            const dateStr = jsDate.toLocaleString(undefined, {
                                year:   'numeric',
                                month:  'short',
                                day:    '2-digit',
                                hour:   '2-digit',
                                minute: '2-digit',
                                hour12: true,
                            });
                        return(
                            <tr>
                                <td>{dateStr}</td>
                                <td>{sub.customer_name}</td>
                                <td>{formatPhoneNumber(sub.customer_phone)}</td>
                                <td>{sub.customer_email}</td>
                                <td>{sub.status}</td>
                            </tr>
                        )})}
					</tbody>
				</table>
			</div>
        </div>
    );
};

export default GoldpassDashboard;