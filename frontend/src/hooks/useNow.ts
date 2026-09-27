import { onScopeDispose, ref, type Ref } from 'vue';

/**
 * 以固定间隔刷新的当前时间，供维护时段等随时间变化的派生状态使用。
 * 默认 30 秒刷新一次，组件卸载时自动清理定时器。
 */
export function useNow(intervalMs = 30000): Ref<Date> {
  const now = ref(new Date());
  const timer = window.setInterval(() => {
    now.value = new Date();
  }, intervalMs);
  onScopeDispose(() => window.clearInterval(timer));
  return now;
}
