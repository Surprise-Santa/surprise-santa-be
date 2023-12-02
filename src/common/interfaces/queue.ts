import {
  OnQueueActive,
  OnQueueEvent,
  BullQueueEvents,
  OnQueueError,
  OnQueueFailed,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

export abstract class QueueProcessor {
  protected abstract logger: Logger;

  @OnQueueError()
  async errorHandler(error: Error) {
    console.log('fired exception', error);
    this.logger.error('fired exception', error);
  }

  @OnQueueFailed()
  async jobErrorHandler(job: Job, error: Error) {
    this.logger.error('job exception occurred...', job, error);
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(
      `Processing job ${job.id} of type ${
        job.name
      } with data \n ${JSON.stringify(job.data, null, 2)}...`,
    );
  }

  @OnQueueEvent(BullQueueEvents.COMPLETED)
  onCompleted(job: Job) {
    this.logger.log(
      `Completed job ${job.id} of type ${job.name} with result ${JSON.stringify(
        job.returnvalue,
        null,
        2,
      )}`,
    );
  }
}
