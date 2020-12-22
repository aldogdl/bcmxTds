<?php

namespace App\Controller\Generales;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

use App\Entity\Franquicias;
use App\Form\FranquiciasType;

/**
 * @Route("/generales/franquicias/")
 */
class FranquiciasController extends AbstractController
{
    private $templateBase = 'generales/franquicias/';

    /**
     * @Route("index/", name="generales_franquicias-index")
     */
    public function index(): Response
    {
        $obj = new Franquicias();
        $frm = $this->createForm(FranquiciasType::class, $obj);

        return $this->render($this->templateBase . 'index.html.twig', [
            'estasEn' => 'Franquicias',
            'frm' => $frm->createView()
        ]);
    }
}
