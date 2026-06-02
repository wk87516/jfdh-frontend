import request from '@/utils/request'

export function listUploadRecord(query) {
  return request({
    url: '/points/his-upload-record/list',
    method: 'get',
    params: query
  })
}

export function getUploadRecord(id) {
  return request({
    url: '/points/his-upload-record/' + id,
    method: 'get'
  })
}

export function delUploadRecord(id) {
  return request({
    url: '/points/his-upload-record/' + id,
    method: 'delete'
  })
}
