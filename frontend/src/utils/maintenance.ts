import type { Berth, BerthMaintenance, BerthStatus } from '../types/berth';

/** 维护安排所处阶段 */
export type MaintenancePhase = '未开始' | '进行中' | '已结束' | '已取消';

function toTime(iso: string): number {
  return new Date(iso).getTime();
}

function atTime(at: Date | number): number {
  return typeof at === 'number' ? at : at.getTime();
}

/** 维护安排在指定时刻所处的阶段；无安排或时间非法时返回 null */
export function maintenancePhase(
  maintenance: BerthMaintenance | null | undefined,
  at: Date | number = new Date(),
): MaintenancePhase | null {
  if (!maintenance) return null;
  if (maintenance.cancelledAt) return '已取消';
  const start = toTime(maintenance.startAt);
  const end = toTime(maintenance.endAt);
  if (Number.isNaN(start) || Number.isNaN(end)) return null;
  const t = atTime(at);
  if (t < start) return '未开始';
  if (t > end) return '已结束';
  return '进行中';
}

/** 维护窗口是否覆盖指定时刻 */
export function isMaintenanceActive(
  maintenance: BerthMaintenance | null | undefined,
  at: Date | number = new Date(),
): boolean {
  return maintenancePhase(maintenance, at) === '进行中';
}

/**
 * 泊位在指定时刻的有效状态：进入维护窗口后一律按「维修」显示，
 * 窗口未开始或已结束则回落到泊位当前状态。
 */
export function effectiveBerthStatus(berth: Berth, at: Date | number = new Date()): BerthStatus {
  if (berth.status !== '维修' && isMaintenanceActive(berth.maintenance, at)) return '维修';
  return berth.status;
}

/**
 * 进出港登记冲突检查：所选时间落在未取消的维护窗口内时返回该安排，否则为 null。
 */
export function maintenanceConflict(berth: Berth, time: string | Date): BerthMaintenance | null {
  const m = berth.maintenance;
  if (!m || m.cancelledAt) return null;
  const t = time instanceof Date ? time.getTime() : toTime(time);
  if (Number.isNaN(t)) return null;
  const start = toTime(m.startAt);
  const end = toTime(m.endAt);
  if (Number.isNaN(start) || Number.isNaN(end)) return null;
  return t >= start && t <= end ? m : null;
}
