<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class MelonlandAuthService
{
    protected string $authApiUrl = 'https://forum.melonland.net/mAuth.php';
    protected string $cookieName = 'melonland_auth_client_key';

    /**
     * Get or create the client key for Melonland auth
     * 
     * @return string
     */
    protected function getClientKey(): string
    {
        $clientKey = Cookie::get($this->cookieName);

        if (!$clientKey) {
            $clientKey = bin2hex(random_bytes(32));
            // Queue the cookie to be sent with the next response
            // Expires in 10 years (5,256,000 minutes)
            Cookie::queue(Cookie::make($this->cookieName, $clientKey, 5256000, '/', null, request()->secure(), true, false, 'Lax'));
        }

        return $clientKey;
    }

    /**
     * Request member data from Melonland Passport
     * 
     * @param string $returnPath The URL path Melonland should redirect back to
     * @param array $extraData Extra fields to request (e.g. ['email'])
     * @return object|null Returns member data object or null on failure
     */
    public function getMemberInfo(string $returnPath, array $extraData = []): ?object
    {
        $clientKey = $this->getClientKey();
        $domain = request()->getHttpHost();

        $cacheKey = 'melonland_auth_' . hash('sha256', $clientKey . implode(',', $extraData));
        if (Cache::has($cacheKey)) 
        {
            return Cache::get($cacheKey);
        }

        $postData = [
            'client_key' => $clientKey,
            'domain' => $domain,
            'return_path' => $returnPath,
        ];

        if (!empty($extraData)) 
        {
            $postData['extra_data'] = implode(',', $extraData);
        }

        try 
        {
            $response = Http::asForm()
                ->timeout(5)
                ->post($this->authApiUrl . '?mode=external', $postData);

            if ($response->successful()) 
            {
                $data = json_decode($response->body());
                $memberData = $this->processMemberData($data);
                
                // Melonland API consumes the passport on read, so we must cache successful authentications
                if ($memberData->authenticated) 
                {
                    Cache::put($cacheKey, $memberData, now()->addMinutes(1));
                }
                
                return $memberData;
            }
        } 
        catch (\Exception $e) 
        {
            \Illuminate\Support\Facades\Log::error('Melonland API Error: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Process the raw response from Melonland
     */
    protected function processMemberData($rawMemberData): object
    {
        if (!$rawMemberData) 
        {
            return (object) [
                'authenticated' => false,
                'connect_url'   => null,
                'reason'        => 'server_error',
            ];
        }

        if (!$rawMemberData->authenticated) 
        {
            return (object) [
                'authenticated' => false,
                'connect_url'   => $rawMemberData->connect_url ?? null,
                'reason'        => $rawMemberData->reason ?? 'unknown',
            ];
        }

        if (empty($rawMemberData->member)) 
        {
            return (object) [
                'authenticated' => false,
                'connect_url'   => null,
                'reason'        => 'server_error',
            ];
        }

        $result = ['authenticated' => true];
        foreach ($rawMemberData->member as $row => $value) 
        {
            $result[$row] = $value;
        }

        return (object) $result;
    }
}
