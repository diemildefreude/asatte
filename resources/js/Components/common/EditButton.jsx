function EditButton({onClick, disabled=false, className=""})
{
    return (
    <button onClick={onClick}
        disabled={disabled}
        className={className + " edit-button"}
        type="button"
        title="edit"
    >
        <i className="fa-solid fa-pen-to-square"/>
    </button>
    )
}

export default EditButton;