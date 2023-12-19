import { CrudMapType } from '@@common/interfaces';
import { Prisma } from '@prisma/client';

export class EventMapType implements CrudMapType {
  aggregate: Prisma.EventAggregateArgs;
  count: Prisma.EventCountArgs;
  create: Prisma.EventCreateArgs;
  delete: Prisma.EventDeleteArgs;
  deleteMany: Prisma.EventDeleteManyArgs;
  findFirst: Prisma.EventFindFirstArgs;
  findMany: Prisma.EventFindManyArgs;
  findUnique: Prisma.EventFindUniqueArgs;
  update: Prisma.EventUpdateArgs;
  updateMany: Prisma.EventUpdateManyArgs;
  upsert: Prisma.EventUpsertArgs;
}
