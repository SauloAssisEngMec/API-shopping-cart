import * as mongoose from 'mongoose';

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: (): Promise<typeof mongoose> => {
      const databaseUrl = process.env.DATABASE_URL;

      if (!databaseUrl) {
        throw new Error(
          'DATABASE_URL não está definida nas variáveis de ambiente.',
        );
      }

      return mongoose.connect(databaseUrl);
    },
  },
];
