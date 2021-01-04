<?php

namespace App\Controller\Admin;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/bcmx/admin/localidades/")
 */
class LocalidadesController extends AbstractController
{

    private $templateBase = 'admin/localidades/';

    /**
     * @Route("index/", name="admin_localidades-index")
     */
    public function index(): Response
    {
        return $this->render($this->templateBase . 'index.html.twig', [
          'estasEn' => 'Localidades',
        ]);
    }
}
