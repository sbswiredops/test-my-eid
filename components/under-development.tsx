"use client";

import { motion } from "framer-motion";
import { Construction, Clock, Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface UnderDevelopmentProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
}

export function UnderDevelopment({
  title = "Under Development",
  message = "This page is under development. Please wait some days.",
  showBackButton = true,
}: UnderDevelopmentProps) {
  const router = useRouter();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Icon with animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.2,
              type: "spring",
              stiffness: 200,
              damping: 15,
            }}
            className="mb-8 inline-flex relative"
          >
            <div className="relative">
              <motion.div
                animate={{
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative"
              >
                <Construction className="w-16 h-16 text-primary" />

                {/* Floating sparkles */}
                <motion.div
                  animate={{
                    y: [-10, -20, -10],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -top-2 -right-2"
                >
                  <Sparkles className="w-6 h-6 text-yellow-500" />
                </motion.div>

                <motion.div
                  animate={{
                    y: [10, 20, 10],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                  className="absolute -bottom-2 -left-2"
                >
                  <Sparkles className="w-5 h-5 text-blue-500" />
                </motion.div>
              </motion.div>

              {/* Pulse ring */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 rounded-full border-2 border-primary"
              />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent"
          >
            {title}
          </motion.h1>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <p className="text-lg md:text-xl text-muted-foreground mb-4">
              {message}
            </p>

            {/* Progress indicator */}
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 animate-pulse" />
              <span>We're working hard to bring you something amazing!</span>
            </div>
          </motion.div>

          {/* Decorative elements */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-8 flex justify-center gap-2"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-3 h-3 rounded-full bg-primary"
              />
            ))}
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            {showBackButton && (
              <Button
                variant="default"
                size="lg"
                className="min-w-[200px]"
                onClick={() => router.push("/")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            )}

            <Button
              variant="outline"
              size="lg"
              className="min-w-[200px]"
              onClick={() => router.push("/shop")}
            >
              Browse Shop
            </Button>
          </motion.div>

          {/* Footer note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-12 text-sm text-muted-foreground"
          >
            Have questions? Contact us at{" "}
            <a
              href="mailto:support@eidcollection.com"
              className="text-primary hover:underline"
            >
              support@eidcollection.com
            </a>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
