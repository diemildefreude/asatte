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
        // Check if the column exists before trying to rename it
        if (Schema::hasColumn('comments', 'comment')) {
            Schema::table('comments', function (Blueprint $table) {
                // Renames the database column 'comment' to 'content'
                $table->renameColumn('comment', 'content');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Check if the new column exists before trying to revert the rename
        if (Schema::hasColumn('comments', 'content')) {
            Schema::table('comments', function (Blueprint $table) {
                // Reverts the rename: 'content' back to 'comment'
                $table->renameColumn('content', 'comment');
            });
        }
    }
};

