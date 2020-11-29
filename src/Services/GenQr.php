<?php

namespace App\Services;

use Endroid\QrCode\QrCode;

class GenQr
{

  public function generaQr(string $url, int $tamanio)
  {
    $qrCode = new QrCode($url);
    $qrCode->setSize($tamanio);
    // Set advanced options
    $qrCode->setWriterByName('png');
    $qrCode->setEncoding('UTF-8');
    $qrCode->setForegroundColor(['r' => 0, 'g' => 0, 'b' => 0]);
    $qrCode->setBackgroundColor(['r' => 255, 'g' => 255, 'b' => 255]);
    $qrCode->setLabel('Escanea el Código', 16);
    $qrCode->setLogoPath(__DIR__.'/../../public_html/images/logo_qr_bcmx.png');
    $qrCode->setLogoWidth($tamanio * 0.25);
    $qrCode->setValidateResult(false);
    return $qrCode;
  }
}
