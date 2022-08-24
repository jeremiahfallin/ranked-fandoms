import { Flex, Heading, Text } from '@chakra-ui/react';
import Link from 'next/link';

export default function Header() {
  return (
    <Flex
      direction="row"
      p={4}
      justifyContent="space-between"
      alignItems="center"
    >
      <Heading>Rank It!</Heading>
      <Text fontWeight={500}>
        <Link href="/">Home</Link>
      </Text>
    </Flex>
  );
}