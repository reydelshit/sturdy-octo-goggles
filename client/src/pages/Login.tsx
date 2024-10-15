import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface CredentialsItem {
  username: string;
  password: string;
  patient_id: string;
}

const useFetchCredentials = (username: string, password: string) => {
  return useQuery<CredentialsItem>({
    queryKey: ['credentialsData', username, password],
    queryFn: async () => {
      const response = await axios.post(
        `${import.meta.env.VITE_API_LINK}/login`,
        {
          username,
          password,
        },
      );
      if (response.data.length === 0) {
        throw new Error('Invalid credentials');
      }
      return response.data[0] as CredentialsItem;
    },
    enabled: false,
    retry: false,
  });
};
export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const {
    data: credentialsPatients,
    isLoading,
    refetch,
    isError,
    error: queryError,
  } = useFetchCredentials(username, password);

  const staffUsername = import.meta.env.VITE_STAFF_USERNAME;
  const staffPassword = import.meta.env.VITE_STAFF_PASSWORD;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (
      username.includes('staff') &&
      username.includes(staffUsername) &&
      password.includes(staffPassword)
    ) {
      localStorage.setItem('health_monitoring_role', 'staff');
      navigate('/staff-dashboard');
      return;
    }

    try {
      const result = await refetch();

      if (result.isError) {
        setError('Invalid credentials');
        return;
      }

      if (result.data) {
        console.log('Login successful', result.data);

        if (result.data.patient_id) {
          localStorage.setItem('patient_id', result.data.patient_id);
          localStorage.setItem('health_monitoring_role', 'patient');
          navigate(`/patient-dashboard`);
        }
      }
    } catch (error) {
      setError('An unexpected error occurred');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Login to MedTracker</CardTitle>
          <CardDescription>
            Enter your credentials to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <Input
              className="mb-4"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
            />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
            <div className="my-4 flex gap-4">
              <Button type="submit">Login</Button>

              <Button variant={'secondary'}>Forgot Password</Button>
            </div>
            {error && <p className="text-red-500">{error}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
