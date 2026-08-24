import './Form.css';

function FormField({ classes='', id, label, placeholder, value="", 
    onChange, onBlur, disabled, min, max, type = "text", onValidate, 
    isTextArea=false, sideText="", error="", onErrorUpdate = () => {} }) 
{
    let fieldClasses = 'form-field ';
    fieldClasses = isTextArea ? fieldClasses + "text-area " : fieldClasses;
    fieldClasses += classes;

    let labelClasses = isTextArea ? 'main-label centered-content no-margin' : 'main-label';

    // Internal handler that calls both the parent's onChange and the validation function
    const handleInternalChange = (e) => 
    {
        const inputValue = e.target.value.trimEnd();
        onChange(e); // This updates the parent's value state

        if (onValidate) 
        {
            onValidate(inputValue, (msg) => onErrorUpdate(id, msg));
        } else {
            onErrorUpdate(id, '');
        }
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
            onBlur={onBlur}
            disabled={disabled}
            placeholder={placeholder}
        />
        ):( sideText ? (
            <div className='side-text-and-input-container'>
                <span>{sideText}</span>
                <input type={type} 
                    placeholder={placeholder}
                    name={id}
                    value={value}
                    min={min}
                    max={max}
                    id={id}
                    onChange={handleInternalChange}
                    onBlur={onBlur}
                    disabled={disabled}
                />
            </div>
            ):(
            <input type={type} 
                placeholder={placeholder}
                name={id}
                value={value}
                min={min}
                max={max}
                id={id}
                onChange={handleInternalChange}
                onBlur={onBlur}
                disabled={disabled}
            />)
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