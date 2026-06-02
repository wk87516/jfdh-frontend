import request from '@/utils/request'

export function listRecord(query) {
  return request({
    url: '/points/record/list',
    method: 'get',
    params: query
  })
}

export function getRecord(id) {
  return request({
    url: '/points/record/' + id,
    method: 'get'
  })
}
