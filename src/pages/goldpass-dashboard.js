import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from "react-router-dom";
import '../App.css';
import { signOut } from '../../node_modules/firebase/auth/';
import { auth, db } from '../firebase-config';

const GoldpassDashboard = () => {

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
        };

        checkAdminStatus();
	}, [navigate]);

    /*const getAffiliates = async () => {
		const snapshot = await db.collection("Affiliates").get();
		const a = {};
		snapshot.forEach(doc => {
			a[doc.id] = doc.data().Name;
		});
		setAffiliates(a);
	}*/

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
            <div className="center">
                <h1>
                    Goldpass Dashboard
                </h1>
            </div>
            <div className='table entities'>
				<table id="entititiesTable">
					<thead>
						<tr>
							<th>BUSINESS NAME</th>
							<th>MEMBER NAME</th>
							<th>DATE</th>
							<th>AMOUNT</th>
						</tr>
					</thead>
					<tbody>
						<tr>
                            <td>Arepas Factory</td>
                            <td>Felipe Gonzalez</td>
                            <td>04/16/2025 9:32 PM</td>
                            <td>$80</td>
                        </tr>
					</tbody>
				</table>
			</div>
        </div>
    );
};

export default GoldpassDashboard;