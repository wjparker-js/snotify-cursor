/**
 * AuthDialog component handles user authentication flows including:
 * - Sign in
 * - Sign up
 * - Password reset
 * 
 * The component supports email parameter parsing from URL for pre-filling
 * the email field when navigating from password reset confirmation.
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Loader2, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthDialog: React.FC<AuthDialogProps> = ({ open, onOpenChange }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  
  // Check URL for email parameter when component mounts or dialog opens
  useEffect(() => {
    if (!open || !location) return;

    try {
      const params = new URLSearchParams(location.search || '');
      const emailParam = params.get('email');
      if (emailParam) {
        setEmail(emailParam.trim());
        // Clear the email parameter from URL to avoid issues on refresh
        window.history.replaceState({}, document.title, location.pathname || '/');
      }
    } catch (error) {
      console.error('Error processing URL parameters:', error);
    }
  }, [open, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedEmail = (email || '').trim();
    const trimmedPassword = (password || '').trim();
    
    if (!trimmedEmail) {
      toast({
        title: "Missing fields",
        description: "Please fill in all the required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isForgotPassword) {
        await resetPassword(trimmedEmail);
        toast({
          title: "Password reset email sent",
          description: "Please check your email for instructions to reset your password.",
        });
        setIsForgotPassword(false);
        onOpenChange(false);
      } else if (isSignUp) {
        if (!trimmedPassword) {
          toast({
            title: "Missing fields",
            description: "Please enter a password.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
        await signUp(trimmedEmail, trimmedPassword);
        toast({
          title: "Sign up successful",
          description: "Your account has been created. You may need to verify your email before signing in.",
        });
      } else {
        if (!trimmedPassword) {
          toast({
            title: "Missing fields",
            description: "Please enter a password.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
        await signIn(trimmedEmail, trimmedPassword);
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      // Error is handled in the auth context
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchToForgotPassword = () => {
    setIsForgotPassword(true);
    setPassword('');
  };

  const switchToSignIn = () => {
    setIsForgotPassword(false);
    setIsSignUp(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isForgotPassword ? "Reset Password" : isSignUp ? "Create an account" : "Sign in to your account"}
          </DialogTitle>
        </DialogHeader>
        
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 text-foreground dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                required
              />
            </div>
          </div>
          
          {!isForgotPassword && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 text-foreground dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                  required={!isForgotPassword}
                />
              </div>
            </div>
          )}
          
          <div className="flex flex-col gap-2 pt-2">
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isForgotPassword 
                ? "Send Reset Instructions" 
                : isSignUp 
                  ? "Create Account" 
                  : "Sign In"}
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={() => onOpenChange(false)}
            >
              Maybe Later
            </Button>
          </div>
          
          <div className="text-center text-sm">
            {isForgotPassword ? (
              <p>
                Remember your password?{" "}
                <Button 
                  variant="link" 
                  className="p-0 h-auto font-semibold"
                  onClick={switchToSignIn}
                >
                  Sign In
                </Button>
              </p>
            ) : isSignUp ? (
              <p>
                Already have an account?{" "}
                <Button 
                  variant="link" 
                  className="p-0 h-auto font-semibold"
                  onClick={() => setIsSignUp(false)}
                >
                  Sign In
                </Button>
              </p>
            ) : (
              <div className="flex justify-between">
                <Button 
                  variant="link" 
                  className="p-0 h-auto font-semibold text-sm"
                  onClick={switchToForgotPassword}
                >
                  Forgot password?
                </Button>
                <Button 
                  variant="link" 
                  className="p-0 h-auto font-semibold text-sm"
                  onClick={() => setIsSignUp(true)}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;