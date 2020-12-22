<?php

namespace App\Entity;

use App\Repository\FranquiciasRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass=FranquiciasRepository::class)
 */
class Franquicias
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=100)
     */
    private $nombre;

    /**
     * @ORM\Column(type="string", length=50)
     */
    private $dominio;

    /**
     * @ORM\Column(type="string", length=100)
     */
    private $nomContac;

    /**
     * @ORM\Column(type="string", length=15)
     */
    private $telContac;

    /**
     * @ORM\Column(type="string", length=15)
     */
    private $whatsContac;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $domicilio;

    /**
     * @ORM\Column(type="datetime")
     */
    private $createdAt;

    /**
     * @ORM\Column(type="string", length=100)
     */
    private $logo;

    /**
     * @ORM\Column(type="float")
     */
    private $costoDominio;

    /**
     * @ORM\Column(type="float")
     */
    private $costoHosting;

    /**
     * @ORM\Column(type="float")
     */
    private $anticipo;

    /**
     * @ORM\Column(type="boolean")
     */
    private $isPagado;

    /**
     * @ORM\Column(type="datetime")
     */
    private $nextPagoAt;


    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNombre(): ?string
    {
        return $this->nombre;
    }

    public function setNombre(string $nombre): self
    {
        $this->nombre = $nombre;

        return $this;
    }

    public function getDominio(): ?string
    {
        return $this->dominio;
    }

    public function setDominio(string $dominio): self
    {
        $this->dominio = $dominio;

        return $this;
    }

    public function getNomContac(): ?string
    {
        return $this->nomContac;
    }

    public function setNomContac(string $nomContac): self
    {
        $this->nomContac = $nomContac;

        return $this;
    }

    public function getTelContac(): ?string
    {
        return $this->telContac;
    }

    public function setTelContac(string $telContac): self
    {
        $this->telContac = $telContac;

        return $this;
    }

    public function getWhatsContac(): ?string
    {
        return $this->whatsContac;
    }

    public function setWhatsContac(string $whatsContac): self
    {
        $this->whatsContac = $whatsContac;

        return $this;
    }

    public function getDomicilio(): ?string
    {
        return $this->domicilio;
    }

    public function setDomicilio(string $domicilio): self
    {
        $this->domicilio = $domicilio;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeInterface $createdAt): self
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    public function getLogo(): ?string
    {
        return $this->logo;
    }

    public function setLogo(string $logo): self
    {
        $this->logo = $logo;

        return $this;
    }

    public function getCostoDominio(): ?float
    {
        return $this->costoDominio;
    }

    public function setCostoDominio(float $costoDominio): self
    {
        $this->costoDominio = $costoDominio;

        return $this;
    }

    public function getCostoHosting(): ?float
    {
        return $this->costoHosting;
    }

    public function setCostoHosting(float $costoHosting): self
    {
        $this->costoHosting = $costoHosting;

        return $this;
    }

    public function getAnticipo(): ?float
    {
        return $this->anticipo;
    }

    public function setAnticipo(float $anticipo): self
    {
        $this->anticipo = $anticipo;

        return $this;
    }

    public function getIsPagado(): ?bool
    {
        return $this->isPagado;
    }

    public function setIsPagado(bool $isPagado): self
    {
        $this->isPagado = $isPagado;

        return $this;
    }

    public function getNextPagoAt(): ?\DateTimeInterface
    {
        return $this->nextPagoAt;
    }

    public function setNextPagoAt(\DateTimeInterface $nextPagoAt): self
    {
        $this->nextPagoAt = $nextPagoAt;

        return $this;
    }

}
