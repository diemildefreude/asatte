<?php
namespace App\Enums;
enum LoginType : string
{
    case Email = 'email';
    case Github = 'github';
    case Google = 'google';
}