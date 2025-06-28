/**
 * AccountButton component handles user account interactions.
 * It displays either a sign-in button or user account dropdown based on authentication state.
 * Features:
 * - Sign in/up dialog trigger when not authenticated
 * - User account dropdown menu when authenticated
 * - Sign out functionality
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { User, LogOut } from 'lucide-react';
import AuthDialog from './AuthDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

const AccountButton: React.FC = () => {
  const auth = useAuth();
  const user = auth?.user;
  const signOut = auth?.signOut;
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (!signOut) return;
    
    try {
      setIsSigningOut(true);
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Sign out failed",
        description: "There was an error signing you out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  // Render authenticated user dropdown
  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            size="sm" 
            variant="ghost" 
            className="rounded-full w-auto p-0 h-auto hover:bg-transparent text-white hover:text-theme-color transition-colors"
          >
            <User size={18} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="cursor-pointer"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>{isSigningOut ? "Signing out..." : "Log out"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Render sign in button
  return (
    <>
      <Button 
        size="sm" 
        variant="ghost" 
        className="rounded-full w-auto p-0 h-auto hover:bg-transparent text-white hover:text-theme-color transition-colors"
        onClick={() => setShowAuthDialog(true)}
      >
        <User size={18} />
      </Button>
      
      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
      />
    </>
  );
};

export default AccountButton;