<?php

namespace App\Controller\Generales;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/bcmx/generales/categorias/")
 */
class CategoriasController extends AbstractController
{

    private $templateBase = 'generales/categorias/';

    /**
     * @Route("index/", name="generales_categorias-index")
     */
    public function index(): Response
    {
        return $this->render($this->templateBase . 'index.html.twig', [
            'estasEn' => 'Categorías',
        ]);
    }
}
