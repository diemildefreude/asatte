import { Link, router, usePage } from '@inertiajs/react';

function DashboardTab({iconClasses, tabName, currentTab, targetPath, noticeLight=null})
{
    let tabClasses = "dashboard-tab link-button";
    if(tabName === 'activity' || tabName === 'mail')
    {
        tabClasses += ` ${tabName}`
    }
    const isSelected = tabName === currentTab;
    if(isSelected)
    {
        tabClasses += " selected";
    }
    return (
        <Link className={tabClasses}
            to={targetPath}
        >
            <i className={iconClasses}>
            {
                (tabName === 'activity' || tabName === 'mail') && (
                    <div className="notice-light">
                    </div>
                )
            }
            </i>
            <p>{tabName}</p>
        </Link>
    )
}

export default DashboardTab;