import React, { useState } from 'react';
import { toast } from '@/hooks/use-toast';

// TODO: Implement password reset using MySQL/Prisma or another provider. Supabase logic removed.

const ResetPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      toast({ title: 'Reset password', description: 'Password reset is not implemented.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>Reset Password</h1>
      <form onSubmit={handleResetPassword}>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
