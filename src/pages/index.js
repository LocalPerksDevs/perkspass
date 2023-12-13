import React from 'react';
import { NavLink } from "react-router-dom";
import '../App.css';

const Home = () => {

	function showSidebar() {
		document.getElementById("overlay").style.display = "block";
		document.getElementById("sidebar").style.display = "flex";
	}

	function hideSidebar() {
		document.getElementById("overlay").style.display = "none";
		document.getElementById("sidebar").style.display = "none";
	}

	window.onresize = resize;

	function resize() {
		if(window.innerWidth > 760 ) {
			hideSidebar();
		}
	}

	return (
		<div className='curve'>
			<div>
				<div className='topbar'>
					<div className='space align-center'>
						<NavLink to="/">
							<img src='https://firebasestorage.googleapis.com/v0/b/localperkstest.appspot.com/o/perkspass.svg?alt=media&token=1837f3e4-fbfa-4a68-9914-9b0097d9f2c5&_gl=1*4zggl0*_ga*MTkxMzE3MzM5Mi4xNjg5MTE2MzM4*_ga_CW55HF8NVT*MTY5NjU0MTQ4My4xMDMuMS4xNjk2NTQyNzEyLjMwLjAuMA..' to="/" alt="PerksPass Logo"></img>
						</NavLink>
						<div className='row center'>
							<div className='bars' onClick={showSidebar}>
							<i className="fas fa-bars link-red mr40"></i>
							</div>
							<div className='row menu'>
								<NavLink to="https://perkspassvendorapplication.paperform.co/">
									<p className='link-red mr40'>Own a Business?</p>
								</NavLink>
								<NavLink to="/sign-in">
									<p className='link-red'>Affiliate Log In</p>
								</NavLink>
							</div>
						</div>
					</div>
				</div>
				<div className='main-group'>
					<div className='space'>
						<div className='col'>
							<img src='https://firebasestorage.googleapis.com/v0/b/localperkstest.appspot.com/o/New%20Web%20Text.svg?alt=media&token=03808334-1ec4-480f-8c92-40cad6e39696' className='main-text' alt="Repeatable, Unlimited-Use Discounts"></img>
							<p className='subtext'>at the best local restaurants, service and entertainment businesses</p>
							<NavLink to="https://apps.apple.com/us/app/perkspass/id6466313325">
								<img src='https://firebasestorage.googleapis.com/v0/b/localperkstest.appspot.com/o/Apple%20app%20store%20badge.svg?alt=media&token=428872a6-5fb9-4ee3-bcd1-13b1aaad2956&_gl=1*j61f2u*_ga*MTkxMzE3MzM5Mi4xNjg5MTE2MzM4*_ga_CW55HF8NVT*MTY5Njg3MDUzMi4xMDYuMS4xNjk2ODcxOTAyLjYwLjAuMA..' className='apple-store' alt="Download on the App Store"></img>
							</NavLink>
							<NavLink to="https://play.google.com/store/apps/details?id=com.mycompany.localperks&pli=1">
							<img src='https://firebasestorage.googleapis.com/v0/b/localperkstest.appspot.com/o/Google%20app%20store%20badge.svg?alt=media&token=fbe6bb2e-2897-4bda-865d-d1073ee3aa8f&_gl=1*i4m3m7*_ga*MTkxMzE3MzM5Mi4xNjg5MTE2MzM4*_ga_CW55HF8NVT*MTY5Njg3MDUzMi4xMDYuMS4xNjk2ODcyMDM5LjYwLjAuMA..' className='google-store' alt="GET IT ON Google Play"></img>
							</NavLink>
						</div>
						<div className='col cutoff'>
							<img src='https://firebasestorage.googleapis.com/v0/b/localperkstest.appspot.com/o/Phone%20Screenshot.svg?alt=media&token=f7a8597d-185c-41c6-93e2-bea805cdb9e6&_gl=1*1wyd5y9*_ga*MTkxMzE3MzM5Mi4xNjg5MTE2MzM4*_ga_CW55HF8NVT*MTY5OTA2MTY5NS4xNDYuMS4xNjk5MDYxNzE1LjQwLjAuMA..' className='screenshot' alt="screenshot of the Perks Pass app"></img>
						</div>
					</div>
				</div>
			</div>
			<img id ="overlay" className='overlay' alt="overlay"></img>
			<div className="sidebar" id="sidebar">
				<div className='col ml24'>
					<div className='end' onClick={hideSidebar}>
						<i className='fa-solid fa-x end'></i>
					</div>
					<div className='link'>
						<NavLink to="/sign-in">
							<p>Affiliate Log in</p>
						</NavLink>
					</div>
					<div className='link'>
						<NavLink to="https://docs.google.com/forms/d/e/1FAIpQLSeBKz954I-VWbrFzBhds5u9dhfkHZCPUSFnsacbTqRkYEt5LA/viewform">
							<p>Own a Business?</p>
						</NavLink>
					</div>
				</div>
				<div className='center mb40'>
					<img src="https://firebasestorage.googleapis.com/v0/b/localperkstest.appspot.com/o/PerksPass%20Gray.svg?alt=media&token=527c1cea-8459-4654-b753-1db17e88d254&_gl=1*181bf2i*_ga*MTkxMzE3MzM5Mi4xNjg5MTE2MzM4*_ga_CW55HF8NVT*MTY5NzA0MTI3NC4xMTIuMS4xNjk3MDQxMzg1LjQ0LjAuMA.." alt="Perks Pass Logo"></img>
				</div>
			</div>
		</div>
	);
};

export default Home;
