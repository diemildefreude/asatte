import { useRef, useEffect } from "react";
import EditButton from "./EditButton";
import { Link } from '@inertiajs/react';

function ProfileItem({name, value, onChange=null, disabled=false, 
    isLink=false, isEditingThisField=false, onEditClick, isPublic=false,
    isArray=false, maxArrayLength=3, onAddArrayItem=null})
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

    const renderInput = (val, idx) => (
        <input 
            id={idx === 0 ? name : `${name}_${idx}`} 
            defaultValue={val} 
            disabled={!isEditingThisField || disabled}
            onChange={(e) => onChange(e, idx)}
            ref={idx === 0 ? inputRef : null}
        />
    );

    const renderValue = (val) => (
        isLink ?
        (
            <a 
                href={val}
                target="_blank"
            >
                {val}
            </a>
        ):
        (
            <span>{val}</span>
        )
    );

    if (isArray) {
        const values = Array.isArray(value) ? value : [];
        // If there are no values, we at least render one empty input or label when not public
        const displayValues = (values.length === 0 && !isPublic) ? [''] : values;
        
        const labelText = displayValues.length === 1 ? 'website' : 'websites';
        const nameToUse = name === 'website' || name === 'websites' ? labelText : name;

        return (
            <div className="profile-item-array">
                {displayValues.map((val, idx) => (
                    <div className="inline-form-field" key={idx}>
                        {idx === 0 ? (
                            <label htmlFor={name} className="field-name">{nameToUse}:</label>
                        ) : (
                            <label className="field-name invisible" htmlFor={`${name}_${idx}`}>{nameToUse}:</label> // Empty space for alignment
                        )}
                        
                        {isUpdatable ? renderInput(val, idx) : renderValue(val)}
                        
                        {idx === 0 && !isPublic && (
                            <EditButton onClick={(e) => { e.preventDefault(); onEditClick();}} 
                                disabled={!isUpdatable || isEditingThisField || disabled} 
                                className={isUpdatable ? "" : "hidden"}
                            />
                        )}
                    </div>
                ))}
                
                {isEditingThisField && values.length < maxArrayLength && (
                    <div className="inline-form-field right-aligned">
                        <label className="field-name hidden">{nameToUse}:</label>
                        <div>
                            <button type="button" onClick={(e) => { e.preventDefault(); if(onAddArrayItem) onAddArrayItem(); }} 
                                className="plus-button small link-button"
                            >                    
                                +
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

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
                    className={isUpdatable ? "" : "hidden"}
                />  
            )}           
        </div>
    );
}

export default ProfileItem;