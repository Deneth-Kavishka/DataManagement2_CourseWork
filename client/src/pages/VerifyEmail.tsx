import { useEffect, useState } from 'react';
import { useLocation, useSearch, useRoute } from 'wouter';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

enum VerificationStatus {
  LOADING,
  SUCCESS,
  ERROR
}

const VerifyEmail = () => {
  const [, navigate] = useLocation();
  const search = useSearch();
  const { toast } = useToast();
  const [status, setStatus] = useState<VerificationStatus>(VerificationStatus.LOADING);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const params = new URLSearchParams(search);
  const token = params.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus(VerificationStatus.ERROR);
        setErrorMessage('Verification token is missing');
        return;
      }

      try {
        const response = await fetch(`/api/users/verify/${token}`);
        
        if (response.ok) {
          setStatus(VerificationStatus.SUCCESS);
          toast({
            title: 'Email verified successfully',
            description: 'Your account is now active.',
            variant: 'default',
          });
        } else {
          const data = await response.json();
          setStatus(VerificationStatus.ERROR);
          setErrorMessage(data.message || 'Failed to verify email');
        }
      } catch (error) {
        console.error('Error verifying email:', error);
        setStatus(VerificationStatus.ERROR);
        setErrorMessage('An error occurred while verifying your email');
      }
    };

    verifyEmail();
  }, [token, toast]);

  return (
    <div className="container flex items-center justify-center min-h-[80vh] py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Email Verification</CardTitle>
          <CardDescription>
            {status === VerificationStatus.LOADING && 'Verifying your email...'}
            {status === VerificationStatus.SUCCESS && 'Your email has been verified!'}
            {status === VerificationStatus.ERROR && 'Verification failed'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4 py-4">
          {status === VerificationStatus.LOADING && (
            <Loader2 className="h-16 w-16 text-green-500 animate-spin" />
          )}
          
          {status === VerificationStatus.SUCCESS && (
            <div className="text-center space-y-3">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <p className="text-lg">Thank you for verifying your email address.</p>
              <p>Your account is now active, and you can access all features of UrbanFood.</p>
            </div>
          )}
          
          {status === VerificationStatus.ERROR && (
            <div className="text-center space-y-3">
              <XCircle className="h-16 w-16 text-red-500 mx-auto" />
              <p className="text-lg">We couldn't verify your email address.</p>
              <p className="text-gray-500">{errorMessage}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            onClick={() => navigate('/')}
            className="w-full md:w-auto"
          >
            {status === VerificationStatus.SUCCESS ? 'Continue to Homepage' : 'Return to Homepage'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyEmail;