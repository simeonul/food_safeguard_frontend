import React, {useEffect, useState} from 'react';
import './AccountPage.css'
import {useNavigate} from 'react-router-dom';
import remove from "../../images/no.png";
import logout from "../../images/logout_btn.png";

const AccountPage = () => {
    const jwt = sessionStorage.getItem('jwt');
    const navigate = useNavigate();
    const email = sessionStorage.getItem('email');
    const [user, setUser] = useState(null);

    const fetchUserData = async () => {
        try {
            const response = await fetch(`http://localhost:8080/users/${email}`, {
                headers: {
                    'Authorization': jwt
                }
            });
            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            }
        } catch (err) {
        }
    };

    useEffect(() => {
        if (!email) {
            console.error('Email not found in session storage');
            return;
        }
        fetchUserData();
    }, []);

    const handleRemoveSafeProduct = async (barcode) => {
        try {
            const response = await fetch(`http://localhost:8080/users/remove-safe-product/${email}/${barcode}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': jwt
                }
            });
            if (response.ok) {
                await fetchUserData();
            }
        } catch (err) {
        }
    };

    const handleLogout = () => {
        sessionStorage.clear();
        navigate("/");
    }

    return (
        <div className="account-container">
            {(user && user.safeProducts && user.safeProducts.length > 0) ? (
                    <div>
                        <p className="safe-products-start">My safe products:</p>
                        <div className="safe-product">
                            {user.safeProducts.map((product, id) => (
                                <div key={id} className="product-details">
                                    <div className="safe-product-header">
                                        <span>Barcode: {product.barcode}</span>
                                        <span
                                            className="view-product-bttn"
                                            onClick={() => {
                                                navigate('/product/view', {state: {barcode: product.barcode}})
                                            }}
                                        >
                                    View product info &gt;&gt;
                                </span>
                                    </div>
                                    <div className="safe-product-info">
                                        <div className="info-text">
                                            {product.productName && (<p>Product Name: {product.productName}</p>)}
                                            {product.brand && (<p>Brand: {product.brand}</p>)}
                                        </div>
                                        <img
                                            src={remove}
                                            alt="Icon for removing safe product"
                                            className="remove-safe-bttn"
                                            onClick={() => handleRemoveSafeProduct(product.barcode)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) :
                (<p className="safe-products-start" style={{textAlign: "center"}}>You have no items in your safe
                    products list!</p>)
            }
            <img
                src={logout}
                alt="Logout Button"
                className="logout-button"
                onClick={handleLogout}
            ></img>
        </div>
    );
};

export default AccountPage;
