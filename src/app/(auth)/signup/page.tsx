'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { signup } from '../actions';

const signupSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['RENTER', 'HOST'], { required_error: 'Please select a role' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<boolean>(false);
  const [successMessage, setSuccessMessage] = React.useState<string>('You have successfully signed up. Redirecting...');
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: 'RENTER',
    }
  });

  const onSubmit = async (data: SignupForm) => {
    setError(null);
    const formData = new FormData();
    formData.append('firstName', data.firstName);
    formData.append('lastName', data.lastName);
    formData.append('email', data.email);
    if (data.phone) formData.append('phone', data.phone);
    formData.append('password', data.password);
    formData.append('role', data.role);
    
    const result = await signup(formData);
    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setSuccess(true);
      if (result.message) {
        setSuccessMessage(result.message);
      }
    } else {
      // Just in case it succeeded but no success payload was explicitly returned
      // (like when auto-confirm is on and redirect takes over)
      setSuccess(true);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-xl shadow-sm border-border">
        <CardHeader className="space-y-3 text-center pb-6">
          <CardTitle className="text-3xl font-bold tracking-tight text-foreground">Create an Account</CardTitle>
          <p className="text-sm text-text-secondary font-light">Join OVENA to find your next place or host renters.</p>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="rounded-[10px] bg-green-50 p-6 text-center text-success border border-green-100">
              <h3 className="text-lg font-semibold mb-2">Account Created</h3>
              <p>{successMessage}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <div className="rounded-[10px] bg-red-50 p-3 text-sm text-error border border-red-100">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-foreground">First Name</Label>
                  <Input id="firstName" {...register('firstName')} aria-invalid={!!errors.firstName} />
                  {errors.firstName && <p className="text-sm text-error">{errors.firstName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-foreground">Last Name</Label>
                  <Input id="lastName" {...register('lastName')} aria-invalid={!!errors.lastName} />
                  {errors.lastName && <p className="text-sm text-error">{errors.lastName.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input id="email" type="email" {...register('email')} aria-invalid={!!errors.email} />
                {errors.email && <p className="text-sm text-error">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground">Phone (Optional)</Label>
                <Input id="phone" type="tel" {...register('phone')} aria-invalid={!!errors.phone} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">Password</Label>
                  <Input id="password" type="password" {...register('password')} aria-invalid={!!errors.password} />
                  {errors.password && <p className="text-sm text-error">{errors.password.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
                  <Input id="confirmPassword" type="password" {...register('confirmPassword')} aria-invalid={!!errors.confirmPassword} />
                  {errors.confirmPassword && <p className="text-sm text-error">{errors.confirmPassword.message}</p>}
                </div>
              </div>

              <div className="space-y-3 pt-4 pb-4 border-t border-border mt-4">
                <Label className="text-foreground font-semibold">I want to:</Label>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-3 cursor-pointer border border-border bg-surface rounded-[10px] p-4 flex-1 hover:border-primary transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <input type="radio" value="RENTER" {...register('role')} className="text-primary focus:ring-primary h-4 w-4" />
                    <span className="text-sm font-medium text-foreground">Rent a property</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer border border-border bg-surface rounded-[10px] p-4 flex-1 hover:border-primary transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <input type="radio" value="HOST" {...register('role')} className="text-primary focus:ring-primary h-4 w-4" />
                    <span className="text-sm font-medium text-foreground">Host a property</span>
                  </label>
                </div>
                {errors.role && <p className="text-sm text-error">{errors.role.message}</p>}
              </div>

              <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
                {isSubmitting ? 'Creating account...' : 'Create account'}
              </Button>
            </form>
          )}

          <div className="mt-8 text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:text-primary-hover transition-colors">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
