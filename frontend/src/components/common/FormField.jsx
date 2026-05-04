import { useState } from 'react';
import './Form.css';

function FormField({ classes='', id, label, placeholder, value="", 
    onChange, disabled, min, max, type = "text", onValidate, isTextArea=false }) 
{
    const [error, setError] = useState(''); // This is FormField's local error state

    let fieldClasses = 'form-field ';
    fieldClasses = isTextArea ? fieldClasses + "text-area " : fieldClasses;
    fieldClasses += classes;

    let labelClasses = isTextArea ? 'main-label centered-content no-margin' : 'main-label';

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
    <div className={fieldClasses}>
        <div className="label-input-container">
        {
        label && (
            <label 
                htmlFor={id}
                className={labelClasses}
            >
                {label}
            </label>
        )
    }
    {
        isTextArea ? (
        <textarea 
            name={id} 
            id={id}
            value={value}
            min={min}
            max={max}
            onChange={handleInternalChange}
            disabled={disabled}
            placeholder={placeholder}
        />
        ):(
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
        )
    }            
        </div>
    {
        error && (
        <div className="error small">
            {error}
        </div>
    )}                
    </div>
    );
}

export default FormField;