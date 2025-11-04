<?php
namespace App\Enums;
enum FetchOrder : string
{
    case Ascending = 'ascending';
    case Descending = 'descending';
    case Random = 'random'; 
}