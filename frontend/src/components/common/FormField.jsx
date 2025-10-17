import { useState } from 'react';
import './LoginRegistration.css';

function FormField({ classes='', id, label, placeholder, value="", onChange, disabled, min, max, type = "text", onValidate }) 
{
    const [error, setError] = useState(''); // This is FormField's local error state

    let fieldClasses = classes;

    // Internal handler that calls both the parent's onChange and the validation function
    const handleInternalChange = (e) => 
    {
        const inputValue = e.target.value.trimEnd();
        onChange(e); // This updates the parent's value state
        setError('');

        if (onValidate) 
        {
            onValidate(inputValue, setError);
        }
        // ONLY update the parent's state IF the client-side validation passed
        
        
        // If !isValid, the parent's state for this field will not be updated.
        // The error will be displayed by this FormField component.
    };
    return (
        <>
            <div className={fieldClasses}>
            {
                label && (
                    <label 
                        htmlFor={id}
                        className='main-label'
                    >
                        {label}
                    </label>
                )
            }
                <input type={type} 
                    placeholder={placeholder}
                    name={id}
                    value={value}
                    min={min}
                    max={max}
                    id={id}
                    onChange={handleInternalChange}
                    disabled={disabled}
                />
            </div>
            
            {
                error && (
                <div className="error small">
                    {error}
                </div>
        )}
        </>
    );
}

export default FormField;