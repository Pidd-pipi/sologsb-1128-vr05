import { onScopeDispose, ref, type Ref } from 'vue';

/**
 * 响应式「当前时间」（毫秒时间戳），按间隔刷新。
 * 用于维护窗口等随时间推移而变化的派生状态（如泊位有效状态）。
 */
export function useNow(intervalMs = 30000): Ref<number> {
  const now = ref(Date.now());
  const timer = window.setInterval(() => {
    now.value = Date.now();
  }, intervalMs);
  onScopeDispose(() => window.clearInterval(timer));
  return now;
}
