<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="就诊流水号" prop="ghlsh">
        <el-input
          v-model="queryParams.ghlsh"
          placeholder="请输入就诊流水号"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">查询</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 调试信息 -->
    <el-alert v-if="paymentItems.length > 0" title="数据加载成功" type="success" :closable="false" style="margin-bottom: 10px;">
      共找到 {{ paymentItems.length }} 条待缴费项目
    </el-alert>
    <el-alert v-else-if="!loading" title="暂无数据" type="warning" :closable="false" style="margin-bottom: 10px;">
      未找到待缴费项目，请检查就诊流水号是否正确
    </el-alert>

    <!-- 待缴费项目列表 -->
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>待缴费项目 ({{ paymentItems.length }} 项)</span>
        <el-button style="float: right; padding: 3px 0" type="text" icon="el-icon-refresh" @click="handleQuery">刷新</el-button>
      </div>
      
      <!-- 统计信息 -->
      <el-row :gutter="20" class="statistics">
        <el-col :span="8">
          <div class="stat-item">
            <div class="stat-label">总金额</div>
            <div class="stat-value">¥{{ totalAmount.toFixed(2) }}</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-item">
            <div class="stat-label">可兑换项目</div>
            <div class="stat-value">{{ canExchangeCount }} 项</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-item">
            <div class="stat-label">选中所需积分</div>
            <div class="stat-value">{{ totalPointsRequired }}</div>
          </div>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <el-table v-loading="loading" :data="paymentItems" @selection-change="handleSelectionChange"
                empty-text="暂无待缴费数据，请输入就诊流水号进行查询">
        <el-table-column type="selection" width="55" align="center" :selectable="checkSelectable" />
        <el-table-column label="HIS项目编码" align="center" prop="hisItemCode" width="150" />
        <el-table-column label="HIS项目名称" align="center" prop="hisItemName" show-overflow-tooltip />
        <el-table-column label="项目分类" align="center" prop="itemCategory" width="120" />
        <el-table-column label="金额" align="center" prop="amount" width="100">
          <template slot-scope="scope">
            ¥{{ (scope.row.amount * (scope.row.quantity || 1)).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="数量" align="center" prop="quantity" width="80" />
        <el-table-column label="可兑换" align="center" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.exchangeItemId ? 'success' : 'info'" size="small">
              {{ scope.row.exchangeItemId ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="兑换项目" align="center" prop="itemName" show-overflow-tooltip />
        <el-table-column label="所需积分" align="center" prop="pointsRequired" width="100" />
        <el-table-column label="患者信息" align="center" width="150">
          <template slot-scope="scope">
            <div>{{ scope.row.patientName }}</div>
            <div class="text-gray">{{ scope.row.patientId }}</div>
          </template>
        </el-table-column>
        <el-table-column label="科室/医生" align="center" width="150">
          <template slot-scope="scope">
            <div>{{ scope.row.departmentName }}</div>
            <div class="text-gray">{{ scope.row.doctorName }}</div>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 操作按钮 -->
      <div class="form-actions">
        <el-alert
          v-if="patientAccount && totalPointsRequired > patientAccount.availablePoints"
          :title="`积分不足！需要 ${formatPoints(totalPointsRequired)} 积分，可用 ${formatPoints(patientAccount.availablePoints)} 积分`"
          type="error"
          :closable="false"
          style="margin-bottom: 10px; text-align: left;"
        />
        <el-button type="primary" icon="el-icon-check" @click="handleExchange" :disabled="selectedItems.length === 0">
          确认兑换 ({{ selectedItems.length }} 项)
        </el-button>
        <el-button icon="el-icon-close" @click="resetQuery">取消</el-button>
      </div>
    </el-card>

    <!-- 患者积分信息 -->
    <el-card class="box-card" v-if="patientAccount">
      <div slot="header" class="clearfix">
        <span>患者积分账户</span>
      </div>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="患者ID">{{ patientAccount.patientId }}</el-descriptions-item>
        <el-descriptions-item label="患者姓名">{{ patientAccount.patientName }}</el-descriptions-item>
        <el-descriptions-item label="卡号">{{ patientAccount.cardNo }}</el-descriptions-item>
        <el-descriptions-item label="可用积分" label-class-name="highlight-label">
          <span class="highlight-value">{{ patientAccount.availablePoints }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="选中所需积分">
          <span :class="totalPointsRequired > patientAccount.availablePoints ? 'error-value' : 'success-value'">
            {{ formatPoints(totalPointsRequired) }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="兑换后余额">
          <span :class="totalPointsRequired > patientAccount.availablePoints ? 'error-value' : 'normal-value'">
            {{ formatPoints(patientAccount.availablePoints - totalPointsRequired) }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="冻结积分" :span="1">{{ patientAccount.frozenPoints }}</el-descriptions-item>
        <el-descriptions-item label="累计积分" :span="2">{{ patientAccount.totalPoints }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 兑换结果对话框 -->
    <el-dialog title="兑换结果" :visible.sync="resultDialogVisible" width="600px" :close-on-click-modal="false">
      <el-result :icon="exchangeResult.success ? 'success' : 'error'" :title="exchangeResult.success ? '兑换成功' : '兑换失败'" :sub-title="exchangeResult.message">
        <template slot="extra" v-if="exchangeResult.success">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="就诊流水号">{{ exchangeResult.ghlsh }}</el-descriptions-item>
            <el-descriptions-item label="HIS缴费单号">{{ exchangeResult.paymentNo }}</el-descriptions-item>
            <el-descriptions-item label="患者姓名">{{ exchangeResult.patientName }}</el-descriptions-item>
            <el-descriptions-item label="使用总积分">{{ exchangeResult.totalPointsUsed }}</el-descriptions-item>
            <el-descriptions-item label="兑换前积分">{{ exchangeResult.pointsBalanceBefore }}</el-descriptions-item>
            <el-descriptions-item label="兑换后积分">{{ exchangeResult.pointsBalanceAfter }}</el-descriptions-item>
            <el-descriptions-item label="总金额" :span="2">¥{{ exchangeResult.totalAmount }}</el-descriptions-item>
          </el-descriptions>
          
          <div style="margin-top: 20px;">
            <h4>兑换明细</h4>
            <el-table :data="exchangeResult.exchangeRecords" size="small">
              <el-table-column label="项目名称" prop="itemName" show-overflow-tooltip />
              <el-table-column label="使用积分" prop="pointsUsed" width="100" />
              <el-table-column label="金额" prop="amount" width="100">
                <template slot-scope="scope">¥{{ scope.row.amount }}</template>
              </el-table-column>
            </el-table>
          </div>
        </template>
      </el-result>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resultDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="resultDialogVisible = false; handleQuery()">继续查询</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { queryPaymentItemsWithExchange, exchangeWithHis } from "@/api/points/his-exchange"
import { getAccountByPatientId } from "@/api/points/account"

export default {
  name: "HisExchange",
  data() {
    return {
      // 显示搜索条件
      showSearch: true,
      // 遮罩层
      loading: false,
      // 查询参数
      queryParams: {
        ghlsh: '',
        patientId: ''
      },
      // 待缴费项目列表
      paymentItems: [],
      // 选中的项目
      selectedItems: [],
      // 患者账户信息
      patientAccount: null,
      // 兑换结果对话框
      resultDialogVisible: false,
      // 兑换结果
      exchangeResult: {
        success: false,
        message: '',
        ghlsh: '',
        patientId: '',
        patientName: '',
        totalPointsUsed: 0,
        pointsBalanceBefore: 0,
        pointsBalanceAfter: 0,
        totalAmount: 0,
        paymentNo: '',
        exchangeRecords: []
      }
    };
  },
  computed: {
    // 总金额
    totalAmount() {
      return this.paymentItems.reduce((sum, item) => {
        return sum + (item.amount || 0) * (item.quantity || 1);
      }, 0);
    },
    // 可兑换项目数量
    canExchangeCount() {
      return this.paymentItems.filter(item => item.exchangeItemId).length;
    },
    // 所需总积分（仅选中的可兑换项目）
    totalPointsRequired() {
      return this.selectedItems
        .filter(item => item.exchangeItemId)
        .reduce((sum, item) => {
          return sum + (item.pointsRequired || 0) * (item.quantity || 1);
        }, 0);
    }
  },
  methods: {
    /** 格式化积分显示（保留两位小数） */
    formatPoints(value) {
      if (value === null || value === undefined) return '0.00';
      return Number(value).toFixed(2);
    },
    /** 查询按钮操作 */
    handleQuery() {
      if (!this.queryParams.ghlsh) {
        this.$modal.msgError("请输入就诊流水号");
        return;
      }
      
      this.loading = true;
      queryPaymentItemsWithExchange(this.queryParams.ghlsh).then(response => {
        console.log('完整响应:', response);
        console.log('响应code:', response.code);
        console.log('响应data:', response.data);
        console.log('items:', response.data && response.data.items);
        
        // 后端返回结构：{code: 200, msg: "操作成功", data: {summary: {...}, items: [...]}}
        this.paymentItems = (response.code === 200 && response.data && response.data.items) || [];
        this.selectedItems = [];
        
        console.log('解析后的paymentItems:', this.paymentItems);
        console.log('paymentItems数量:', this.paymentItems.length);
        
        // 查询患者积分账户
        // 优先使用用户输入的patientId，如果没有则使用HIS查询结果中的patientId
        const patientIdToQuery = this.queryParams.patientId || 
          (this.paymentItems.length > 0 ? this.paymentItems[0].patientId : null);
        
        if (patientIdToQuery) {
          console.log('查询患者积分账户，患者ID:', patientIdToQuery);
          this.loadPatientAccount(patientIdToQuery);
        } else {
          console.log('未找到患者ID，无法查询积分账户');
          this.patientAccount = null;
        }
      }).catch(error => {
        console.error('查询失败:', error);
        this.$modal.msgError(error.message || "查询失败");
        this.paymentItems = [];
        this.patientAccount = null;
      }).finally(() => {
        this.loading = false;
      });
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams.ghlsh = '';
      this.queryParams.patientId = '';
      this.paymentItems = [];
      this.selectedItems = [];
      this.patientAccount = null;
    },
    /** 选择项目 */
    handleSelectionChange(selection) {
      this.selectedItems = selection;
    },
    /** 加载患者积分账户 */
    loadPatientAccount(patientId) {
      getAccountByPatientId(patientId).then(response => {
        this.patientAccount = response.data;
      }).catch(error => {
        this.$modal.msgError("查询患者积分账户失败：" + (error.message || "未知错误"));
        this.patientAccount = null;
      });
    },
    /** 检查是否可选 */
    checkSelectable(row) {
      // 只有可兑换的项目（exchangeItemId存在）才能勾选
      return !!row.exchangeItemId;
    },
    /** 兑换按钮操作 */
    handleExchange() {
      // 检查是否选中了项目
      if (this.selectedItems.length === 0) {
        this.$modal.msgError("请选择要兑换的项目");
        return;
      }

      // 检查患者积分账户是否存在
      if (!this.patientAccount) {
        this.$modal.msgError("患者积分账户不存在，无法兑换");
        return;
      }

      // 计算选中项目所需总积分
      const selectedTotalPoints = this.selectedItems.reduce((sum, item) => {
        return sum + (item.pointsRequired || 0) * (item.quantity || 1);
      }, 0);

      // 检查积分是否充足
      if (selectedTotalPoints > this.patientAccount.availablePoints) {
        this.$modal.msgError(
          `积分不足！\n当前可用积分：${this.formatPoints(this.patientAccount.availablePoints)}\n所需积分：${this.formatPoints(selectedTotalPoints)}\n缺口：${this.formatPoints(selectedTotalPoints - this.patientAccount.availablePoints)}`
        );
        return;
      }

      // 确认兑换
      this.$modal.confirm(
        `确认使用积分兑换以下项目吗？\n\n兑换项目数：${this.selectedItems.length} 项\n使用积分：${this.formatPoints(selectedTotalPoints)}\n当前可用积分：${this.formatPoints(this.patientAccount.availablePoints)}\n兑换后余额：${this.formatPoints(this.patientAccount.availablePoints - selectedTotalPoints)}`
      ).then(() => {
        this.performExchange();
      }).catch(() => {});
    },
    /** 执行兑换 */
    performExchange() {
      const exchangeRequest = {
        ghlsh: this.queryParams.ghlsh,
        items: this.selectedItems.map(item => ({
          id: item.id, // 视图ID（用于HIS接口presList.preNo）
          hisItemId: item.hisItemId,
          patientId: item.patientId,
          patientName: item.patientName,
          hisItemCode: item.hisItemCode,
          hisItemName: item.hisItemName,
          amount: item.amount,
          quantity: item.quantity || 1,
          exchangeItemId: item.exchangeItemId,
          itemCode: item.itemCode,
          itemName: item.itemName,
          pointsRequired: item.pointsRequired
        })),
        operatorId: this.$store.state.user.userId,
        operatorName: this.$store.state.user.userName
      };
      
      this.loading = true;
      exchangeWithHis(exchangeRequest).then(response => {
        this.loading = false;
        
        // 显示兑换结果
        this.exchangeResult = {
          success: true,
          message: '兑换成功',
          ghlsh: response.data.ghlsh,
          patientId: response.data.patientId,
          patientName: response.data.patientName,
          totalPointsUsed: response.data.totalPointsUsed,
          pointsBalanceBefore: response.data.pointsBalanceBefore,
          pointsBalanceAfter: response.data.pointsBalanceAfter,
          totalAmount: response.data.totalAmount,
          paymentNo: response.data.paymentNo,
          exchangeRecords: response.data.exchangeRecords
        };
        this.resultDialogVisible = true;
        
        this.$modal.msgSuccess("兑换成功");
      }).catch(error => {
        this.loading = false;
        
        // 显示失败结果
        this.exchangeResult = {
          success: false,
          message: error.message || "兑换失败"
        };
        this.resultDialogVisible = true;
      });
    }
  }
};
</script>

<style scoped>
.box-card {
  margin-top: 20px;
}

.statistics {
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.text-gray {
  color: #909399;
  font-size: 12px;
}

.form-actions {
  margin-top: 20px;
  text-align: center;
}

.highlight-label {
  color: #409EFF;
  font-weight: bold;
}

.highlight-value {
  color: #409EFF;
  font-size: 20px;
  font-weight: bold;
}

.success-value {
  color: #67C23A;
  font-size: 18px;
  font-weight: bold;
}

.error-value {
  color: #F56C6C;
  font-size: 18px;
  font-weight: bold;
}

.normal-value {
  color: #303133;
  font-size: 18px;
}
</style>
