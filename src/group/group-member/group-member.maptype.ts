import { CrudMapType } from '@@common/interfaces';
import { Prisma } from '@prisma/client';

export class GroupMemberMapType implements CrudMapType {
  aggregate: Prisma.GroupMemberAggregateArgs;
  count: Prisma.GroupMemberCountArgs;
  create: Prisma.GroupMemberCreateArgs;
  delete: Prisma.GroupMemberDeleteArgs;
  deleteMany: Prisma.GroupMemberDeleteManyArgs;
  findFirst: Prisma.GroupMemberFindFirstArgs;
  findMany: Prisma.GroupMemberFindManyArgs;
  findUnique: Prisma.GroupMemberFindUniqueArgs;
  update: Prisma.GroupMemberUpdateArgs;
  updateMany: Prisma.GroupMemberUpdateManyArgs;
  upsert: Prisma.GroupMemberUpsertArgs;
}
