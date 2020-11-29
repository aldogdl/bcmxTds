<?php

namespace App\Http;

use Symfony\Contracts\HttpClient\HttpClientInterface;

class SecurityHttp
{

    private $http;

    function __construct(HttpClientInterface $client)
    {
        $this->http = $client;
    }

    /**
     * @see SecurityController::security
    */
    public function getToken(array $dataSend): String
    {
        $response = $this->http->request(
            'POST',
            'http://localhost:8000/login_admin/login_check',
            ['body' => $dataSend]
        );
        $statusCode = $response->getStatusCode();
        if($statusCode == 200){
            $content = $response->toArray();
            if(array_key_exists('token', $content)){
                return $content['token'];
            }
        }
        return 'err';
    }

    /** */
    public function getDataUser(string $username, string $token): Array
    {
        $response = $this->http->request(
            'POST',
            'http://localhost:8000/apis/zmpanel/panel/get-data-user/',
            [
                'headers' => [
                    'Authorization' => 'Bearer ' . $token
                ],
                'body' => [
                    'username' => $username
                ]
            ]
        );
        $statusCode = $response->getStatusCode();
        if($statusCode == 200){
            $content = $response->toArray();
            if(array_key_exists('u_roles', $content)){
                return [
                    'u_id' => $content['u_id'],
                    'u_username' => $content['u_username'],
                    'u_roles' => $content['u_roles'][0],
                ];
            }
        }
        return ['err'];
    }    
}

