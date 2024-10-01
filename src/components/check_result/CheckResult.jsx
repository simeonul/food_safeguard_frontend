import React, {useState, useEffect} from "react";
import './CheckResult.css';
import {useNavigate, useLocation} from "react-router-dom";
import yesImage from '../../images/yes.png'
import maybeImage from '../../images/maybe.png'
import noImage from '../../images/no.png'
import heart_empty from '../../images/heart_empty.png'
import heart_full from '../../images/heart_full.png'

const CheckResult = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {barcode} = location.state || {};
    const email = sessionStorage.getItem('email');
    const jwt = sessionStorage.getItem('jwt');
    const [response, setResponse] = useState(null);
    const [resultClass, setResultClass] = useState(null);
    const [allergensSafe, setAllergensSafe] = useState(null);
    const [vegetarianSafe, setVegetarianSafe] = useState(null);
    const [veganSafe, setVeganSafe] = useState(null);
    const [error, setError] = useState(null);
    const [isInSafeProducts, setIsInSafeProducts] = useState(false);

    useEffect(() => {
        const fetchProductData = async () => {
            if (!barcode) {
                navigate('/scan');
                return;
            }
            if (email && barcode) {
                try {
                    const response = await fetch(`http://localhost:8080/search/${email}/${barcode}`, {
                        headers: {
                            'Authorization': jwt
                        }
                    });
                    if (!response.ok) {
                        throw new Error();
                    }
                    const productData = await response.json();
                    setResponse(productData);
                    if (productData) {
                        setResultClass(getResultClass(productData.isOverallSafe));
                        setAllergensSafe(getResultClass(productData.allergicInfo.isSafe));
                        setVegetarianSafe(getResultClass(productData.vegetarianInfo.isSafe));
                        setVeganSafe(getResultClass(productData.veganInfo.isSafe));
                    }
                } catch (err) {
                    setError('The product with barcode ' + barcode + ' could not be found');
                }
            }
        };
        fetchProductData();
    }, [email, barcode, navigate]);

    useEffect(() => {
        if (!email) {
            return;
        }
        const fetchUserData = async () => {
            try {
                const response = await fetch(`http://localhost:8080/users/${email}`, {
                    headers: {
                        'Authorization': jwt
                    }
                });
                if (response.ok) {
                    const userData = await response.json();
                    setIsInSafeProducts(userData.safeProducts.some(product => product.barcode === barcode));
                }
            } catch (err) {
            }
        };
        fetchUserData();
    }, []);

    const getResultClass = (category) => {
        switch (category) {
            case 'YES':
                return 'result-yes';
            case 'MAYBE':
                return 'result-maybe';
            case 'NO':
                return 'result-no';
            default:
                return 'result-no';
        }
    }

    const getTextContentTitle = (classValue) => {
        const titleOptions = {
            'result-yes': 'matches',
            'result-maybe': 'might not match',
            'result-no': 'does not match'
        };
        return titleOptions[classValue];
    }

    const getTextContentAllergens = (classValue) => {
        const allergensOptions = {
            'result-yes': 'no allergens',
            'result-no': 'allergens:',
        };
        return allergensOptions[classValue];
    }

    const getTextContentVegetarian = (classValue) => {
        const vegetarianOptions = {
            'result-yes': 'all vegetarian',
            'result-maybe': 'possibly not vegetarian:',
            'result-no': 'not vegetarian:',
        };
        return vegetarianOptions[classValue];
    }

    const getTextContentVegan = (classValue) => {
        const veganOptions = {
            'result-yes': 'all vegan',
            'result-maybe': 'possibly not vegan:',
            'result-no': 'not vegan:',
        };
        return veganOptions[classValue];
    }

    const getImage = (isSafe) => {
        switch (isSafe) {
            case 'result-yes':
                return yesImage;
            case 'result-maybe':
                return maybeImage;
            case 'result-no':
                return noImage;
            default:
                return noImage;
        }
    }

    const handleAddToSafe = async () => {
        if (response) {
            try {
                const addToSafeResponse = await fetch(`http://localhost:8080/users/add-safe-product/${email}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': jwt
                    },
                    body: JSON.stringify({
                        barcode: barcode,
                        productName: response.productName,
                        brand: response.brandName
                    }),
                });
                if (addToSafeResponse.ok) {
                    setIsInSafeProducts(true);
                } else {
                    console.error('Failed to add product to safe list');
                }
            } catch (error) {
                console.error('Error adding product to safe list:', error);
            }
        }
    }

    return (
        <div className="check-result-container">
            {response && (
                <div className={["result-box", resultClass].join(' ')}>
                    <div className="result-title-header">
                        <span style={{color: "black"}}>This item </span>
                        <span>{getTextContentTitle(resultClass)} </span>
                        <span style={{color: "black"}}>your preferences </span>
                    </div>
                    {response.isOverallSafe === 'YES' && (
                        <div className="add-to-safe-section">
                            {isInSafeProducts ?
                                (<span>Already in safe products list</span>) :
                                (<span>Add to my safe products</span>)
                            }
                            <img
                                src={isInSafeProducts ? heart_full : heart_empty}
                                alt="Icon for adding to safe"
                                className="add-to-safe-icon"
                                onClick={!isInSafeProducts ? handleAddToSafe : undefined}
                            ></img>
                        </div>
                    )}
                    {(response.productName || response.brandName) && (
                        <div className="product-info">
                            {response.productName && <span style={{textAlign: "left"}}>{response.productName}</span>}
                            {response.brandName && <span style={{textAlign: "right"}}>by {response.brandName}</span>}
                        </div>
                    )}
                    <div className="warnings">
                        <div className="ingredients-section">
                            <div className="safety-icon-wrapper">
                                <img src={getImage(allergensSafe)} alt="Icon for allergens info"
                                     style={{maxWidth: "30px"}}/>
                            </div>
                            <div className="ingredients-text">
                                <span>{getTextContentAllergens(allergensSafe)} </span>
                                {response.allergicInfo.problematicIngredients && (
                                    <div style={{marginTop: "3px"}}>
                                        {response.allergicInfo.problematicIngredients.slice(0, 4).map((ingredient, index) => (
                                            <span key={index}>{ingredient}<br/></span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        {(response.vegetarianInfo.include && !response.veganInfo.include) && (
                            <div className="ingredients-section">
                                <div className="safety-icon-wrapper">
                                    <img src={getImage(vegetarianSafe)} alt="Icon for allergens info"
                                         style={{maxWidth: "30px"}}/>
                                </div>
                                <div className="ingredients-text">
                                    <span>{getTextContentVegetarian(vegetarianSafe)} </span>
                                    {response.vegetarianInfo.problematicIngredients && (
                                        <div style={{marginTop: "3px"}}>
                                            {response.vegetarianInfo.problematicIngredients.slice(0, 4).map((ingredient, index) => (
                                                <span key={index}>{ingredient}<br/></span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {(response.veganInfo.include) && (
                            <div className="ingredients-section">
                                <div className="safety-icon-wrapper">
                                    <img src={getImage(veganSafe)} alt="Icon for allergens info"
                                         style={{maxWidth: "30px"}}/>
                                </div>
                                <div className="ingredients-text">
                                    <span>{getTextContentVegan(veganSafe)} </span>
                                    {response.veganInfo.problematicIngredients && (
                                        <div style={{marginTop: "3px"}}>
                                            {response.veganInfo.problematicIngredients.slice(0, 4).map((ingredient, index) => (
                                                <span key={index}>{ingredient}<br/></span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {error && (
                <div className="check-error-box">
                    <p>{error} :(</p><br/><br/><br/>
                    <p>Please help us improve by providing product information through the form&nbsp;
                        <span
                            className="add-product-bttn"
                            onClick={() => navigate("/product/add", {state: {barcode: barcode}})}
                        >
                            <u>
                                here
                            </u>
                        </span>
                    </p>
                </div>
            )}
        </div>
    )
}

export default CheckResult;
