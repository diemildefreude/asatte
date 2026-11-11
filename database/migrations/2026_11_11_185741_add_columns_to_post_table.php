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
        Schema::table('posts', function (Blueprint $table) 
        {
            $table->boolean('post_iframe_enabled')->default(true)->after('website');
            $table->boolean('popout_iframe_enabled')->default(false)->after('post_iframe_enabled');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) 
        {
            $table->dropColumn([
            'post_iframe_enabled',
            'popout_iframe_enabled']);
        });
    }
};
