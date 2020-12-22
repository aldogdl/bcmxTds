<?php

namespace App\Repository;

use App\Entity\Franquicias;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method Franquicias|null find($id, $lockMode = null, $lockVersion = null)
 * @method Franquicias|null findOneBy(array $criteria, array $orderBy = null)
 * @method Franquicias[]    findAll()
 * @method Franquicias[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class FranquiciasRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Franquicias::class);
    }

    // /**
    //  * @return Franquicias[] Returns an array of Franquicias objects
    //  */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('f')
            ->andWhere('f.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('f.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?Franquicias
    {
        return $this->createQueryBuilder('f')
            ->andWhere('f.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
