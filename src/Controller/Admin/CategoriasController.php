<?php

namespace App\Controller\Admin;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/bcmx/admin/categorias/")
 */
class CategoriasController extends AbstractController
{

    private $templateBase = 'admin/categorias/';

    /**
     * @Route("index/", name="admin_categorias-index")
     */
    public function index(): Response
    {
        return $this->render($this->templateBase . 'index.html.twig', [
            'estasEn' => 'Categorías',
        ]);
    }
}
