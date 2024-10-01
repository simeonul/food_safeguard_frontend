import React, {useEffect, useState} from 'react';
import './ProductPage.css'
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import remove from "../../images/no.png";
import add_ingredient from "../../images/add_ingredient_btn.png";
import {validateBarcode} from '../utils/ValidateBarcode';

const ProductPage = () => {
    const {mode} = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const initialValues = {
        barcode: "",
        productName: null,
        brand: null
    };
    const jwt = sessionStorage.getItem('jwt');
    const [searchText, setSearchText] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [formValues, setFormValues] = useState(initialValues);
    const [addError, setAddError] = useState('');
    const [searchBarcode, setSearchBarcode] = useState('');
    const [searchError, setSearchError] = useState({text: '', color: '#CE6464'});

    const getPageTitle = () => {
        switch (mode) {
            case 'add':
                return 'Add a new product';
            case 'edit':
                return 'Edit product info';
            case 'view':
                return 'Product info';
            default:
                return 'Product info';
        }
    };

    useEffect(() => {
        if (mode === 'edit' && sessionStorage.getItem('authority') === 'CLIENT') {
            navigate("/");
        }
        if (mode !== 'add' && mode !== 'edit' && mode !== 'view') {
            navigate("/");
        }
        if (mode === 'add' && location.state && location.state.barcode) {
            setFormValues(prev => ({...prev, barcode: location.state.barcode}));
        }
        if (location.state && location.state.barcode) {
            setSearchBarcode(location.state.barcode);
        }
    }, [mode, location.state]);


    const handleTextFieldsChange = (e) => {
        const {name, value} = e.target;
        setFormValues({...formValues, [name]: value});
        setAddError('');
    }

    const fetchSuggestions = async (text) => {
        if (text && text.length >= 1) {
            try {
                const response = await fetch(`http://localhost:8080/ingredients/${text}`, {
                    headers: {
                        'Authorization': jwt
                    }
                });
                if (response.ok) {
                    const json = await response.json();
                    if (ingredients) {
                        const ingredientsIds = new Set(ingredients.map(ingredient => ingredient.id));
                        const filteredSuggestions = json.filter(suggestion => !ingredientsIds.has(suggestion.id));
                        setSuggestions(filteredSuggestions);
                    } else {
                        setSuggestions(json);
                    }
                } else {
                    setSuggestions([]);
                }
            } catch (error) {
                setSuggestions([]);
            }
        } else {
            setSuggestions([]);
        }
    };

    const handleAddIngredientChange = (text) => {
        setSearchText(text);
        fetchSuggestions(text);
        setAddError('');
    }

    const clearAll = () => {
        setSearchText('');
        setSuggestions([]);
        setAddError('');
        setSearchError({text: '', color: '#CE6464'});
    };

    const handleAddIngredient = (suggestion) => {
        setIngredients([...ingredients, suggestion]);
        clearAll();
    }

    const handleRemoveIngredient = (id) => {
        const newIngredients = ingredients.filter(ingredient => ingredient.id !== id);
        setIngredients(newIngredients);
    };

    const handleSearch = async () => {
        if (searchBarcode.length !== 13 || !/^\d+$/.test(searchBarcode)) {
            setSearchError({text: 'Invalid barcode format!', color: '#CE6464'});
            setSuggestions([]);
            setIngredients([]);
            setFormValues(initialValues);
            return;
        }

        const isValid = await validateBarcode(searchBarcode);
        if(!isValid) {
            setSearchError({text: 'Invalid barcode!', color: '#CE6464'});
            return;
        }
        try {
            const response = await fetch(`http://localhost:8080/search/${searchBarcode}`, {
                headers: {
                    'Authorization': jwt
                }
            });
            if (response.ok) {
                const productData = await response.json();
                const {barcode, productName, brand, ingredients} = productData;
                setFormValues(prev => ({
                    ...prev,
                    barcode: barcode,
                    productName: productName,
                    brand: brand
                }));
                setIngredients(ingredients);
                setSearchError({text: '', color: '#CE6464'});
                setAddError('');
            } else {
                setSearchError({text: 'Product not found!', color: '#CE6464'});
                setSearchText('');
                setSuggestions([]);
                setIngredients([]);
                setFormValues(initialValues);
            }
        } catch (error) {
        }
    };

    const handleSubmit = async () => {
        if (formValues.barcode.length !== 13 || !/^\d+$/.test(formValues.barcode)) {
            setAddError("Invalid barcode format");
            return;
        }
        const isValid = await validateBarcode(formValues.barcode);
        if(!isValid) {
            setAddError("Invalid barcode");
            return;
        }
        if (ingredients.length === 0) {
            setAddError("Please add at least one ingredient");
            return;
        }
        if (!addError) {
            try {
                const method = mode === 'add' ? 'POST' : 'PUT';
                const url = mode === 'add' ? 'http://localhost:8080/search' : 'http://localhost:8080/products';
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': jwt
                    },
                    body: JSON.stringify({
                        ...formValues,
                        ingredients: ingredients
                    })
                });
                if (response.ok) {
                    if (mode === 'add') {
                        window.location.reload();
                    }
                    if (mode === 'edit') {
                        clearAll();
                        setSuggestions([]);
                        setIngredients([]);
                        setFormValues(initialValues);
                        setSearchError({text: 'Product submitted successfully!', color: '#157023'});
                        setSearchText('');
                    }
                } else if (response.status === 409) {
                    setAddError('Product already exists!');
                } else {
                    setAddError('An error occurred while submitting');
                }
            } catch (error) {
                setAddError('An unexpected error occurred');
            }
        }
    }

    const handleSearchTextChange = (text) => {
        setSearchBarcode(text);
        setSearchError({text: '', color: '#157023'});
    }

    return (
        <div className="add-product-container">
            {mode !== 'add' && (
                <div className="product-search-container">
                    <p className="product-search-title">Input product barcode</p>
                    <p className="search-product-error" style={{color: searchError.color}}>{searchError.text}</p>
                    <div className="product-search-fields">
                        <input
                            type="text"
                            name="barcode"
                            className="add-product-input"
                            style={{width: "60%"}}
                            value={searchBarcode}
                            onChange={(e) => handleSearchTextChange(e.target.value)}
                        />
                        <span
                            className="search-product-button"
                            onClick={() => handleSearch()}
                        >Search</span>
                        <div className="or-text" style={{margin: "1em 0"}}>or</div>
                        <p
                            className="scan-for-barcode"
                            onClick={() => {
                                navigate('/scan', {state: {mode}})
                            }}
                        >
                            Scan for barcode
                        </p>
                    </div>
                </div>
            )}

            {((ingredients && ingredients.length > 0 && mode !== 'add') || (mode === 'add')) && (
                <div className="addition-fields-section">
                    <div className="add-ingredients-section">
                        <p className="add-product-title">{getPageTitle()}</p>
                        <p className="add-product-error">{addError}</p>
                        <input
                            type="text"
                            name="barcode"
                            placeholder="Barcode"
                            className="add-product-input"
                            value={formValues.barcode || ''}
                            onChange={(e) => handleTextFieldsChange(e)}
                            disabled={mode === 'view' || mode === 'edit'}
                        />
                        <input
                            type="text"
                            name="productName"
                            placeholder="Product Name"
                            className="add-product-input"
                            value={formValues.productName || null}
                            onChange={(e) => handleTextFieldsChange(e)}
                            disabled={mode === 'view'}
                        />
                        <input
                            type="text"
                            name="brand"
                            placeholder="Brand"
                            className="add-product-input"
                            value={formValues.brand || null}
                            onChange={(e) => handleTextFieldsChange(e)}
                            disabled={mode === 'view'}
                        />
                        <p className="ingredients-label">Ingredients</p>
                        {mode !== 'view' && (
                            <div className="allergen-item">
                                <input
                                    type="text"
                                    name="ingredientText"
                                    placeholder="Add an ingredient"
                                    value={searchText}
                                    onChange={e => handleAddIngredientChange(e.target.value)}
                                ></input>
                                <img
                                    src={add_ingredient}
                                    alt="Button for adding an allergen"
                                    className="remove-allergen-bttn"
                                />
                            </div>
                        )}
                        {suggestions.length >= 1 && (
                            <div className="suggestions-list">
                                {suggestions.map(suggestion => (
                                    <div
                                        key={suggestion.id}
                                        className="suggestion-item"
                                        onClick={() => handleAddIngredient(suggestion)}
                                    >
                                        {suggestion.text}
                                    </div>
                                ))}
                            </div>
                        )}
                        {ingredients && (
                            ingredients.map(ingredient => (
                                <div key={ingredient.id} className="allergen-item">
                                    <p>{ingredient.text}</p>
                                    {mode !== 'view' && (
                                        <img
                                            src={remove}
                                            alt="Button for removing allergen"
                                            className="remove-allergen-bttn"
                                            onClick={() => handleRemoveIngredient(ingredient.id)}
                                        />
                                    )}
                                </div>
                            ))
                        )}
                        {mode !== 'view' && (
                            <p
                                className="submit-product-button"
                                onClick={() => handleSubmit()}
                            >Submit</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductPage;
