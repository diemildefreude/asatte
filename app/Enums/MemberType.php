<?php
namespace App\Enums;
enum MemberType : string
{
    case Webmaster = 'web_master';
    case Admin = 'admin';
    case Pro = 'pro';
    case Standard = 'standard';
}