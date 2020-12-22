<?php

namespace App\Controller\Tds;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/tds/gestion/")
 */
class GestionTdsController extends AbstractController
{
    /**
     * @Route("index/", name="tds-index")
     */
    public function index(): Response
    {
        return $this->render('gestion_tds/index.html.twig', [
          'estasEn' => 'Tarjetas Digitales'
        ]);
    }
}
