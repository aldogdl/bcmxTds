<?php

namespace App\Http;

use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

class SecurityHttp
{

    private $http;
    private $bcmxPath;

    function __construct(HttpClientInterface $client, ParameterBagInterface $params)
    {
        $this->http = $client;
        $this->bcmxPath = ($params->get('tipoEnv') == 'dev') ? 'http://localhost:8000' : 'https://dbzm.info';
    }

    /**
     * @see SecurityController::security
    */
    public function getToken(array $dataSend): String
    {
        $response = $this->http->request(
            'POST',
            $this->bcmxPath . '/login_admin/login_check',
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
            $this->bcmxPath . '/apis/zmpanel/panel/get-data-user/',
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
