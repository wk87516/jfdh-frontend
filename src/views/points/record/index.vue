<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="患者姓名" prop="patientName">
        <el-input v-model="queryParams.patientName" placeholder="请输入患者姓名" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="业务类型" prop="businessType">
        <el-select v-model="queryParams.businessType" placeholder="请选择业务类型" clearable>
          <el-option label="积分获得" value="1" />
          <el-option label="积分消费" value="2" />
          <el-option label="积分退回" value="3" />
          <el-option label="积分冻结" value="4" />
          <el-option label="积分解冻" value="5" />
        </el-select>
      </el-form-item>
      <el-form-item label="来源类型" prop="sourceType">
        <el-select v-model="queryParams.sourceType" placeholder="请选择来源类型" clearable>
          <el-option label="挂号" value="1" />
          <el-option label="缴费" value="2" />
          <el-option label="签约" value="3" />
          <el-option label="服务包" value="4" />
          <el-option label="项目兑换" value="5" />
          <el-option label="退费" value="6" />
        </el-select>
      </el-form-item>
      <el-form-item label="单据号" prop="sourceNo">
        <el-input v-model="queryParams.sourceNo" placeholder="请输入单据号" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="业务时间">
        <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="recordList">
      <el-table-column label="患者姓名" align="center" prop="patientName" width="100" />
      <el-table-column label="单据号" align="center" prop="sourceNo" width="150" />
      <el-table-column label="业务类型" align="center" prop="businessType" width="100">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.businessType === '1'" type="success">积分获得</el-tag>
          <el-tag v-else-if="scope.row.businessType === '2'" type="warning">积分消费</el-tag>
          <el-tag v-else-if="scope.row.businessType === '3'" type="info">积分退回</el-tag>
          <el-tag v-else-if="scope.row.businessType === '4'" type="danger">积分冻结</el-tag>
          <el-tag v-else-if="scope.row.businessType === '5'">积分解冻</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="来源类型" align="center" prop="sourceType" width="100">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.sourceType === '1'" type="info">挂号</el-tag>
          <el-tag v-else-if="scope.row.sourceType === '2'" type="primary">缴费</el-tag>
          <el-tag v-else-if="scope.row.sourceType === '3'" type="success">签约</el-tag>
          <el-tag v-else-if="scope.row.sourceType === '4'">服务包</el-tag>
          <el-tag v-else-if="scope.row.sourceType === '5'" type="warning">项目兑换</el-tag>
          <el-tag v-else-if="scope.row.sourceType === '6'" type="danger">退费</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="积分" align="center" width="100">
        <template slot-scope="scope">
          <span :class="scope.row.points > 0 ? 'text-success' : 'text-danger'">
            {{ scope.row.points > 0 ? '+' : '' }}{{ scope.row.points }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="变动前" align="center" prop="balanceBefore" width="100" />
      <el-table-column label="变动后" align="center" prop="balanceAfter" width="100" />
      <el-table-column label="项目金额" align="center" width="100">
        <template slot-scope="scope">
          <span v-if="scope.row.sourceType === '2'">{{ scope.row.projectAmount || '0.00' }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="药品金额" align="center" width="100">
        <template slot-scope="scope">
          <span v-if="scope.row.sourceType === '2'">{{ scope.row.drugAmount || '0.00' }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="规则名称" align="center" prop="ruleName" width="150" />
      <el-table-column label="科室" align="center" prop="departmentName" width="100" />
      <el-table-column label="业务时间" align="center" prop="bizTime" width="160">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.bizTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="80">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === '0'" type="success">正常</el-tag>
          <el-tag v-else-if="scope.row.status === '1'" type="info">已冲正</el-tag>
          <el-tag v-else-if="scope.row.status === '2'" type="warning">已冻结</el-tag>
          <el-tag v-else type="danger">已失效</el-tag>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />
  </div>
</template>

<script>
import { listRecord } from "@/api/points/record";

export default {
  name: "PointsRecord",
  data() {
    return {
      loading: true,
      showSearch: true,
      total: 0,
      recordList: [],
      dateRange: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        patientName: null,
        businessType: null,
        sourceType: null,
        sourceNo: null
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      this.loading = true;
      listRecord(this.queryParams).then(response => {
        this.recordList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    resetQuery() {
      this.resetForm("queryForm");
      this.dateRange = [];
      this.handleQuery();
    }
  }
};
</script>
