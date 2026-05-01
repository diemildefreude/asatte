<?php
namespace App\Enums;
enum NotificationType : string
{
    case Comment = 'comment'; //new comment on user's posts
    case Reply = 'reply'; //reply to user's comment
    case Follower = 'follower'; //new follower
    case Unhidden = 'unhidden'; // previously admin-hidden post has been unhidden
}