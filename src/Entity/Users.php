<?php

namespace App\Entity;

use App\Repository\UsersRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass=UsersRepository::class)
 */
class Users
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=50)
     */
    private $usname;

    /**
     * @ORM\Column(type="string", length=50)
     */
    private $uspass;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUsname(): ?string
    {
        return $this->usname;
    }

    public function setUsname(string $usname): self
    {
        $this->usname = $usname;

        return $this;
    }

    public function getUspass(): ?string
    {
        return $this->uspass;
    }

    public function setUspass(string $uspass): self
    {
        $this->uspass = $uspass;

        return $this;
    }
}
