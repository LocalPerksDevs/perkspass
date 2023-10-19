import React from "react";
import { Nav, NavLink, NavMenu }
	from "./NavbarElements";

const Navbar = () => {
	return (
			<Nav>
				<NavMenu>
                    <NavLink to='/'>
                        <img src='https://firebasestorage.googleapis.com/v0/b/localperkstest.appspot.com/o/perkspass.png?alt=media&token=899760db-0c70-4284-9425-f45543329990&_gl=1*1gkdcls*_ga*MTkxMzE3MzM5Mi4xNjg5MTE2MzM4*_ga_CW55HF8NVT*MTY5NjI4MDc4Ni44Ni4xLjE2OTYyODA4MDAuNDYuMC4w' alt="PerksPass logo"></img>
                    </NavLink>
                    <NavLink to="/sign-in" activeStyle>
						Sign In
					</NavLink>
				</NavMenu>
			</Nav>
	);
};

export default Navbar;
