import { defineStore } from "pinia";
import _ from "lodash";
import gamedata from "@/api/gamedata";

export interface TaskState {
  deviceTasks: Record<string, Task[]>;
}

export interface TaskAction {
  updateTaskStatus(
    uuid: string,
    taskId: string,
    status: TaskStatus,
    progress: number
  ): void;
  changeTaskOrder(uuid: string, from: number, to: number): void;
  updateTask(uuid: string, tasks: Task[]): void;
  newTask(uuid: string): void;
  getTask(uuid: string, taskId: string): any;
  getTaskProcess(uuid: string, taskId: string): number | undefined;
  stopAllTasks(uuid: string): void;
}

export const defaultTask: Task[] = [
  {
    id: "emulator",
    title: "启动模拟器 - 暂不支持",
    status: "idle",
    enable: false,
    configurations: {
      emulator_path: "", // 模拟器路径
      arg: "", //启动参数, 用于启动指定模拟器
      //adb_path: "",
      delay: 300, // 执行后续任务的等待延迟
    },
  },
  {
    id: "game",
    title: "启动明日方舟 - 暂不支持",
    status: "idle",
    enable: false,
    configurations: {
      server:"CN",
    },
  },
  {
    id: "startup",
    title: "开始唤醒",
    status: "idle",

    enable: true,
    configurations: {
      //server: "CN_OFFICIAL",
    },
  },
  {
    id: "fight",
    title: "刷理智",
    status: "idle",
    enable: true,
    configurations: {
      medicine: 0,
      stone: 0,
      originite_prime: true,
      levels: [
        {
          code: "CE-5", // 龙门币
          times: 0
        },
        {
          code: "AP-5", // 红票
          times: 0
        },
        {
          code: "CA-5", // 技能书
          times: 0
        },
        {
          code: "LS-5", // 作 战 记 录
          times: 0
        },
      ],
      special: {
        type: "current",
        times: 0,
      },
    },
  },
  {
    id: "recruit",
    title: "自动公招",
    status: "idle",
    enable: true,
    configurations: {
      refresh_normal_tags: true,
      use_expedited_plan: false,
      maximum_times_of_recruitments: 6,
      recognitions: {
        "3 Stars": true,
        "4 Stars": true,
        "5 Stars": true,
      },
    },
  },
  {
    id: "infrast",
    title: "基建换班",
    status: "idle",
    enable: true,
    configurations: {
      facilities: [
        {
          name: "ManufacturingStation",
          enabled: true,
        },
        {
          name: "TradingStation",
          enabled: true,
        },
        {
          name: "ControlCenter",
          enabled: true,
        },
        {
          name: "PowerStation",
          enabled: true,
        },
        {
          name: "MeetingRoom",
          enabled: true,
        },
        {
          name: "Office",
          enabled: true,
        },
        {
          name: "Dormitory",
          enabled: true,
        },
      ],
      drone_usage: "None",
      mood_limit: 6,
    },
  },
  {
    id: "visit",
    title: "访问好友",
    status: "idle",
    enable: true,
    configurations: {},
  },
  {
    id: "mall",
    title: "收取信用及购物",
    status: "idle",
    enable: true,
    configurations: {
      exclude: new Set([]),
    },
  },
  {
    id: "award",
    title: "领取日常奖励",
    status: "idle",
    enable: true,
    configurations: {},
  },
  {
    id: "rogue",
    title: "无限刷肉鸽 - 暂不支持",
    status: "idle",
    enable: true,
    configurations: {
      duration: 3600,
      strategy: "ToTheEnd",
      operators: [],
    },
  },
  {
    id: "shutdown",
    title: "关机/关闭模拟器 - 暂不支持",
    status: "idle",
    enable: false,
    configurations: {
      option : "shutdownComputer",
      delay : 300,
    },
  },
];

const useTaskStore = defineStore<"tasks", TaskState, {}, TaskAction>("tasks", {
  state: () => {
    return {
      deviceTasks: {},
    };
  },
  actions: {
    updateTaskStatus(uuid, taskId, status, progress) {
      const { deviceTasks } = this;
      const origin = deviceTasks[uuid];
      const task = origin?.find((task) => task.id === taskId);
      if (task) {
        const statusChanged = status === task.status;

        if (statusChanged) {
          switch (status) {
            case "processing":
              task.startTime = Date.now();
              break;
            case "success":
            case "exception":
              task.endTime = Date.now();
              break;
          }
        }

        task.status = status;
        task.progress = progress;
      }
    },
    changeTaskOrder(uuid, from, to) {
      const { deviceTasks } = this;
      const origin = deviceTasks[uuid];
      if (origin) {
        const item = origin.splice(from, 1);
        origin.splice(to, 0, item[0]);
      }
    },
    updateTask(uuid, tasks) {
      const { deviceTasks } = this;
      deviceTasks[uuid] = tasks;
    },
    newTask(uuid) {
      const { deviceTasks } = this;
      deviceTasks[uuid] = defaultTask;
    },
    getTask(uuid, taskId) {
      const { deviceTasks } = this;
      const origin = deviceTasks[uuid];
      const task = origin?.find((task) => task.id === taskId);
      return task ? task : {};
    },
    getTaskProcess(uuid, taskId) {
      const { deviceTasks } = this;
      const origin = deviceTasks[uuid];
      const task = origin?.find((task) => task.id === taskId);
      return task ? task.progress : 0;
    },
    stopAllTasks(uuid) {
      const { deviceTasks } = this;
      const origin = deviceTasks[uuid];
      if (origin) {
        origin.forEach((task) => {
          task.status = "idle";
        });
      }
    },
  },
});

export default useTaskStore;
