import { useRef, useEffect } from "react";
import EditButton from "./EditButton";

function ProfileItem({name, value, onChange=null, disabled=false, 
    isLink=false, isEditingThisField=false, onEditClick, isPublic=false})
{
    const isUpdatable = onChange ? true : false;
    const inputRef = useRef(null);

    useEffect(() => 
    {
        if (isEditingThisField && inputRef.current) 
        {
            inputRef.current.focus();
        }
    }, [isEditingThisField]);

    return (
        <div className="inline-form-field">            
            {
                isUpdatable ? (<>
                    <label htmlFor={name} className="field-name">{name}:</label>
                    <input 
                        id={name} 
                        defaultValue={value} 
                        disabled={!isEditingThisField || disabled}
                        onChange={onChange}
                        ref={inputRef}
                    />
                </>):
                (<>
                    <label htmlFor={name} className="field-name">{name}:</label>
                    {isLink ?
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
                    )}
                </>)
            }
            {!isPublic && (    
                <EditButton onClick={(e) => { e.preventDefault(); onEditClick();}} 
                    disabled={!isUpdatable || isEditingThisField || disabled} 
                    className={isUpdatable ? "" : "invisible"}
                />  
            )}           
        </div>
    );
}

export default ProfileItem;