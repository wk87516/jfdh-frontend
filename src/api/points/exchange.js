import request from '@/utils/request'

export function listExchangeItem(query) {
  return request({
    url: '/points/exchange/list',
    method: 'get',
    params: query
  })
}

export function getExchangeItem(id) {
  return request({
    url: '/points/exchange/' + id,
    method: 'get'
  })
}

export function addExchangeItem(data) {
  return request({
    url: '/points/exchange',
    method: 'post',
    data: data
  })
}

export function updateExchangeItem(data) {
  return request({
    url: '/points/exchange',
    method: 'put',
    data: data
  })
}

export function delExchangeItem(id) {
  return request({
    url: '/points/exchange/' + id,
    method: 'delete'
  })
}
