export const validateBarcode = async (barcode) => {
    try {
        const response = await fetch(`http://localhost:5000/validate/${barcode}`);
        if (response.ok) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
};