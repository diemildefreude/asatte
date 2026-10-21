<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('email_news')->default(true)->after('bio_image_urls');
            $table->boolean('email_dm')->default(true)->after('email_news');
            $table->boolean('email_comment')->default(true)->after('email_dm');
            $table->boolean('email_comment_reply')->default(true)->after('email_comment');
            $table->boolean('email_follower')->default(true)->after('email_comment_reply');
            $table->boolean('email_like')->default(true)->after('email_follower');
        });

        DB::table('users')->update([
            'email_news' => DB::raw('accepts_emails'),
            'email_dm' => DB::raw('accepts_emails'),
            'email_comment' => DB::raw('accepts_emails'),
            'email_comment_reply' => DB::raw('accepts_emails'),
            'email_follower' => DB::raw('accepts_emails'),
            'email_like' => DB::raw('accepts_emails'),
        ]);

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('accepts_emails');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('accepts_emails')->default(true);
        });

        DB::table('users')->update([
            'accepts_emails' => DB::raw('(email_news OR email_dm OR email_comment OR email_comment_reply OR email_follower OR email_like)'),
        ]);

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'email_news',
                'email_dm',
                'email_comment',
                'email_comment_reply',
                'email_follower',
                'email_like',
            ]);
        });
    }
};
