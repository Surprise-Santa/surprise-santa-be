import { CrudMapType } from '@@common/interfaces';
import { Prisma } from '@prisma/client';

export class EventParticipantMapType implements CrudMapType {
  aggregate: Prisma.EventParticipantAggregateArgs;
  count: Prisma.EventParticipantCountArgs;
  create: Prisma.EventParticipantCreateArgs;
  delete: Prisma.EventParticipantDeleteArgs;
  deleteMany: Prisma.EventParticipantDeleteManyArgs;
  findFirst: Prisma.EventParticipantFindFirstArgs;
  findMany: Prisma.EventParticipantFindManyArgs;
  findUnique: Prisma.EventParticipantFindUniqueArgs;
  update: Prisma.EventParticipantUpdateArgs;
  updateMany: Prisma.EventParticipantUpdateManyArgs;
  upsert: Prisma.EventParticipantUpsertArgs;
}
