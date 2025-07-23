import { useState } from 'react';
import {
  Box,
  Button,
  Input,
  Heading,
  Container,
} from '@chakra-ui/react';
import { useLogin } from '../../features/auth/authAPI';
import { toaster } from '../../components/ui/toaster';
import { useNavigate, useLocation } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const loginMutation = useLogin();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from location state or default to home
  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginMutation.mutateAsync({ username, password });
      toaster.create({
        title: 'Login successful',
        type: 'success',
      });
      // Redirect to the page they tried to visit or home
      navigate(from, { replace: true });
    } catch (error) {
      toaster.create({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Please try again',
        type: 'error',
      });
    }
  };

  return (
    <Container maxW="container.sm" py={10}>
      <Box
        p={8}
        borderWidth={1}
        borderRadius="lg"
        boxShadow="lg"
        bg="white"
      >
        <Box display="flex" flexDirection="column" gap={4}>
          <Heading textAlign="center" mb={6}>
            Login
          </Heading>
          <form onSubmit={handleSubmit}>
            <Box display="flex" flexDirection="column" gap={4}>
              <Box>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                />
              </Box>
              <Box>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </Box>
              <Button
                type="submit"
                colorScheme="blue"
                width="full"
                loading={loginMutation.isPending}
              >
                Sign In
              </Button>
            </Box>
          </form>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
