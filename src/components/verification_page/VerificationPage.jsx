import React, {useState} from 'react';
import './VerificationPage.css'
import {useLocation, useNavigate} from 'react-router-dom';
import {validateBarcode} from '../utils/ValidateBarcode';

const VerificationPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const {barcode: initialBarcode} = location.state || '';
    const [barcode, setBarcode] = useState(initialBarcode);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        setBarcode(e.target.value);
        setError('');
    };

    const handleYes = async () => {
        if (barcode.length !== 13 || !/^\d+$/.test(barcode)) {
            setError("Invalid format");
            return;
        }
        const isValid = await validateBarcode(barcode);
        if(!isValid) {
            setError("Invalid barcode");
            return;
        }
        navigate('/check-result', {state: {barcode: barcode}});
    };

    return (
        <div className="check-result-container">
            <div className="result-box" style={{borderColor: "#157023"}}>
                <div className="verification-contents">
                    <p className="verification-question">Is this the correct barcode?</p>
                    <div className="barcode-input-error">
                        <div>
                            <input
                                type="text"
                                name="barcode"
                                value={barcode}
                                className="barcode-input"
                                onChange={handleInputChange}
                            />

                            <p className="barcode-format-error">{error}</p>
                        </div>
                        <div style={{paddingBottom:"2em"}}>
                            <p style={{fontSize: "1.3rem", color: "#E20101", cursor: "pointer", marginBottom:"1em"}}
                               onClick={() => navigate('/scan')}
                            >
                                &lt; No, I want to scan again
                            </p>
                            <p style={{fontSize: "1.3rem", color: "#157023", cursor: "pointer"}}
                               onClick={handleYes}
                            >
                                Yes, let me see the result &gt;
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerificationPage;
