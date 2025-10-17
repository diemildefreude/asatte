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
        Schema::create('post_user', function (Blueprint $table) 
        {
            $table->id();
            
            // Link to the posts table
            $table->foreignId('post_id')->constrained()->onDelete('cascade');
            
            // Link to the users table
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Ensure a user can only like a post once
            $table->unique(['post_id', 'user_id']); 
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('post_user');
    }
};
