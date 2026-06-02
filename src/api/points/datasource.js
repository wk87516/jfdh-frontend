import request from '@/utils/request'

// 查询数据源配置列表
export function listConfig(query) {
  return request({
    url: '/points/datasource/list',
    method: 'get',
    params: query
  })
}

// 查询数据源配置详细
export function getConfig(id) {
  return request({
    url: '/points/datasource/' + id,
    method: 'get'
  })
}

// 新增数据源配置
export function addConfig(data) {
  return request({
    url: '/points/datasource',
    method: 'post',
    data: data
  })
}

// 修改数据源配置
export function updateConfig(data) {
  return request({
    url: '/points/datasource',
    method: 'put',
    data: data
  })
}

// 删除数据源配置
export function delConfig(id) {
  return request({
    url: '/points/datasource/' + id,
    method: 'delete'
  })
}

// 测试数据源连接
export function testConnection(id) {
  return request({
    url: '/points/datasource/test/' + id,
    method: 'post'
  })
}