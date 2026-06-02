import request from '@/utils/request'

/**
 * 根据GHLSH查询待缴费项目
 */
export function queryPaymentItems(ghlsh) {
  return request({
    url: `/points/his-exchange/query/${ghlsh}`,
    method: 'get',
    headers: { isToken: false } // 不需要token，直接供HIS系统调用
  })
}

/**
 * 查询待缴费项目（带可兑换项目匹配）
 */
export function queryPaymentItemsWithExchange(ghlsh) {
  return request({
    url: `/points/his-exchange/query-with-exchange/${ghlsh}`,
    method: 'get',
    headers: { isToken: false } // 不需要token，直接供HIS系统调用
  })
}

/**
 * HIS积分兑换
 */
export function exchangeWithHis(data) {
  return request({
    url: '/points/his-exchange/exchange',
    method: 'post',
    data: data,
    headers: { isToken: false } // 不需要token，直接供HIS系统调用
  })
}
