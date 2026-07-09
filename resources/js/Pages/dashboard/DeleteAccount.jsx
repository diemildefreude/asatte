import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import DashboardLayout from '@/Pages/dashboard/DashboardLayout';
import CheckboxField from '@/Components/common/CheckboxField';

export default function DeleteAccount() {
    const { app_name } = usePage().props;
    const [agreeVal, setAgreeVal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onAgreeChange = (e) => {
        setAgreeVal(e.target.checked);
    };

    const handleDelete = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        router.post('/dashboard/delete-account', {}, {
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <DashboardLayout currentTab="profile" headerText="delete account" headerHasMargin={false}>
            <Head title="Delete Account" />
            <div className="article-text no-bottom-padding limited-width">
                <p> {app_name} will keep your data for 30 days and give you the option to reverse your decision from the dashboard. </p>
                <p> Your profile and posts will all be immediately hidden from other users. </p>
                <p> If no action is taken, your member information and all posts & uploaded media will be completely removed from our database after 30 days.</p>
            </div>           
            <form onSubmit={handleDelete}>
                <div className="flex-column">
                        <CheckboxField 
                            name="account-deletion-agree"
                            label="Yes, I want to permanently delete my account"
                            value={agreeVal}
                            onChange={onAgreeChange}
                            disabled={isSubmitting}
                            classes="centered-content no-margin auto-width wrappable"
                        />
                    <div className='flex-row'>
                        <button type="submit" className="red-button" disabled={!agreeVal || isSubmitting}>
                            delete account
                        </button>
                        <Link href="/dashboard" className="link-button">cancel</Link>
                    </div>
                </div>
            </form>
        </DashboardLayout>
    );
}
