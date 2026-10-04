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
    } else {
      setSuccess(true); // Since actions.ts does redirect('/'), it might just redirect.
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-xl">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight text-primary">Create an Account</CardTitle>
          <p className="text-sm text-gray-500">Join OVENA to find your next place or host renters.</p>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="rounded-md bg-green-50 p-6 text-center text-green-700">
              <h3 className="text-lg font-semibold mb-2">Account Created</h3>
              <p>You have successfully signed up. Redirecting...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" {...register('firstName')} aria-invalid={!!errors.firstName} />
                  {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" {...register('lastName')} aria-invalid={!!errors.lastName} />
                  {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} aria-invalid={!!errors.email} />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input id="phone" type="tel" {...register('phone')} aria-invalid={!!errors.phone} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" {...register('password')} aria-invalid={!!errors.password} />
                  {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input id="confirmPassword" type="password" {...register('confirmPassword')} aria-invalid={!!errors.confirmPassword} />
                  {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
                </div>
              </div>

              <div className="space-y-3 pt-2 pb-4">
                <Label>I want to:</Label>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer border rounded-md p-3 flex-1 hover:bg-secondary">
                    <input type="radio" value="RENTER" {...register('role')} className="text-primary" />
                    <span className="text-sm font-medium">Rent a property</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer border rounded-md p-3 flex-1 hover:bg-secondary">
                    <input type="radio" value="HOST" {...register('role')} className="text-primary" />
                    <span className="text-sm font-medium">Host a property</span>
                  </label>
                </div>
                {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Creating account...' : 'Create account'}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-primary hover:text-primary-hover">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
