'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-context';
import { SoundEffect, SOUND_EFFECTS } from '@/components/ui/sound-effect';
import { Confetti } from '@/components/ui/confetti';
import {
  Shield, Key, Smartphone, Lock, Copy, RefreshCw, CheckCircle, AlertTriangle, Loader2
} from 'lucide-react';
import QRCode from 'qrcode.react';

interface TwoFactorAuthProps {
  children: React.ReactNode;
}

export default function TwoFactorAuth({ children }: TwoFactorAuthProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'intro' | 'setup' | 'verify' | 'success'>('intro');
  const [secret, setSecret] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [playSuccessSound, setPlaySuccessSound] = useState(false);
  const [recoveryKeys, setRecoveryKeys] = useState<string[]>([]);
  
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && step === 'setup' && !secret) {
      generateSecret();
    }
  }, [isOpen, step, secret]);

  const generateSecret = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would be an API call to generate a secret
      // For demo purposes, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockSecret = 'ABCDEFGHIJKLMNOP';
      const mockQrCodeUrl = `otpauth://totp/PixelUniverse:${user?.email}?secret=${mockSecret}&issuer=PixelUniverse`;
      
      setSecret(mockSecret);
      setQrCodeUrl(mockQrCodeUrl);
      
      // Generate recovery keys
      const keys = Array.from({ length: 8 }, () => 
        Array.from({ length: 4 }, () => 
          Math.random().toString(36).substring(2, 6)
        ).join('-')
      );
      setRecoveryKeys(keys);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao gerar o código secreto. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySecret = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      toast({
        title: 'Copiado',
        description: 'Código secreto copiado para a área de transferência.',
      });
    }
  };

  const handleCopyRecoveryKeys = () => {
    if (recoveryKeys.length > 0) {
      navigator.clipboard.writeText(recoveryKeys.join('\n'));
      toast({
        title: 'Copiado',
        description: 'Chaves de recuperação copiadas para a área de transferência.',
      });
    }
  };

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: 'Código Inválido',
        description: 'Por favor, insira um código de 6 dígitos.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // In a real implementation, this would be an API call to verify the code
      // For demo purposes, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo, we'll accept any 6-digit code
      if (verificationCode.length === 6 && /^\d+$/.test(verificationCode)) {
        setStep('success');
        setShowConfetti(true);
        setPlaySuccessSound(true);
      } else {
        throw new Error('Código inválido');
      }
    } catch (error) {
      toast({
        title: 'Erro na Verificação',
        description: 'O código inserido é inválido. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    toast({
      title: 'Autenticação de Dois Fatores Ativada',
      description: 'A sua conta está agora mais segura com 2FA.',
    });
    setIsOpen(false);
    setStep('intro');
    setSecret(null);
    setQrCodeUrl(null);
    setVerificationCode('');
    setRecoveryKeys([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <SoundEffect src={SOUND_EFFECTS.SUCCESS} play={playSuccessSound} onEnd={() => setPlaySuccessSound(false)} />
      <Confetti active={showConfetti} duration={3000} onComplete={() => setShowConfetti(false)} />
      
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        {step === 'intro' && (
          <>
            <CardHeader>
              <CardTitle className="text-xl font-headline flex items-center">
                <Shield className="h-5 w-5 mr-2 text-primary" />
                Autenticação de Dois Fatores
              </CardTitle>
              <CardDescription>
                Proteja a sua conta com uma camada adicional de segurança
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-lg space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/20 p-2 rounded-full">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Segurança Reforçada</h3>
                    <p className="text-sm text-muted-foreground">
                      Mesmo que alguém descubra a sua password, não conseguirá aceder à sua conta sem o código de autenticação.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-primary/20 p-2 rounded-full">
                    <Smartphone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Código no Seu Telemóvel</h3>
                    <p className="text-sm text-muted-foreground">
                      Use uma aplicação de autenticação como Google Authenticator, Microsoft Authenticator ou Authy.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-primary/20 p-2 rounded-full">
                    <Key className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Chaves de Recuperação</h3>
                    <p className="text-sm text-muted-foreground">
                      Receberá chaves de recuperação para aceder à sua conta caso perca o seu dispositivo.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setStep('setup')}>
                Configurar 2FA
              </Button>
            </CardFooter>
          </>
        )}
        
        {step === 'setup' && (
          <>
            <CardHeader>
              <CardTitle className="text-xl font-headline flex items-center">
                <Smartphone className="h-5 w-5 mr-2 text-primary" />
                Configurar Autenticador
              </CardTitle>
              <CardDescription>
                Siga os passos abaixo para configurar a autenticação de dois fatores
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">A gerar código secreto...</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>1. Instale uma aplicação de autenticação</Label>
                    <div className="bg-muted/30 p-3 rounded-lg text-sm text-muted-foreground">
                      <p>Recomendamos:</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Google Authenticator</li>
                        <li>Microsoft Authenticator</li>
                        <li>Authy</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>2. Digitalize o código QR ou insira o código manualmente</Label>
                    {qrCodeUrl && (
                      <div className="flex flex-col items-center bg-white p-4 rounded-lg">
                        <QRCode value={qrCodeUrl} size={180} />
                      </div>
                    )}
                    
                    {secret && (
                      <div className="flex items-center mt-2">
                        <Input value={secret} readOnly className="font-mono text-center" />
                        <Button variant="outline" size="icon" className="ml-2" onClick={handleCopySecret}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>3. Guarde estas chaves de recuperação num local seguro</Label>
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <div className="grid grid-cols-2 gap-2">
                        {recoveryKeys.map((key, index) => (
                          <div key={index} className="font-mono text-xs bg-background/50 p-1 rounded text-center">
                            {key}
                          </div>
                        ))}
                      </div>
                      <Button variant="outline" size="sm" className="w-full mt-2" onClick={handleCopyRecoveryKeys}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar Todas as Chaves
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline" onClick={() => setStep('intro')} disabled={isLoading}>
                Voltar
              </Button>
              <Button onClick={() => setStep('verify')} disabled={isLoading || !secret}>
                Continuar
              </Button>
            </CardFooter>
          </>
        )}
        
        {step === 'verify' && (
          <>
            <CardHeader>
              <CardTitle className="text-xl font-headline flex items-center">
                <Key className="h-5 w-5 mr-2 text-primary" />
                Verificar Configuração
              </CardTitle>
              <CardDescription>
                Insira o código da sua aplicação de autenticação para confirmar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verification-code">Código de Verificação</Label>
                <Input
                  id="verification-code"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                  className="text-center font-mono text-lg tracking-widest"
                  maxLength={6}
                />
              </div>
              
              <div className="bg-muted/30 p-3 rounded-lg flex items-start gap-2">
                <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Abra a sua aplicação de autenticação e insira o código de 6 dígitos mostrado para a conta Pixel Universe.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline" onClick={() => setStep('setup')} disabled={isLoading}>
                Voltar
              </Button>
              <Button onClick={handleVerify} disabled={isLoading || verificationCode.length !== 6}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    A verificar...
                  </>
                ) : (
                  <>
                    Verificar
                  </>
                )}
              </Button>
            </CardFooter>
          </>
        )}
        
        {step === 'success' && (
          <>
            <CardHeader>
              <CardTitle className="text-xl font-headline flex items-center text-green-500">
                <CheckCircle className="h-5 w-5 mr-2" />
                Configuração Concluída
              </CardTitle>
              <CardDescription>
                A autenticação de dois fatores foi ativada com sucesso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-500/10 p-4 rounded-lg text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <p className="font-medium text-green-500">A sua conta está agora mais segura!</p>
                <p className="text-sm text-muted-foreground mt-2">
                  A partir de agora, será necessário inserir um código de verificação sempre que iniciar sessão.
                </p>
              </div>
              
              <div className="bg-amber-500/10 p-3 rounded-lg flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-500">Importante</p>
                  <p className="text-xs text-muted-foreground">
                    Certifique-se de que guardou as suas chaves de recuperação num local seguro. Elas são a única forma de recuperar a sua conta se perder acesso ao seu dispositivo de autenticação.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-4">
              <Button onClick={handleFinish}>
                Concluir
              </Button>
            </CardFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}