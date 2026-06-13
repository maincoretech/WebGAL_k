import { hexzText } from '@/Core/util/hexzFetch';

/** 获取场景原始文本 */
export const sceneFetcher = (sceneUrl: string): Promise<string> => hexzText(sceneUrl);
