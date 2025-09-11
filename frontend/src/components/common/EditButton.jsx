function EditButton({onClick, disabled, className})
{
    return (
    <button onClick={onClick}
        disabled={disabled}
        className={className + " edit-button"}
    >
        <i className="fa-solid fa-pen-to-square"/>
    </button>
    )
}

export default EditButton;