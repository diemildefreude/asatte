import { Link } from "react-router-dom";

function DashboardTab({iconClasses, tabName, currentTab, targetPath})
{
    let tabClasses = "dashboard-tab link-button";
    const isSelected = tabName === currentTab;
    if(isSelected)
    {
        tabClasses += " selected";
    }
    return (
        <Link className={tabClasses}
            to={targetPath}
        >
            <i className={iconClasses}></i>
            <p>{tabName}</p>
        </Link>
    )
}

export default DashboardTab;