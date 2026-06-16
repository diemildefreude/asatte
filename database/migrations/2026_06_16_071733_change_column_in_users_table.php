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
            if (Schema::hasColumn('posts', 'post_url')) 
            {
                $table->dropColumn("post_url");
            }            
            if (Schema::hasColumn('posts', 'gallery_alts')) 
            {
                $table->dropColumn("gallery_alts");
            }            
            if (Schema::hasColumn('posts', 'statement_image_urls')) 
            {
                $table->dropColumn("statement_image_urls");
            }
        });

        Schema::table('posts', function (Blueprint $table) 
        {
            $table->string("post_url")->after("user_id");
            $table->json("gallery_alts")->nullable()->after("gallery_image_urls");
            $table->json("statement_image_urls")->nullable()->after("statement");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) 
        {
            if (Schema::hasColumn('posts', 'post_url')) 
            {
                $table->dropColumn("post_url");
            }            
            if (Schema::hasColumn('posts', 'gallery_alts')) 
            {
                $table->dropColumn("gallery_alts");
            }            
            if (Schema::hasColumn('posts', 'statement_image_urls')) 
            {
                $table->dropColumn("statement_image_urls");
            }
        });

        Schema::table('posts', function (Blueprint $table) 
        {
            $table->string("post_url")->nullable()->after("user_id");
            $table->json("gallery_alts")->after("gallery_image_urls");
            $table->json("statement_image_urls")->after("statement");
        });
    }
};
