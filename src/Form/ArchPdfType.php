<?php

namespace App\Form;

use App\Entity\ArchPdf;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\File;
use Symfony\Component\Form\Extension\Core\Type\FileType;

class ArchPdfType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('archivo', FileType::class, [
              'label' => 'Subir el PDF Terminado:',
              'label_attr' => ['class' => 'text-muted'],
              'mapped' => false,
              'required' => false,
              'constraints' => [
                  new File([
                      'maxSize' => '1024k',
                      'mimeTypes' => [
                          'application/pdf',
                          'application/x-pdf',
                      ],
                      'mimeTypesMessage' => 'Solo archivos PDF',
                  ])
              ],
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => ArchPdf::class,
        ]);
    }
}
