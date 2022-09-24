import { Box, Heading, Text } from '@chakra-ui/react';

export default function About() {
  return (
    <Box>
      <Heading>About</Heading>
      <Text>
        Built with Next.js and Chakra-UI with TRPC and Prisma stored on
        Planetscale.
      </Text>
      <Text>Rankings are calculated using the Bradley-Terry model.</Text>
    </Box>
  );
}
