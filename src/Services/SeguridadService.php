<?php

namespace App\Services;

use Symfony\Component\HttpFoundation\Session\SessionInterface;
use App\Http\SecurityHttp;

class SeguridadService {

    private $session;
    private $http;

    /** */
    public function __construct(SessionInterface $session, SecurityHttp $httpSec)
    {
       $this->session = $session;
       $this->http = $httpSec;
    }

    /**
     * @see SecurityController::security
    */
    public function setTokenInSession(string $token)
    {
        $this->session->set('tokenServer', $token);
    }

    /**
     * @see SecurityController::security
     */
    public function getAndSetDataUser(string $username, string $token): bool
    {
        $token = $this->getTokenInSession();
        $dataUser = $this->http->getDataUser($username, $token);
        if($dataUser) {
            if(array_key_exists('u_roles', $dataUser)){
                $this->session->set('dataUser', $dataUser);
                return true;
            }
        }
        return false;
    }

    /**
     * @see IndexController::index
    */
    public function getTokenInSession(): string
    {
        return $this->session->get('tokenServer');
    }

    /**
     * 
    */
    public function hasToken(): bool
    {
        $token = $this->getTokenInSession();
        return (strlen($token) > 20) ? true : false;
    }
}