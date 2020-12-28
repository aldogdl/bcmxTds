<?php

namespace App\Controller\Generales;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/bcmx/generales/franquicias/")
 */
class FranquiciasController extends AbstractController
{
    private $templateBase = 'generales/franquicias/';

    /**
     * @Route("frm-gestion-franquicias/", name="generales_franquicias-frm")
     */
    public function frmGestionFranquicias(): Response
    {
        return $this->render($this->templateBase . 'frm-franq.html.twig', [
            'estasEn' => 'Franquicias > Nueva Franquicia',
        ]);
    }

    /**
     * @Route("lista-actuales/", name="generales_franquicias-lstActuales")
     */
    public function listaActuales(): Response
    {
        return $this->render($this->templateBase . 'lst-actuales.html.twig', [
            'estasEn' => 'Franquicias > Lista Existentes',
        ]);
    }

    /**
     * @Route("archivo-configuracion/", name="generales_franquicias-fileConfig")
     */
    public function fileConfig(): Response
    {
        $config = file_get_contents($this->getParameter('fileConfig'));

        return $this->render($this->templateBase . 'file-config.html.twig', [
            'estasEn' => 'Franquicias > Archivo de Configuración',
            'config' => json_decode($config, true)
        ]);
    }

    /**
     * @Route("set-archivo-configuracion/", methods={"POST"}, name="generales_franquicias-setFileConfig")
     */
    public function setFileConfig(Request $req): Response
    {
        $data = $req->request->get('data');
        $config = file_put_contents($this->getParameter('fileConfig'), json_encode($data));

        return $this->json(['has' => $config, 'send' => $data]);
    }

}
