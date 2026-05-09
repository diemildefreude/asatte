function CheckboxField({name, label, value, onChange, disabled, classes})
{
    const classNames = "inline-form-field checkbox " + classes;
    return (
    <div className={classNames}>
        <label 
            htmlFor={name}
            className="main-label"
        >
            {label}
        </label>
        <input
            type="checkbox"
            name={name}
            id={name}
            onChange={onChange}
            disabled={disabled}
            checked={!!value} // force boolean
        />
    </div>
    );
}

export default CheckboxField;
