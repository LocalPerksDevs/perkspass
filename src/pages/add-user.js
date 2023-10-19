import React from "react";
import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import '../App.css';
import { auth, db } from '../firebase-config';
import { onAuthStateChanged } from '../../node_modules/firebase/auth/';

const AddUser = () => {

    const isUserAdmin = async () => {
		const snapshot = await db.collection("Admins").get();
		if (snapshot.docs[0].data().IDs.includes(auth.currentUser.uid)) {
            return true;
		} else {
            return false;
		}
	}

	useEffect(() => {
		if (!auth.currentUser) {
			navigate("/sign-in");
		}

        if (!isUserAdmin()) {
            navigate("/dashboard");
        }
        setMsg("Success! User was signed up!");
	}, []);

    function resetForm() {
        setEmail('');
		document.getElementsByName("email")[0].value = "";
        setPassword('');
        document.getElementsByName("password")[0].value = "";
        setAdmin(false);
        document.getElementById("user-form").classList.remove('hide');
        document.getElementById("user-message").classList.add('hide');
        document.getElementById("user-btn").classList.add('hide');
    }

    const handleSignUp = async () => {
        if (document.getElementsByName("email")[0].value === "") {
            setEmailMsg("Please enter the new user email");
            document.getElementById("email-msg").classList.remove('hide');
            return;
        } else {
            setEmailMsg("");
            document.getElementById("email-msg").classList.add('hide');
        }

        if (document.getElementsByName("password")[0].value === "") {
            setPasswordMsg("Please enter a password for the new user");
            document.getElementById("password-msg").classList.remove('hide');
            return;
        } else {
            setPasswordMsg("");
            document.getElementById("password-msg").classList.add('hide');
        }

        if (document.getElementsByName("password")[0].value.length < 6 ) {
            setPasswordMsg("Password must be at least 6 characters");
            document.getElementById("password-msg").classList.remove('hide');
            return;
        } else {
            setPasswordMsg("");
            document.getElementById("password-msg").classList.add('hide');
        }

        try {
            // Create user with email and password
            await auth.createUserWithEmailAndPassword(email, password);
            //setUserObj(userCredential);
            
            // Make user an Admin
            if (admin) {
                const collectionRef = db.collection('Admins');
                collectionRef.get().then((querySnapshot) => {
                    if (!querySnapshot.empty) {
                        const doc = querySnapshot.docs[0];
                        const existingArray = doc.data().IDs || [];
                        const newArray = [...existingArray, userObj.uid];
                        collectionRef.doc(doc.id).update({IDs: newArray,
                        });
                    }
                }).catch((error) => {
                    setMsg('Error getting documents: ' + error);
                })
            }
            document.getElementById("user-form").classList.add('hide');
            document.getElementById("user-message").classList.remove('hide');
            document.getElementById("user-btn").classList.remove('hide');
        } catch (error) {
            setMsg('Error signing up:' + error.message);
            document.getElementById("user-message").classList.remove('hide');
        }
    };

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [admin, setAdmin] = useState(false);
    const [userObj, setUserObj] = useState({});
    const navigate = useNavigate();
    const [msg, setMsg] = useState("");
    const [emailMsg, setEmailMsg] = useState("");
    const [passwordMsg, setPasswordMsg] = useState("");

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            setUserObj(user);
        }
    })

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
                    Add New User
                </h1>
            </div>
            <div id="user-message" className="message center col hide">
					<p>{msg}</p>
					<button id="user-btn" className="mt24 hide" onClick={resetForm}>Add Another User</button>
			</div>
            <div className="col center" id="user-form">
                <p id="email-msg" className="hide">{emailMsg}</p>
                <input placeholder="Email" name="email" onChange={(event) => { setEmail(event.target.value) }}></input>
                <p id="password-msg" className="hide">{passwordMsg}</p>
                <input placeholder="Password" name="password" onChange={(event) => { setPassword(event.target.value) }}></input>
                <label htmlFor="onlineOrdering">Make User An Admin?</label>
                <select name="admin" id="admin" value={admin} onChange={(event) => { 
                    if (event.target.value === "true") {
                        setAdmin(true);
                    } else {
                        setAdmin(false);
                    }}}>
					<option value="true">Yes</option>
					<option value="false">No</option>
				</select>
                <button onClick={handleSignUp}>Add User</button>
                <p>{userObj.email}</p>
            </div>
        </div>
    );
};

export default AddUser;
