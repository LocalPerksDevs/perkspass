import React from "react";
import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import '../App.css';
import { auth } from '../firebase-config';
import { signInWithEmailAndPassword } from '../../node_modules/firebase/auth/';

const AddVendor = () => {

	useEffect(() => {
		if (auth.currentUser) {
			navigate("/perkspass/dashboard");
		}
	}, []);

	const login = async () => {
		setMsg("");
		if (document.getElementsByName('email')[0].value === '') {
			setEmailMsg("Please enter your email address");
			return;
		} else {
			setEmailMsg("");
		}

		if (document.getElementsByName('password')[0].value === '') {
			setPasswordMsg("Please enter your password");
			return;
		} else {
			setPasswordMsg("");
		}

		try {
			await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
			if (auth.currentUser) {
				navigate("/perkspass/dashboard");
			}
		} catch (error) {
			setMsg("Error: " + error.message);
		}
	};

	const reset = () => {
		document.getElementById('reset').classList.remove('hide');
		document.getElementById('sign-in').classList.add('hide');
		setMsg("");
	}

	const signIn = () => {
		document.getElementById('reset').classList.add('hide');
		document.getElementById('sign-in').classList.remove('hide');
		setMsg("");
	}

	const handleReset = async () => {
		if (!resetEmail) {
			setMsg("Please enter the email address");
			return
		}
		try {
			setMsg("");
			await auth.sendPasswordResetEmail(resetEmail);
			setMsg("Password Reset Email Sent!");
		} catch (error) {
			setMsg("Error sending reset email: " + error.message);
		}
	}

	const [loginEmail, setLoginEmail] = useState("");
	const [resetEmail, setResetEmail] = useState("");
	const [loginPassword, setLoginPassword] = useState("");
	const navigate = useNavigate();
	const [msg, setMsg] = useState("");
    const [emailMsg, setEmailMsg] = useState("");
    const [passwordMsg, setPasswordMsg] = useState("");

	return (
		<div>
			<div className="topbar left">
				<NavLink to="/perkspass">
					<img src='https://firebasestorage.googleapis.com/v0/b/localperkstest.appspot.com/o/perkspass.png?alt=media&token=899760db-0c70-4284-9425-f45543329990&_gl=1*1gkdcls*_ga*MTkxMzE3MzM5Mi4xNjg5MTE2MzM4*_ga_CW55HF8NVT*MTY5NjI4MDc4Ni44Ni4xLjE2OTYyODA4MDAuNDYuMC4w' to="/" alt="PerksPass Logo"></img>
				</NavLink>
			</div>
			<div id="sign-in">
				<div className="center col">
					<h1>
						Sign In
					</h1>
					<p>{msg}</p>
				</div>
				<div className="col center">
					<p id="email-msg" className="">{emailMsg}</p>
					<input placeholder="Email" type="email" name="email" onChange={(event) => {setLoginEmail(event.target.value)}}></input>
					<p id="password-msg" className="">{passwordMsg}</p>
					<input type="password" name="password" placeholder="Password" onChange={(event) => {setLoginPassword(event.target.value)}}></input>
					<button onClick={login}>Sign In</button>
					<p className="reset" onClick={() => reset()}>Forgot Password?</p>
				</div>
			</div>
			<div id="reset" className="hide">
				<div className="center col">
					<h1>
						Reset Password
					</h1>
					<p>Enter your e-mail address and we'll send you a link to reset your password</p>
					<p>{msg}</p>
				</div>
				<div className="col center">
					<input placeholder="Email Address" type="email" name="email-reset" onChange={(event) => {setResetEmail(event.target.value)}}></input>
					<button onClick={handleReset}>Send Request</button>
					<p className="reset" onClick={() => signIn()}>Back to Sign In</p>
				</div>
			</div>
		</div>
	);
};

export default AddVendor;
