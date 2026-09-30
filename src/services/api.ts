import { AppSettings } from '../config/settings';
import { createHttpApi } from './httpApi';
import { createMockApi } from './mockApi';
import { DescribeApi } from './types';

/** Único ponto que decide entre mock e API real. */
export function createApi(settings: AppSettings): DescribeApi {
  return settings.useMock ? createMockApi(settings) : createHttpApi(settings);
}
