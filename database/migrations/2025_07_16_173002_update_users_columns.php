<?php

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
        Schema::table('users', function (Blueprint $table) 
        {
            $table->string('username')->nullable()->default(null)->change();
            $table->date('birthdate')->nullable()->default(null)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) 
        {
            $table->string('username')->nullable(false)->change();
            $table->date('birthdate')->nullable(false)->change();
        });
    }
};
