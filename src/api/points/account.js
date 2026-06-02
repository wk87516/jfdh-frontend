import request from '@/utils/request'

export function listAccount(query) {
  return request({
    url: '/points/account/list',
    method: 'get',
    params: query
  })
}

export function getAccount(id) {
  return request({
    url: '/points/account/' + id,
    method: 'get'
  })
}

export function getAccountByPatientId(patientId) {
  return request({
    url: '/points/account/patient/' + patientId,
    method: 'get',
    headers: { isToken: false } // 不需要token，直接供HIS系统调用
  })
}

export function addAccount(data) {
  return request({
    url: '/points/account',
    method: 'post',
    data: data
  })
}

export function updateAccount(data) {
  return request({
    url: '/points/account',
    method: 'put',
    data: data
  })
}

export function delAccount(id) {
  return request({
    url: '/points/account/' + id,
    method: 'delete'
  })
}

export function getAccountRecords(accountId, query) {
  return request({
    url: '/points/account/records/' + accountId,
    method: 'get',
    params: query
  })
}

export function getPatientRecords(patientId, query) {
  return request({
    url: '/points/account/records/patient/' + patientId,
    method: 'get',
    params: query
  })
}
