import React, {useEffect, useState} from 'react';
import './IngredientPage.css'
import {useLocation, useNavigate, useParams} from 'react-router-dom';

const IngredientPage = () => {
    const {mode} = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const initialValues = {
        id: "",
        text: null,
        vegetarian: null,
        vegan: null
    };
    const jwt = sessionStorage.getItem('jwt');
    const [suggestions, setSuggestions] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [formValues, setFormValues] = useState(initialValues);
    const [addError, setAddError] = useState('');
    const [searchError, setSearchError] = useState({text: '', color: '#CE6464'});

    const getPageTitle = () => {
        switch (mode) {
            case 'add':
                return 'Add a new ingredient';
            case 'edit':
                return 'Edit ingredient info';
            case 'view':
                return 'Ingredient info';
            default:
                return 'Ingredient info';
        }
    };

    useEffect(() => {
        if (mode === 'edit' && sessionStorage.getItem('authority') === 'CLIENT') {
            navigate("/");
        }
        if (mode !== 'add' && mode !== 'edit' && mode !== 'view') {
            navigate("/");
        }
    }, [mode, location.state]);

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
                    setSuggestions(json);
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

    const handleSearchTextChange = (text) => {
        setSearchText(text);
        fetchSuggestions(text);
        setAddError('');
        setSearchError('');
    }

    const handleTextFieldsChange = (e) => {
        const {name, value} = e.target;
        setFormValues({...formValues, [name]: value});
        setAddError('');
    }

    const handleSliderChange = (event, type) => {
        const value = parseInt(event.target.value);
        if (type === 'vegetarian') {
            setFormValues({...formValues, vegetarian: value});
        } else if (type === 'vegan') {
            setFormValues({...formValues, vegan: value});
        }
    };

    const convertToSliderValue = (value) => {
        if (value === true) return 2;
        if (value === false) return 0;
        return 1;
    };

    const convertToBooleanValue = (value) => {
        if (value === 2) return true;
        if (value === 0) return false;
        return null;
    };

    const handleSuggestionClick = (suggestion) => {
        setFormValues({
            ...initialValues,
            id: suggestion.id,
            text: suggestion.text,
            vegetarian: convertToSliderValue(suggestion.vegetarian),
            vegan: convertToSliderValue(suggestion.vegan)
        });
    };

    const clearAll = () => {
        setSearchText('');
        setSuggestions([]);
        setAddError('');
        setSearchError({text: '', color: '#CE6464'});
    };

    const handleSubmit = async () => {
        if (!formValues.text || formValues.text.length < 2) {
            setAddError("Invalid format for the text!");
            return;
        }

        if (formValues.vegan === 2 && (formValues.vegetarian === 0 || formValues.vegetarian === 1)) {
            setAddError("If vegan is true, vegetarian cannot be false!");
            return;
        }

        if (mode !== 'add' && !/^[a-z0-9-]+$/.test(formValues.id)) {
            setAddError("Invalid format for the ID!");
            return;
        }

        if (!addError) {
            try {
                const method = mode === 'add' ? 'POST' : 'PUT';
                const url = mode === 'add' ? 'http://localhost:8080/ingredients' : `http://localhost:8080/ingredients/${formValues.id}`;
                const body = {
                    id: formValues.id,
                    text: formValues.text,
                    vegetarian: convertToBooleanValue(formValues.vegetarian),
                    vegan: convertToBooleanValue(formValues.vegan)
                };
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': jwt
                    },
                    body: JSON.stringify(body)
                });
                if (response.ok) {
                    if(mode === 'add') {
                        window.location.reload();
                    }
                    if(mode === 'edit'){
                        clearAll();
                        setFormValues(initialValues);
                        setSearchError({text: 'Ingredient submitted successfully!', color: '#157023'});
                        setSearchText('');
                    }
                } else if (response.status === 409) {
                    setAddError('Ingredient already exists');
                } else {
                    setAddError('An error occurred while submitting');
                }
            } catch (err) {
                setAddError('An unexpected error occurred');
            }
        }
    };

    return (
        <div className="add-product-container">
            {mode !== 'add' && (
                <div className="product-search-container">
                    <p className="product-search-title">Input ingredient identifier</p>
                    <p className="search-product-error" style={{color: searchError.color}}>{searchError.text}</p>
                    <div className="product-search-fields" style={{padding: "1em 0 0"}}>
                        <input
                            type="text"
                            name="search-id"
                            className="add-product-input"
                            style={{width: "100%"}}
                            value={searchText}
                            onChange={(e) => handleSearchTextChange(e.target.value)}
                        />
                    </div>
                    {suggestions.length >= 1 && (
                        <div className="suggestions-list">
                            {suggestions.map(suggestion => (
                                <div
                                    key={suggestion.id}
                                    className="suggestion-item"
                                    onClick={() => handleSuggestionClick(suggestion)}
                                >
                                    {suggestion.text}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            {((formValues.id && mode !== 'add') || (mode === 'add')) && (
                <div className="addition-fields-section">
                    <div className="add-ingredients-section">
                        <p className="add-product-title">{getPageTitle()}</p>
                        <p className="add-product-error">{addError}</p>
                        <input
                            type="text"
                            name="id"
                            placeholder="Identifier"
                            className="add-product-input"
                            value={formValues.id || ''}
                            onChange={(e) => handleTextFieldsChange(e)}
                            disabled={mode === 'view' || mode === 'edit'}
                        />
                        <input
                            type="text"
                            name="text"
                            placeholder="Text"
                            className="add-product-input"
                            value={formValues.text || null}
                            onChange={(e) => handleTextFieldsChange(e)}
                            disabled={mode === 'view'}
                        />
                        <div className="ingredients-slider-section">
                            <p className="slider-title">Is Vegetarian</p>
                            <div className="ingredients-slider-container">
                                <input
                                    name="vegetarian"
                                    type="range"
                                    min="0"
                                    max="2"
                                    step="1"
                                    value={formValues.vegetarian}
                                    className="slider"
                                    onChange={(e) => handleSliderChange(e, 'vegetarian')}
                                    disabled={mode === 'view'}
                                />
                                <div className="labels">
                                    <span>No</span>
                                    <span>Maybe</span>
                                    <span>Yes</span>
                                </div>
                            </div>
                            <p className="slider-title">Is Vegan</p>
                            <div className="ingredients-slider-container">
                                <input
                                    name="vegan"
                                    type="range"
                                    min="0"
                                    max="2"
                                    step="1"
                                    value={formValues.vegan}
                                    className="slider"
                                    onChange={(e) => handleSliderChange(e, 'vegan')}
                                    disabled={mode === 'view'}
                                />
                                <div className="labels">
                                    <span>No</span>
                                    <span>Maybe</span>
                                    <span>Yes</span>
                                </div>
                            </div>

                        </div>
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

export default IngredientPage;
