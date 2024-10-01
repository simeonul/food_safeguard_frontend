import React from "react";
import './HomePage.css'
import start from "../../images/start_btn.png";
import {Link} from "react-router-dom";

const HomePage = () => {
    const email = sessionStorage.getItem('email');
    return (
        <div className="home-page-container">
            <div className="home-page-text">

                <div className="big-text">
                    <p> Start making <strong> conscious food choices </strong> now.</p>
                </div>

                <div className="small-text-columns">
                    <div className="small-text">
                        <p>Experience the freedom of worry-free shopping. Your health and happiness are worth it!</p>
                    </div>
                    <div className="start-icon">
                        {email ? (
                            <Link to="/preferences">
                                <img className="start" src={start} alt="Start button"/>
                            </Link>
                        ) : (
                            <Link to="/login">
                                <img className="start" src={start} alt="Start button"/>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HomePage;