import EditButton from "./EditButton";

function ProfileItem({name, value, onChange=null, isSubmitting=false, 
    isLink=false, isEditingThisField=false, onEditClick})
{
    const isUpdatable = onChange ? true : false;

    return (
        <div className="inline-form-field">
            <label htmlFor={name} className="field-name">{name}:</label> 
            {
                isUpdatable ? (
                    <input 
                        id={name} 
                        defaultValue={value} 
                        disabled={!isEditingThisField || isSubmitting}
                        onChange={onChange}
                    />
                ):
                (
                    isLink ?
                    (
                        <a 
                            href={value}
                            target="_blank"
                        >
                            {value}
                        </a>
                    ):
                    (
                        <span>{value}</span>
                    )
                )
            }
            <EditButton onClick={(e) => { e.preventDefault(); onEditClick()}} 
                disabled={!isUpdatable || isEditingThisField || isSubmitting} 
                className={isUpdatable ? "" : "invisible"}
            />             
        </div>
    );
}

export default ProfileItem;