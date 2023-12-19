import { CrudMapType } from '@@common/interfaces';
import { Prisma } from '@prisma/client';

export class GroupMapType implements CrudMapType {
  aggregate: Prisma.GroupAggregateArgs;
  count: Prisma.GroupCountArgs;
  create: Prisma.GroupCreateArgs;
  delete: Prisma.GroupDeleteArgs;
  deleteMany: Prisma.GroupDeleteManyArgs;
  findFirst: Prisma.GroupFindFirstArgs;
  findMany: Prisma.GroupFindManyArgs;
  findUnique: Prisma.GroupFindUniqueArgs;
  update: Prisma.GroupUpdateArgs;
  updateMany: Prisma.GroupUpdateManyArgs;
  upsert: Prisma.GroupUpsertArgs;
}
