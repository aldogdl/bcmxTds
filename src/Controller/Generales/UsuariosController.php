<?php

namespace App\Controller\Generales;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/bcmx/generales/usuarios/")
 */
class UsuariosController extends AbstractController
{
    private $templateBase = 'generales/usuarios/';

    /**
     * @Route("index/", name="generales_usuarios-index")
     */
    public function index(): Response
    {
        return $this->render($this->templateBase . 'index.html.twig', [
            'estasEn' => 'Usuarios',
        ]);
    }
}
