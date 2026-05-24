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
            $table->string('website')->nullable()->after('birthdate');
            $table->string('location')->nullable()->after('website');
            $table->json('bio')->nullable()->after('location');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            Schema::dropIfExists('website');
            Schema::dropIfExists('location');
            Schema::dropIfExists('bio');
        });
    }
};

