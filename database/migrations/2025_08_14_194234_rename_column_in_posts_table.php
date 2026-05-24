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
        // Step 1: Remove the default value from the column
        Schema::table('posts', function (Blueprint $table) {
            $table->longText('gallery_image_alts')->default(null)->change();
        });

        // Step 2: Rename the column
        Schema::table('posts', function (Blueprint $table) {
            $table->renameColumn('gallery_image_alts', 'gallery_alts');
        });

        // Step 3: Re-add the default value to the renamed column
        Schema::table('posts', function (Blueprint $table) {
            $table->longText('gallery_alts')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Step 1 (Reverse): Remove the default value from the column
        Schema::table('posts', function (Blueprint $table) {
            $table->longText('gallery_alts')->default(null)->change();
        });

        // Step 2 (Reverse): Rename the column back to its original name
        Schema::table('posts', function (Blueprint $table) {
            $table->renameColumn('gallery_alts', 'gallery_image_alts');
        });

        // Step 3 (Reverse): Re-add the default value to the original column
        Schema::table('posts', function (Blueprint $table) {
            $table->longText('gallery_image_alts')->change();
        });
    }
};
