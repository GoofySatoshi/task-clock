// taskApi.js

import axios from 'axios';
import {BASE_URL} from "./index.js";
// 创建 axios 实例
const apiClient = axios.create({
  baseURL: `${BASE_URL}/task`, // 使用模板字符串
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * 任务管理 API 接口
 */
export const taskApi = {
  /**
   * 健康检查
   * @returns {Promise<Object>} 包含状态信息的响应
   */
  ping() {
    return apiClient.get('/ping');
  },

  /**
   * 获取所有任务列表
   * @returns {Promise<Array>} 任务列表
   */
  getAllTasks() {
    return apiClient.get('/list');
  },

  /**
   * 根据条件查询任务
   * @param {Object} queryReq - 查询条件对象
   * @returns {Promise<Array>} 符合条件的任务列表
   */
  queryTasks(queryReq) {
    return apiClient.post('/query', queryReq);
  },

  /**
   * 创建新任务
   * @param {Object} task - 任务对象
   * @returns {Promise<Object>} 创建结果
   */
  createTask(task) {
    return apiClient.post('/insert', task);
  },

  /**
   * 删除任务
   * @param {Number} id - 任务ID
   * @returns {Promise<Object>} 删除结果
   */
  deleteTask(id) {
    return apiClient.delete(`/delete/${id}`);
  },

  /**
   * 更新任务
   * @param {Object} task - 更新后的任务对象
   * @returns {Promise<Object>} 更新结果
   */
  updateTask(task) {
    return apiClient.put('/update', task);
  }
};

export default taskApi;
