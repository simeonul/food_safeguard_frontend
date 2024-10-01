import React from 'react';
import './App.css'
import WebcamStream from "./components/video_streaming/WebcamStream";
import {Route, Routes} from "react-router-dom";
import VerificationPage from "./components/verification_page/VerificationPage";
import Navbar from "./components/navbar/Navbar";
import HomePage from "./components/home_page/HomePage";
import RegisterPage from "./components/login_register_pages/RegisterPage";
import LoginPage from "./components/login_register_pages/LoginPage";
import CheckResult from "./components/check_result/CheckResult";
import PrivateRoute from "./components/private_route/PrivateRoute";
import PreferencesPage from "./components/preferences_page/PreferencesPage";
import ProductPage from "./components/add_product_page/ProductPage";
import AccountPage from "./components/account_page/AccountPage";
import IngredientPage from "./components/ingredient_page/IngredientPage";

function App() {
    return (
        <div className="App">
            <Navbar/>
            <Routes>
                <Route path="/register" element={<RegisterPage/>}/>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/" element={<HomePage/>}/>
                <Route path="/verify" element={
                    <PrivateRoute element = {<VerificationPage/>} allowedRoles={['CLIENT', 'ADMIN']}/>
                }/>
                <Route path="/scan" element={
                    <PrivateRoute element = {<WebcamStream/>} allowedRoles={['CLIENT', 'ADMIN']}/>
                }/>
                {/*<Route path="/scan" element={<WebcamStream/>}/>*/}
                <Route path="/preferences" element={
                    <PrivateRoute element = {<PreferencesPage/>} allowedRoles={['CLIENT', 'ADMIN']}/>
                }/>
                <Route path="/check-result" element={
                    <PrivateRoute element = {<CheckResult/>} allowedRoles={['CLIENT', 'ADMIN']}/>
                }/>
                <Route path="/product/:mode" element={
                    <PrivateRoute element = {<ProductPage/>} allowedRoles={['CLIENT', 'ADMIN']}/>
                }/>
                <Route path="/ingredient/:mode" element={
                    <PrivateRoute element = {<IngredientPage/>} allowedRoles={['CLIENT', 'ADMIN']}/>
                }/>
                <Route path="/account" element={
                    <PrivateRoute element = {<AccountPage/>} allowedRoles={['CLIENT', 'ADMIN']}/>
                }/>
            </Routes>
        </div>
    );
}

export default App;
