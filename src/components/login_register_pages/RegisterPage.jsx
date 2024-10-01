import React, {useState} from "react";
import './LoginRegisterPages.css'
import create_acc from "../../images/create_acc_btn.png";
import {Link, useNavigate} from "react-router-dom";

const RegisterPage = () => {
    const navigate = useNavigate();
    const initialValues = {
        firstName : "",
        lastName : "",
        email : "",
        password : "",
        confirmPassword : ""
    };

    const [formValues, setFormValues] = useState(initialValues);
    const [formErrors, setFormErrors] = useState({});

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormValues({...formValues, [name] : value});
    }

    const handleRegisterSubmit = async () => {
        const errors = validate(formValues);
        setFormErrors(errors);
        if (Object.keys(errors).length === 0) {
            try {
                const requestBody = {
                    firstName: formValues.firstName,
                    lastName: formValues.lastName,
                    accountDetails: {
                        email: formValues.email,
                        password: formValues.password,
                        role: "CLIENT"
                    },
                    vegetarian: false,
                    vegan: false
                };
                const response = await fetch('http://localhost:8080/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
                });

                if (response.ok) {
                    navigate('/login');
                } else {
                    setFormErrors(prevErrors => ({ ...prevErrors, email: "Email already in use" }));
                }
            } catch (error) {
                setFormErrors(prevErrors => ({ ...prevErrors, email: "An unexpected error occurred" }));
            }
        }
    }

    const validate = (values) => {
        const errors = {};
        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

        if (!values.firstName) {
            errors.firstName = "First name is required"
        }
        if (!values.lastName) {
            errors.lastName = "Last name is required"
        }
        if (!values.email) {
            errors.email = "Email is required"
        }else if (!emailRegex.test(values.email)){
            errors.email = "Invalid email format"
        }
        if (!values.password) {
            errors.password = "Password is required"
        }else if (values.password.length < 4) {
            errors.password = "Password is too short"
        }
        if (values.password !== values.confirmPassword) {
            errors.confirmPassword = "Passwords do not match"
        }
        return errors;
    }

    return (
        <div className="register-page-container">
            <div className="register-columns">

                <div className="form-column">
                    <p className="register-title">Register</p>
                    <div className="registration-fields">
                        <div className="error-input">
                            <div className="error">
                                <span>{formErrors.firstName}</span>
                            </div>
                            <input
                                type="text"
                                name="firstName"
                                placeholder="First Name"
                                onChange={(e) => handleChange(e)}
                            >
                            </input>
                        </div>
                        <div className="error-input">
                            <div className="error">
                                <span>{formErrors.lastName}</span>
                            </div>
                            <input
                                type="text"
                                name="lastName"
                                placeholder="Last Name"
                                onChange={(e) => handleChange(e)}
                            >
                            </input>
                        </div>
                        <div className="error-input">
                            <div className="error">
                                <span>{formErrors.email}</span>
                            </div>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                onChange={(e) => handleChange(e)}
                            >
                            </input>
                        </div>
                        <div className="error-input">
                            <div className="error">
                                <span>{formErrors.password}</span>
                            </div>
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                onChange={(e) => handleChange(e)}
                            >
                            </input>
                        </div>
                        <div className="error-input">
                            <div className="error">
                                <span>{formErrors.confirmPassword}</span>
                            </div>
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                onChange={(e) => handleChange(e)}
                            >
                            </input>
                        </div>
                    </div>
                    <div className="bttns-section">
                        <img
                            className="create-acc-bttn"
                            src={create_acc}
                            alt="Create account button"
                            onClick={() => handleRegisterSubmit()}
                        ></img>
                        <Link to="/login" className="go-to-login">Do you already have an account?</Link>
                    </div>
                </div>
                <div className="image-column">
                </div>
            </div>
        </div>
    )
}

export default RegisterPage;