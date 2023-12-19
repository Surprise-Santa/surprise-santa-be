export enum ResponseMessage {
  SUCCESS = 'Request Successful',
  FAILED = 'Request Failed',
}

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other',
}

export enum ApiTag {
  GROUP = 'Groups',
  EVENT = 'Events',
  SETTING = 'Settings',
  MEMBER = 'Group Members',
}

export interface Delegate {
  aggregate(data: unknown): unknown;
  count(data: unknown): any;
  create(data: unknown): unknown;
  createMany(data: unknown): unknown;
  delete(data: unknown): unknown;
  deleteMany(data: unknown): unknown;
  findFirst(data: unknown): any;
  findMany(data: unknown): any;
  findUnique(data: unknown): unknown;
  update(data: unknown): unknown;
  updateMany(data: unknown): unknown;
  upsert(data: unknown): unknown;
}

export interface CrudMapType {
  aggregate: unknown;
  count: unknown;
  create: unknown | any;
  createMany?: unknown;
  delete: unknown;
  deleteMany: unknown;
  findFirst: unknown;
  findMany: unknown;
  findUnique: unknown;
  update: unknown;
  updateMany: unknown;
  upsert: unknown;
}

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}
