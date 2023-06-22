// const { PrismaClient } = require('@prisma/client');

// const prisma = new PrismaClient();

// async function fetchData() {
//   try {
//     const name = 'John';
//     const age = 30;

//     const result = await prisma.$queryRaw(
//       'SELECT * FROM rawQuery WHERE name = $1 AND age = $2',
//       name,
//       age
//     );

//     // Process the result or perform other operations
//     console.log(result);
//   } catch (error) {
//     console.error('Error executing raw query:', error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// fetchData();
