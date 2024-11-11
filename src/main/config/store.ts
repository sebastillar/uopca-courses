import { Course, StoreSchema } from '../../shared/types';

const store = {
  defaults: {
    courses: [] as Course[],
    lastSync: undefined,
    token: undefined,
  } as StoreSchema,
};

export default store;
