import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';

export const HeroSection = () => {
  return (
    <div className="relative min-h-screen flex items-center">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-purple-900/20" />
      
      {/* 3D Animation */}
      <div className="absolute inset-0 opacity-50">
        <Canvas>
          <OrbitControls enableZoom={false} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[2, 2, 2]} intensity={1} />
          <Sphere args={[1, 100, 200]} scale={2.4}>
            <MeshDistortMaterial
              color="#4c1d95"
              attach="material"
              distort={0.5}
              speed={2}
            />
          </Sphere>
        </Canvas>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
          >
            <span className="block">Transform Your Business with</span>
            <span className="block text-purple-400">AI-Powered Automation</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 max-w-2xl mx-auto text-xl text-gray-300"
          >
            Streamline operations, reduce costs, and drive innovation with our enterprise-grade AI platform.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 flex justify-center gap-4"
          >
            <Link href="/get-started">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                Get Started
              </Button>
            </Link>
            <Link href="/schedule-demo">
              <Button size="lg" variant="outline">
                Schedule Demo
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
