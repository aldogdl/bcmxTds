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

    /**
     * @Route("{tdPdf}/check-existencia-elementos-tds/", methods={"GET"}, name="tds-check_existencia_elementos_tds")
     */
    public function checkExistenciaElementoTds($tdPdf): Response
    {
        $result = ['abort' => false, 'msg' => 'ok', 'body' => [
          'td' => true, 'img' => true
        ]];

        if(!file_exists($this->getParameter('pathUpPdfs') . '/' . $tdPdf)) {
          $result['body']['td'] = false;
        }
        $tdJpg = str_replace('.pdf', '.jpg', $tdPdf);
        if(!file_exists($this->getParameter('pathThumTds') . '/' . $tdJpg)) {
          $result['body']['img'] = false;
        }
        $result['abort'] = (count($result['body']) > 0) ? true : false;
        return $this->json($result);
    }
}
