<?php

use App\Enums\LoginType;
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
            $table->integer("birthdate")->after("is_pro");
            $table->enum("login_type", 
                [LoginType::Email->value, LoginType::Github->value, LoginType::Google->value])
                ->after("password");
            $table->integer("provider_id")->nullable()->after("login_type");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn("birthdate");
            $table->dropColumn("login_type");
            $table->dropColumn("provider_id");
        });
    }
};

