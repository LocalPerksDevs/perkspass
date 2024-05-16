import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { app, db, auth } from '../firebase-config';
/*import { getStorage, ref, getDownloadURL, uploadBytes } from "../../node_modules/firebase/storage";
import axios from '../axios';
import firebase from "../../node_modules/firebase/compat/app";*/

const Receipts = () => {

	const navigate = useNavigate();

    const isUserAdmin = async () => {
		const snapshot = await db.collection("Admins").get();
		if (snapshot.docs[0].data().IDs.includes(auth.currentUser.uid)) {
            return true;
		} else {
            return false;
		}
	}

	const [receipts, setReceipts] = useState([]);

	const getReceipts = async () => {
		const snapshot = await db.collection("Receipts")/*.orderBy('verified', 'asc')*/
		.orderBy('created_date', 'desc').get();
		const documents = snapshot.docs.map(doc => ({
			id: doc.id,
			...doc.data(),
		}));

		setReceipts([...documents]);
	}

	useEffect(() => {
		if (!auth.currentUser) {
			navigate("/sign-in");
		}

        if (!isUserAdmin()) {
            navigate("/dashboard");
        } else {
			getReceipts();
		}
	}, []);

	const updateFirestoreDocument = async (docID, newStatus) => {
		try {
		  
		  //console.log("docID is: " + docID);
		  const docRef = db.collection('Receipts').doc(docID);
	
		  // Update the document based on the checkbox status
		  await docRef.update({
			verified: newStatus
		  });
		  updateCheckedStatus(docID, newStatus);
		} catch (error) {
		  console.error('Error updating document: ', error);
		}
	  };

	  const updateCheckedStatus = (docID, newStatus) => {
		const updatedReceipts = receipts.map(doc => {
		  if (doc.id === docID) {
			return { ...doc, verified: newStatus };
		  } else {
			return doc;
		  }
		});
		setReceipts(updatedReceipts);
	  };

	  function yyyymmdd(date) {
        var y = date.getFullYear().toString();
        var m = (date.getMonth() + 1).toString();
        var d = date.getDate().toString();
        (d.length == 1) && (d = '0' + d);
        (m.length == 1) && (m = '0' + m);
        var yyyymmdd = y + "-" + m +  "-" + d;
        return yyyymmdd;
    }

	function mmddyyyy(date) {
        var y = date.getFullYear().toString();
        var m = (date.getMonth() + 1).toString();
        var d = date.getDate().toString();
        (d.length == 1) && (d = '0' + d);
        (m.length == 1) && (m = '0' + m);
        return m + "/" + d + "/" + y;
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
            <div className="center">
                <h1>
                    Receipts
                </h1>
			</div>
			<div className='table receipts'>
				<table>
					<thead>
						<tr>
							<th>VENDOR NAME&nbsp;<i id="Name" className=""></i></th>
							<th>VENDOR LOCATION</th>
							<th>DATE RECEIVED</th>
							<th>IMAGE</th>
							<th>VERIFIED?</th>
						</tr>
					</thead>
					<tbody>
						{receipts.map(doc => (
							<tr key={doc.id}>
								<td>{doc.establishment_name}</td>
								<td>{doc.establishment_city + ', ' + doc.establishment_state}</td>
								<td>{mmddyyyy(doc.created_date.toDate())}</td>
								<td><a href={doc.url} target="_blank">Image of Receipt</a></td>
								<td><input type="checkbox" checked={doc.verified} onChange={() => updateFirestoreDocument(doc.id, !doc.verified)}></input></td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
    );
};

export default Receipts;
