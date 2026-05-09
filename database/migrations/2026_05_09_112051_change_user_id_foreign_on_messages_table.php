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
        Schema::table('messages', function (Blueprint $table) 
        {
            // 1. Drop the existing foreign key
            // Laravel naming convention is usually messages_user_id_foreign
            $table->dropForeign(['sender_id']);

            // 2. Re-add the constraint with new behavior
            // nullOnDelete() requires the user_id column to be nullable
            $table->foreign('sender_id')
                ->references('id')
                ->on('users')
                ->nullOnDelete(); 
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropForeign(['sender_id']);
            $table->foreign('sender_id')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();
        });
    }
};
