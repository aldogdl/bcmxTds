<?php

namespace App\Repository;

use App\Entity\FranqDataContac;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method FranqDataContac|null find($id, $lockMode = null, $lockVersion = null)
 * @method FranqDataContac|null findOneBy(array $criteria, array $orderBy = null)
 * @method FranqDataContac[]    findAll()
 * @method FranqDataContac[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class FranqDataContacRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, FranqDataContac::class);
    }
}
