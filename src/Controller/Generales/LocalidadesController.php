<?php

namespace App\Controller\Generales;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/generales/localidades/")
 */
class LocalidadesController extends AbstractController
{

    private $templateBase = 'generales/localidades/';

    /**
     * @Route("index/", name="generales_localidades-index")
     */
    public function index(): Response
    {
        return $this->render($this->templateBase . 'index.html.twig', [
          'estasEn' => 'Localidades',
        ]);
    }
}
