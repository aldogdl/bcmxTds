<?php

namespace App\Entity;

class ArchPdf
{

    private $archivo;

    public function getArchivo(): ?string
    {
        return $this->archivo;
    }

    public function setArchivo(string $archivo): self
    {
        $this->archivo = $archivo;

        return $this;
    }
}
