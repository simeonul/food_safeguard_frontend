import React, {useState, useEffect} from 'react';
import './PreferencesPage.css';
import remove from '../../images/no.png';
import add_ingredient from '../../images/add_ingredient_btn.png';

const PreferencesPage = () => {
    const email = sessionStorage.getItem('email');
    const jwt = sessionStorage.getItem('jwt');
    const [user, setUser] = useState(null);
    const [allergicIngredients, setAllergicIngredients] = useState([]);
    const [sliderValue, setSliderValue] = useState(0);
    const [rerender, setRerender] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [suggestions, setSuggestions] = useState([]);

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
                    setUser(userData);
                    setSliderValue(calculateSliderValue(userData));
                }
            } catch (err) {
            }
        };
        fetchUserData();
    }, [allergicIngredients, rerender]);

    const handleRemoveAllergen = async (allergenId) => {
        try {
            const response = await fetch(`http://localhost:8080/users/remove-allergen/${email}?allergicIngredientId=${allergenId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': jwt
                }
            });
            if (response.ok) {
                setAllergicIngredients(allergicIngredients.filter(ingredient => ingredient.id !== allergenId));
            }
        } catch (err) {
        }
    };

    const calculateSliderValue = (userData) => {
        if (userData && userData.vegetarian && !userData.vegan) {
            return 1;
        } else if (userData && userData.vegan) {
            return 2;
        } else {
            return 0;
        }
    };

    const handleChangeRestriction = async (restriction) => {
        try {
            const response = await fetch(`http://localhost:8080/users/change-restrictions/${email}/${restriction}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': jwt
                }
            });
            if (response.ok) {
                setRerender(!rerender);
            }
        } catch (err) {
        }
    };

    const fetchSuggestions = async (text) => {
        try {
            if (text && text.length >= 1) {
                const response = await fetch(`http://localhost:8080/ingredients/${text}`, {
                    headers: {
                        'Authorization': jwt
                    }
                });
                if (response.ok) {
                    const json = await response.json();
                    if (user && user.allergicIngredients) {
                        const allergicIds = new Set(user.allergicIngredients.map(ingredient => ingredient.id));
                        const filteredSuggestions = json.filter(suggestion => !allergicIds.has(suggestion.id));
                        setSuggestions(filteredSuggestions);
                    } else {
                        setSuggestions(json);
                    }
                } else {
                    setSuggestions([]);
                }
            } else {
                setSuggestions([]);
            }
        } catch (error) {
            setSuggestions([]);
        }
    };


    const handleAddItemChange = (text) => {
        setSearchText(text);
        fetchSuggestions(text);
    }

    const handleAddAllergen = async (allergenId) => {
        try {
            const response = await fetch(`http://localhost:8080/users/add-allergen/${email}?allergicIngredientId=${allergenId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': jwt
                }
            });
            if (response.ok) {
                setSearchText('');
                setSuggestions([]);
                setRerender(!rerender);
            }
        } catch (err) {
        }
    };


    return (
        <div className="preferences-container">
            <div className="sections-container">
                <div className="allergens-section">
                    <p className="preferences-titles">Allergens</p>
                    <div className="allergens">

                        <div className="allergen-item">
                            <input
                                type="text"
                                name="allergenText"
                                value={searchText}
                                onChange={e => handleAddItemChange(e.target.value)}
                                placeholder="add allergen..."
                            ></input>
                            <img
                                src={add_ingredient}
                                alt="Button for adding an allergen"
                                className="remove-allergen-bttn"
                            />
                        </div>
                        {suggestions.length >= 1 && (
                            <div className="suggestions-list">
                                {suggestions.map(suggestion => (
                                    <div
                                        key={suggestion.id}
                                        className="suggestion-item"
                                        onClick={() => handleAddAllergen(suggestion.id)}
                                    >
                                        {suggestion.text}
                                    </div>
                                ))}
                            </div>
                        )}
                        {user && user.allergicIngredients && (
                            user.allergicIngredients.map(ingredient => (
                                <div key={ingredient.id} className="allergen-item">
                                    <p>{ingredient.text}</p>
                                    <img
                                        src={remove}
                                        alt="Button for removing allergen"
                                        className="remove-allergen-bttn"
                                        onClick={() => handleRemoveAllergen(ingredient.id)}
                                    />
                                </div>
                            ))
                        )}
                    </div>
                </div>
                <div className="restrictions-section">
                    <p className="preferences-titles">Dietary restrictions</p>
                    <div className="slider-container">
                        <input
                            type="range"
                            min="0"
                            max="2"
                            step="1"
                            value={sliderValue}
                            className="slider"
                            onChange={(e) => setSliderValue(parseInt(e.target.value))}
                        />
                        <div className="labels">
                            <span>None</span>
                            <span>Vegetarian</span>
                            <span>Vegan</span>
                        </div>
                        <p
                            className="submit-restriction"
                            onClick={() => handleChangeRestriction(sliderValue)}
                        >Submit</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PreferencesPage;
