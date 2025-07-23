import { useCallback, useEffect, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import type { Container, Engine } from '@tsparticles/engine';
import { loadSlim } from '@tsparticles/slim';
import { loadImageShape } from '@tsparticles/shape-image';
import { Effects } from '@/features/template/templateAPI';

interface ParticlesBackgroundProps {
  effects: Effects;
}

const ParticlesBackground = ({ effects }: ParticlesBackgroundProps) => {
  const { imageUrl, coverageLevel, fallSpeed, minSize, maxSize } = effects;
  const [init, setInit] = useState(false);

  // this should be run only once per application lifetime
  useEffect(() => {
    initParticlesEngine(async (engine: Engine) => {
      await loadSlim(engine);
      await loadImageShape(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);


  if (init) {
    return (
      <Particles
        id="tsparticles-falling-images"
        options={{
          fullScreen: {
            enable: true,
          },
          fpsLimit: 60,
          particles: {
            number: {
              value: coverageLevel,
            },
            color: {
              value: "#ffffff",
            },
            shape: {
              type: "image",
              options: {
                image: {
                  src: imageUrl,
                  width: 100,
                  height: 100,
                }
              }
            },
            opacity: {
              value: 0.8,
            },
            size: {
              value: {
                min: minSize,
                max: maxSize
              },
            },
            move: {
              enable: true,
              direction: "bottom",
              speed: fallSpeed,
              gravity: {
                enable: true,
                acceleration: 0.1,
              },
              outModes: {
                default: "out",
              },
            },
            rotate: {
              value: {
                min: 0,
                max: 360
              },
              direction: "random",
              animation: {
                enable: true,
                speed: 5,
              },
            },
          },
          detectRetina: true,
        }}
      />
    );
  }

  return null;
};

export default ParticlesBackground;
