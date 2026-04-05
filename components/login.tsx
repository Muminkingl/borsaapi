'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function LoginForm2() {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  const { t, lang } = useTranslation();
  const isRTL = lang === 'ku';

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };
  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="rose-gradient bg-background relative min-h-screen overflow-hidden">
      <div className="from-background absolute -top-10 left-0 h-1/2 w-full rounded-b-full bg-gradient-to-b to-transparent blur"></div>
      <div className="from-primary/80 absolute -top-64 left-0 h-1/2 w-full rounded-full bg-gradient-to-b to-transparent blur-3xl"></div>
      <div className="relative z-10 grid min-h-screen grid-cols-1 md:grid-cols-2">
        <motion.div
          className="hidden flex-1 items-center justify-center space-y-8 p-8 text-center md:flex"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            >
              <img
                src="/logo.png"
                alt="BorsaAPI Logo"
                className="mx-auto h-auto w-48 md:w-64 drop-shadow-2xl"
              />
            </motion.div>
            <motion.div
              className="relative mx-auto mt-4 w-max"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            >
              <h1 className="text-5xl md:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-primary to-primary/60" style={{ fontFamily: "'Instrument Serif', serif" }}>
                BorsaAPI
              </h1>
              <svg className="absolute -bottom-6 left-0 w-full text-primary/30" viewBox="0 0 100 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 10 Q 50 20 100 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
              </svg>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          className="flex flex-1 items-center justify-center p-8"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          >
            <Card className="border-border/70 bg-card/20 w-full max-w-md shadow-[0_10px_26px_#e0e0e0a1] backdrop-blur-lg dark:shadow-none">
              <CardContent className="space-y-6 p-8">
                {/* Logo and Header */}
                <motion.div
                  className="space-y-4 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-2xl font-bold tracking-tight md:text-4xl">
                      {t.login.title}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm whitespace-pre-line">
                    {t.login.subtitle}
                  </p>
                </motion.div>

                {/* Google Login Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5, ease: 'easeOut' }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="secondary"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="bg-primary-foreground text-primary hover:bg-primary-foreground/95 w-full shadow-[0_4px_16px_var(--border)] duration-300 dark:shadow-[0_4px_14px_var(--muted-foreground)]"
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                    )}
                    <span className="ml-2">{isLoading ? t.login.connecting : t.login.signInGoogle}</span>
                  </Button>
                </motion.div>

                {/* Terms */}
                <motion.p
                  className="text-muted-foreground mt-2 text-center text-xs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.0, ease: 'easeOut' }}
                >
                  {t.login.terms}{' '}
                  <Link
                    prefetch={false}
                    href="/terms"
                    className="text-muted-foreground hover:text-primary underline"
                  >
                    {t.login.termsLink}
                  </Link>{' '}
                  {t.login.and}{' '}
                  <Link
                    prefetch={false}
                    href="/privacy"
                    className="text-muted-foreground hover:text-primary underline"
                  >
                    {t.login.privacyLink}
                  </Link>
                  .
                </motion.p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
