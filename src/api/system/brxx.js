import request from '@/utils/request'

// 查询患者信息列表
export function listBrxx(query) {
  return request({
    url: '/system/brxx/list',
    method: 'get',
    params: query
  })
}

// 查询患者信息详细
export function getBrxx(sfzh) {
  return request({
    url: '/system/brxx/' + sfzh,
    method: 'get'
  })
}

// 新增患者信息
export function addBrxx(data) {
  return request({
    url: '/system/brxx',
    method: 'post',
    data: data
  })
}

// 修改患者信息
export function updateBrxx(data) {
  return request({
    url: '/system/brxx',
    method: 'put',
    data: data
  })
}

// 删除患者信息
export function delBrxx(sfzh) {
  return request({
    url: '/system/brxx/' + sfzh,
    method: 'delete'
  })
}
