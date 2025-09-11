function CheckboxField({name, label, value, onChange, disabled})
{
    return (
    <div className="inline-form-field checkbox">
        <label htmlFor={name}>{label}</label>
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
