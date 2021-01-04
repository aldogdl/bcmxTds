<?php

namespace App\Controller\Admin;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/bcmx/admin/usuarios/")
 */
class UsuariosController extends AbstractController
{
    private $templateBase = 'admin/usuarios/';

    /**
     * @Route("index/", name="admin_usuarios-index")
     */
    public function index(): Response
    {
        return $this->render($this->templateBase . 'index.html.twig', [
            'estasEn' => 'Usuarios',
        ]);
    }
}
