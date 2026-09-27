import { formatDateTime } from '../utils/format';

/** 泊位状态 */
export type BerthStatus = '空闲' | '占用' | '维修';

export const BERTH_STATUSES: BerthStatus[] = ['空闲', '占用', '维修'];

/** 泊位维护安排 */
export interface MaintenancePlan {
  /** 维护开始时间（ISO 字符串） */
  startAt: string;
  /** 维护结束时间（ISO 字符串） */
  endAt: string;
  /** 登记时间（ISO 字符串） */
  createdAt: string;
  /** 取消时间（ISO 字符串），未取消为 null */
  cancelledAt: string | null;
  /** 取消原因（取消时必填） */
  cancelReason: string | null;
}

/** 维护安排状态 */
export type MaintenanceState = '未开始' | '维护中' | '已结束' | '已取消';

/** 泊位占用记录 */
export interface Berth {
  id: string;
  /** 所属渔港 id */
  portId: string;
  /** 泊位号 */
  berthNo: string;
  /** 占用渔船 id */
  vesselId: string | null;
  /** 占用渔船名 */
  vesselName: string | null;
  /** 靠泊时间（ISO 字符串） */
  berthAt: string | null;
  /** 离泊时间（ISO 字符串） */
  leaveAt: string | null;
  /** 状态：空闲 / 占用 / 维修 */
  status: BerthStatus;
  /** 泊位设计水深 m */
  designDepth: number;
  /** 维护安排；进入时段后泊位按维修显示 */
  maintenance: MaintenancePlan | null;
}

/** 维护安排当前所处状态 */
export function maintenanceState(plan: MaintenancePlan, at: Date = new Date()): MaintenanceState {
  if (plan.cancelledAt) return '已取消';
  const t = at.getTime();
  if (t < new Date(plan.startAt).getTime()) return '未开始';
  if (t <= new Date(plan.endAt).getTime()) return '维护中';
  return '已结束';
}

/** 指定时刻是否处于维护时段内（已取消的安排不生效） */
export function isMaintenanceAt(berth: Berth, at: Date = new Date()): boolean {
  const plan = berth.maintenance;
  if (!plan || plan.cancelledAt) return false;
  return maintenanceState(plan, at) === '维护中';
}

/**
 * 泊位在指定时刻的生效状态：进入维护时段后一律按维修显示，
 * 未开始或已结束的安排不影响泊位原状态。
 */
export function effectiveBerthStatus(berth: Berth, at: Date = new Date()): BerthStatus {
  if (isMaintenanceAt(berth, at)) return '维修';
  return berth.status;
}

/**
 * 检查泊位在指定时间是否撞上维护安排，命中时返回带冲突时段的说明，否则返回 null。
 */
export function maintenanceConflictText(berth: Berth, time: string | Date): string | null {
  const plan = berth.maintenance;
  if (!plan || plan.cancelledAt) return null;
  const t = new Date(time).getTime();
  if (Number.isNaN(t)) return null;
  if (t >= new Date(plan.startAt).getTime() && t <= new Date(plan.endAt).getTime()) {
    return `泊位 ${berth.berthNo} 已安排维护（${formatDateTime(plan.startAt)} ~ ${formatDateTime(plan.endAt)}）`;
  }
  return null;
}

/** 泊位占用聚合结果（useBerthStatus 输出） */
export interface BerthSummary {
  portId: string;
  total: number;
  occupied: number;
  free: number;
  maintenance: number;
  /** 占用率 0-1 */
  occupancyRate: number;
  /** 在港船舶数量 */
  inPortCount: number;
  freeBerths: Berth[];
  occupiedBerths: Berth[];
}
