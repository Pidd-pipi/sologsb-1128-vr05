/** 泊位状态 */
export type BerthStatus = '空闲' | '占用' | '维修';

export const BERTH_STATUSES: BerthStatus[] = ['空闲', '占用', '维修'];

/** 泊位维护安排（计划施工窗口） */
export interface BerthMaintenance {
  /** 维护开始时间（ISO 字符串） */
  startAt: string;
  /** 维护结束时间（ISO 字符串） */
  endAt: string;
  /** 维护内容备注 */
  note: string;
  /** 登记时间（ISO 字符串） */
  createdAt: string;
  /** 取消时间（ISO 字符串），未取消为 null */
  cancelledAt: string | null;
  /** 取消原因（取消时必填） */
  cancelReason: string | null;
}

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
  /** 维护安排：未开始时照常使用，进入时段后按维修显示；无安排为 null */
  maintenance: BerthMaintenance | null;
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
