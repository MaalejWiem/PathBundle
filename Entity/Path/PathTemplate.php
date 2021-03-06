<?php

namespace Innova\PathBundle\Entity\Path;

use Doctrine\ORM\Mapping as ORM;

/**
 * PathTemplate
 *
 * @ORM\Table(name="innova_pathtemplate")
 * @ORM\Entity
 */
class PathTemplate extends AbstractPath
{
    /**
     * Unique identifier of the template
     * @var integer
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * Get id
     * @return integer
     */
    public function getId()
    {
        return $this->id;
    }
}
