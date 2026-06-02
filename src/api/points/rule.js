import request from '@/utils/request'

export function listRule(query) {
  return request({
    url: '/points/rule/list',
    method: 'get',
    params: query
  })
}

export function getRule(id) {
  return request({
    url: '/points/rule/' + id,
    method: 'get'
  })
}

export function getRuleOptions() {
  return request({
    url: '/points/rule/options',
    method: 'get'
  })
}

export function addRule(data) {
  return request({
    url: '/points/rule',
    method: 'post',
    data: data
  })
}

export function updateRule(data) {
  return request({
    url: '/points/rule',
    method: 'put',
    data: data
  })
}

export function delRule(id) {
  return request({
    url: '/points/rule/' + id,
    method: 'delete'
  })
}

export function changeRuleStatus(id, status) {
  return request({
    url: '/points/rule/changeStatus',
    method: 'put',
    data: { id, status }
  })
}
