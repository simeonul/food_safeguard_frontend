import React, {useState} from 'react';
import {Link, useLocation} from "react-router-dom";
import './Navbar.css';
import logo from '../../images/logo.png';
import account from '../../images/account_btn.png';
import menu from '../../images/menu_btn.png';
import close from '../../images/close_btn.png';

const Navbar = () => {
    const [isNavActive, setIsNavActive] = useState(false);
    const isAdmin = sessionStorage.getItem('jwt') && (sessionStorage.getItem('authority') === 'ADMIN');
    const email = sessionStorage.getItem('email');
    const location = useLocation();

    const isTabActive = (path) => {
        return location.pathname === path;
    }

    return (
        <div className="navbar">
            <Link to="/" className="logo-link">
                <img className="logo" src={logo} alt="Logo"/>
            </Link>
            <nav>
                <ul className={isNavActive ? ["menu-list", "active"].join(' ') : "menu-list"}>
                    <li onClick={() => setIsNavActive(!isNavActive)}>
                        <Link to="/scan" className={isTabActive('/scan') ? 'selected' : ''} style={{color: '#157023'}}>Scan
                            a product</Link>
                    </li>
                    {!isAdmin && (
                        <li onClick={() => setIsNavActive(!isNavActive)}>
                            <Link to="/preferences" className={isTabActive('/preferences') ? 'selected' : ''}>My
                                preferences</Link>
                        </li>
                    )}
                    {!isAdmin && (
                        <li onClick={() => {
                            setIsNavActive(!isNavActive);
                            window.location.reload();
                        }}>
                            <Link to="/product/view" className={isTabActive('/product/view') ? 'selected' : ''}>View
                                product</Link>
                        </li>
                    )}
                    <li onClick={() => {
                        setIsNavActive(!isNavActive);
                        window.location.reload();
                    }}>
                        <Link to="/product/add" className={isTabActive('/product/add') ? 'selected' : ''}>Add a
                            product</Link>
                    </li>
                    {isAdmin && (
                        <li onClick={() => {
                            setIsNavActive(!isNavActive);
                            window.location.reload();
                        }}>
                            <Link to="/product/edit" className={isTabActive('/product/edit') ? 'selected' : ''}>Edit a
                                product</Link>
                        </li>
                    )}
                    <li onClick={() => {
                        setIsNavActive(!isNavActive);
                        window.location.reload();
                    }}>
                        <Link to="/ingredient/add" className={isTabActive('/ingredient/add') ? 'selected' : ''}>Add
                            ingredient</Link>
                    </li>
                    {isAdmin && (
                        <li onClick={() => {
                            setIsNavActive(!isNavActive);
                            window.location.reload();
                        }}>
                            <Link to="/ingredient/edit" className={isTabActive('/ingredient/edit') ? 'selected' : ''}>Edit
                                ingredient</Link>
                        </li>
                    )}
                    <li onClick={() => setIsNavActive(!isNavActive)}>
                        {email ? (
                            <Link to="/account">
                                <img className="account" src={account} alt="Icon representing account button"/>
                            </Link>
                        ) : (
                            <Link to="/login">
                                <img className="account" src={account} alt="Icon representing account button"/>
                            </Link>
                        )}
                    </li>
                </ul>
            </nav>
            <div
                onClick={() => setIsNavActive(!isNavActive)}
                className="mobile-menu-btn"
            >
                {isNavActive ?
                    <img className="mobile-close-image" src={close} alt="Close button" style={{maxWidth: 25}}/> :
                    <img className="mobile-menu-image" src={menu} alt="Menu button" style={{maxWidth: 35}}/>
                }
            </div>
        </div>
    )
}

export default Navbar;
