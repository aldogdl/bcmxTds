<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

use App\Form\SecurityType;
use App\Entity\Users;
use App\Http\SecurityHttp;
use App\Services\SeguridadService;

class SecurityController extends AbstractController
{

/**
 * @Route("/", name="index_main")
 */
  public function indexMain(): Response
  {
      return $this->render('index/index-main.html.twig');
  }

  /**
  * @Route("bcmx/login/", name="security")
  */
  public function security(Request $req, HttpClientInterface $httpSec, SeguridadService $session, ParameterBagInterface $params): Response
  {
    $http = new SecurityHttp($httpSec, $params);
    $erroresExtras = '';
    $obj = new Users();
    $frm = $this->createForm(SecurityType::class, $obj);
    $frm->handleRequest($req);
    if($frm->isSubmitted()){
      if($frm->isValid()) {

        $token = $http->getToken([
          '_usname' => $frm->getData()->getUsname(),
          '_uspass' => $frm->getData()->getUspass(),
        ]);
        if($token != 'err'){
          $session->setTokenInSession($token);
          $hecho = $session->getAndSetDataUser($frm->getData()->getUsname(), $token);
          if($hecho) {
            return $this->redirectToRoute('bcmx_cpanel-index');
          }else{
            $erroresExtras = 'No se pudieron recuperar los datos de tu registro, inténtalo nuevamente, por favor.';
          }
        }else{
          $erroresExtras = 'Tus Datos son Incorrectos.';
        }
      }
    }

    return $this->render('security/index.html.twig', [
      'frm' => $frm->createView(), 'erroresExtras' => $erroresExtras
    ]);
  }
}
