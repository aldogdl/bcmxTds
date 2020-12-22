<?php

namespace App\Form;

use App\Entity\Franquicias;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\NumberType;
use Symfony\Component\Form\Extension\Core\Type\FileType;

class FranquiciasType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('nombre', TextType::class, [
              'label' => '*Nombre de la Franquicia',
              'required' => true
            ])
            ->add('nomContac', TextType::class, [
              'label' => '*Nombre del Contacto',
              'required' => true
            ])
            ->add('telContac', NumberType::class, [
              'label' => '*Teléfono del Contacto',
              'required' => true
            ])
            ->add('whatsContac', NumberType::class, [
              'label' => '*Whatsapp',
              'required' => true
            ])
            ->add('domicilio', TextType::class, [
              'label' => '*Domicilio de la Franquicia',
              'required' => true
            ])
            ->add('dominio', TextType::class, [
              'label' => '*Nombre del Dominio',
              'required' => true
            ])
            ->add('costoDominio', NumberType::class, [
              'label' => '*Costo del Dominio',
              'required' => true
            ])
            ->add('costoHosting', NumberType::class, [
              'label' => '*Costo del Hosting',
              'required' => true
            ])
            ->add('logo', FileType::class, [
              'label' => '*Logotipo',
              'required' => true
            ])
            ->add('anticipo', NumberType::class, [
              'label' => '*Anticipo'
            ])
            ->add('nextPagoAt', TextType::class, [
              'label' => '*Sigiente Pago',
              'required' => true
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => Franquicias::class,
        ]);
    }
}
