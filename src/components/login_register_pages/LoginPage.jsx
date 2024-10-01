import React, {useState} from "react";
import './LoginRegisterPages.css'
import access_acc from "../../images/access_acc_btn.png";
import {Link, useNavigate} from "react-router-dom";

const LoginPage = () => {
    const navigate = useNavigate();
    const initialValues = {
        email: "",
        password: ""
    };
    const [formValues, setFormValues] = useState(initialValues);
    const [formErrors, setFormErrors] = useState({});

    const handleFieldsChange = (e) => {
        const {name, value} = e.target;
        setFormValues({...formValues, [name]: value});
    }

    const validate = (values) => {
        const errors = {};
        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

        if (!values.email) {
            errors.email = "Email is required"
        } else if (!emailRegex.test(values.email)) {
            errors.email = "Invalid email format"
        }
        if (!values.password) {
            errors.password = "Password is required"
        } else if (values.password.length < 4) {
            errors.password = "Password is too short"
        }
        return errors;
    }

    const handleLoginSubmit = async () => {
        const errors = validate(formValues);
        setFormErrors(errors);
        if (Object.keys(errors).length === 0) {
            try {
                const credentials = `${formValues.email}:${formValues.password}`;
                const encodedCredentials = btoa(credentials);
                const response = await fetch('http://localhost:8080/LogIn', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Basic ${encodedCredentials}`
                    }
                });
                if (response.ok) {
                    const jwtValue = response.headers.get('Authorization');
                    if (jwtValue) {
                        sessionStorage.setItem('jwt', jwtValue);
                        const jwtPayload = JSON.parse(atob(jwtValue.split('.')[1]));
                        const authority = jwtPayload.authorities;
                        const email = jwtPayload.email;
                        sessionStorage.setItem('authority', authority);
                        sessionStorage.setItem('email', email);
                        navigate("/");
                        window.location.reload();
                    }
                }else {
                    setFormErrors(prevErrors => ({ ...prevErrors, email: "Invalid credentials" }));
                }
            } catch (err) {
                setFormErrors(prevErrors => ({ ...prevErrors, email: "An unexpected error occurred" }));
            }
        }
    }

    return (
        <div className="register-page-container">
            <div className="register-columns">
                <div className="form-column">
                    <p className="register-title">Log In</p>
                    <div className="login-fields">
                        <div className="error-input">
                            <div className="error">
                                <span>{formErrors.email}</span>
                            </div>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                onChange={(e) => handleFieldsChange(e)}
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
                                onChange={(e) => handleFieldsChange(e)}>
                            </input>
                        </div>
                    </div>
                    <div className="bttns-section">
                        <img
                            className="create-acc-bttn"
                            src={access_acc}
                            alt="Access account button"
                            onClick={handleLoginSubmit}
                        >
                        </img>
                        <div className="or-text">or</div>
                        <Link to="/register" className="go-to-login">Create an account here</Link>
                    </div>
                </div>

                <div className="image-column">
                </div>
            </div>
        </div>
    )
}

export default LoginPage;