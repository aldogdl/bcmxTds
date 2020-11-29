<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

use App\Services\SeguridadService;

/**
 * @Route("/bcmx/cpanel/")
 */
class IndexController extends AbstractController
{
    /**
     * @Route("index", name="bcmx_cpanel-index")
     */
    public function index(SeguridadService $session): Response
    {   
        $tokenServer = $session->getTokenInSession();
        return $this->render('index/index.html.twig', [
            'tokenServer' => $tokenServer,
        ]);
    }
}
