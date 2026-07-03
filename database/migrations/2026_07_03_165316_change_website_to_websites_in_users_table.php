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
        // 1. Add the new JSON column
        Schema::table('users', function (Blueprint $table) {
            $table->json('websites')->nullable()->after('website');
        });

        // 2. Migrate existing data
        \DB::table('users')->whereNotNull('website')->orderBy('id')->chunk(100, function ($users) {
            foreach ($users as $user) {
                // If it's empty string, we skip converting to array, or we can just filter it out
                if (trim($user->website) !== '') {
                    \DB::table('users')
                        ->where('id', $user->id)
                        ->update([
                            'websites' => json_encode([$user->website])
                        ]);
                }
            }
        });

        // 3. Drop the old column
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('website');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 1. Add the old string column back
        Schema::table('users', function (Blueprint $table) {
            $table->string('website')->nullable()->after('websites');
        });

        // 2. Migrate existing data back (take the first item of the array)
        \DB::table('users')->whereNotNull('websites')->orderBy('id')->chunk(100, function ($users) {
            foreach ($users as $user) {
                $websites = json_decode($user->websites, true);
                if (is_array($websites) && count($websites) > 0) {
                    \DB::table('users')
                        ->where('id', $user->id)
                        ->update([
                            'website' => $websites[0]
                        ]);
                }
            }
        });

        // 3. Drop the JSON column
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('websites');
        });
    }
};
