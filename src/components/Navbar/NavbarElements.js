//import { FaBars } from " react-icons/fa";
import { NavLink as Link } from "react-router-dom";
import styled from "styled-components";

export const Nav = styled.nav`
background: #FFFFFF;
height: 40px;
display: flex;
justify-content: start;
padding: 24px 24px;
z-index: 12;
`;

export const NavLink = styled(Link)`
color: #333333;
display: flex;
align-items: center;
text-decoration: none;
padding: 0 1rem;
height: 100%;
cursor: pointer;
&.active {
	color: #333333;
    font-size: 18px;
}
`;

/*export const Bars = styled(FaBars)`
display: none;
color: #808080;
@media screen and (max-width: 768px) {
	display: block;
	position: absolute;
	top: 0;
	right: 0;
	transform: translate(-100%, 75%);
	font-size: 1.8rem;
	cursor: pointer;
}
`;*/

export const NavMenu = styled.div`
display: flex;
width: 100%;
align-items: center;
justify-content: space-between;
`;
