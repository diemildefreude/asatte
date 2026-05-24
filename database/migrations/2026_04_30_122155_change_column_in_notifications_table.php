<?php

use App\Enums\NotificationType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('notifications', function (Blueprint $table) 
        {
            $table->enum("type", [NotificationType::Comment->value, 
                NotificationType::Reply->value, 
                NotificationType::Follower->value,
                NotificationType::Unhidden->value])->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) 
        {
            $table->enum("type", [NotificationType::Comment->value, 
                NotificationType::Reply->value, 
                NotificationType::Follower->value])->change();
        });
    }
};

