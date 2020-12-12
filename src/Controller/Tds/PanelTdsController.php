<?php

namespace App\Controller\Tds;

use Symfony\Component\Finder\Finder;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\Exception\FileException;

use App\Services\SeguridadService;
use App\Services\GenQr;
use App\Entity\ArchPdf;
use App\Form\ArchPdfType;

/**
 * @Route("/bcmx/tds/panel/")
 */
class PanelTdsController extends AbstractController
{
    /**
     * @Route("index/", name="tds_panel-index")
     */
    public function index(SeguridadService $session): Response
    {
        if(!$session->hasToken()) { return $this->redirectToRoute('security'); }
        return $this->render('panel_tds/index.html.twig');
    }

    /**
    * Generamos el formulario para subir el PDF
    */
    public function getFrmUploadPdf()
    {
      $obj = new ArchPdf();
      $frm = $this->createForm(ArchPdfType::class, $obj);

      return $this->render('renders/ctrl_frm_upload_pdf.html.twig', [
        'frm' => $frm->createView()
      ]);
    }

    /**
    * @Route("{filename}/checar-existe-pdf/", name="tds_panel-checkPDFExiste")
    */
    public function checarSiExistePDF(string $filename)
    {
      $finder = new Finder();
      $finder->files()->in($this->getParameter('pathUpPdfs'))->name($filename);
      if($finder->hasResults()){
        $result = $this->getParameter('pathToPdfs') . $filename;
      }else{
        $result = 'Archivo PDF aún Inexistente.';
      }
      return $this->json(['path' => $result]);
    }

    /**
    * @Route("{filenameNew}/cambiar-nombre-file/{filenameOld}/", methods={"POST"}, name="tds_panel-cambiarNombreFile")
    */
    public function cambiarNombreFile(string $filenameNew, string $filenameOld)
    {
      $result = ['abort' => false];
      $base = $this->getParameter('pathUpPdfs');
      $fuente = $base . '/' . $filenameOld;
      $destino = $base . '/' . $filenameNew;
      if(is_file($fuente)) {
          rename($fuente, $destino);
      }else{
        $result['abort'] = true;
      }
      return $this->json($result);
    }

    /**
    * @Route("{filename}/upload-pdf-final/", name="tds_panel-upload_pdf_final")
    */
    public function uploadPdf(Request $req, string $filename)
    {
      $obj = new ArchPdf();
      $frm = $this->createForm(ArchPdfType::class, $obj);
      $frm->handleRequest($req);
      if ($frm->isSubmitted() && $frm->isValid()) {

          $pdf = $frm->get('archivo')->getData();
          if ($pdf) {
              // Move the file to the directory where brochures are stored
              try {
                  $pdf->move($this->getParameter('pathUpPdfs'), $filename);
                  return $this->json(['result' => 'ok']);
              } catch (FileException $e) {
                  // ... handle exception if something happens during file upload
              }
          }
      }
      $frm = $this->renderView('renders/ctrl_frm_upload_pdf.html.twig', [
        'frm' => $frm->createView()
      ]);
      return $this->json(['result' => $frm]);
    }

    /**
     * @Route("{uri}/gen-qr-peq/", name="tds_panel-getQrPeq")
     */
    public function genQrImgPeq(SeguridadService $session, GenQr $qr, string $uri): Response
    {
        if(!$session->hasToken()) { return $this->redirectToRoute('security'); }
        $qrCode = $qr->generaQr($this->getParameter('pathToPdfs') . $uri, 200);
        return $this->json(['qr' => $qrCode->writeDataUri()]);
    }

    /**
     * @Route("{uri}/gen-qr-big/", name="tds_panel-getQrBig")
     */
    public function downloadQR(SeguridadService $session, GenQr $qr, string $uri): Response
    {
        $pedazos = explode('.', $uri);
        if(!$session->hasToken()) { return $this->redirectToRoute('security'); }
        $qrCode = $qr->generaQr($this->getParameter('pathToPdfs') . $uri, 400);
        $response = new Response();
        $response->setContent($qrCode->writeString());
        $response->headers->set('Content-Type', 'application/octet-stream');
        $response->headers->set('Content-Disposition', 'attachment; filename='.$pedazos[0].'.png');
        $response->sendHeaders();
        return $response;
    }


}
