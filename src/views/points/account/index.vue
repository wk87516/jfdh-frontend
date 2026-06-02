<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="患者姓名" prop="patientName">
        <el-input v-model="queryParams.patientName" placeholder="请输入患者姓名" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="卡号" prop="cardNo">
        <el-input v-model="queryParams.cardNo" placeholder="请输入卡号" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="身份证号" prop="idCard">
        <el-input v-model="queryParams.idCard" placeholder="请输入身份证号" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option label="正常" value="0" />
          <el-option label="停用" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="accountList">
      <el-table-column label="患者ID" align="center" prop="patientId" width="120" />
      <el-table-column label="患者姓名" align="center" prop="patientName" width="100" />
      <el-table-column label="卡号" align="center" prop="cardNo" width="120" />
      <el-table-column label="累计积分" align="center" prop="totalPoints" width="100">
        <template slot-scope="scope">
          <span class="text-primary">{{ scope.row.totalPoints || 0 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="可用积分" align="center" prop="availablePoints" width="100">
        <template slot-scope="scope">
          <span class="text-success">{{ scope.row.availablePoints || 0 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="已用积分" align="center" prop="usedPoints" width="100">
        <template slot-scope="scope">
          <span class="text-warning">{{ scope.row.usedPoints || 0 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="冻结积分" align="center" prop="frozenPoints" width="100" />
      <el-table-column label="状态" align="center" prop="status" width="80">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === '0'" type="success">正常</el-tag>
          <el-tag v-else type="danger">停用</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="150">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="患者ID" prop="patientId">
              <el-input v-model="form.patientId" placeholder="请输入患者ID" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="患者姓名" prop="patientName">
              <el-input v-model="form.patientName" placeholder="请输入患者姓名" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="就诊卡号" prop="cardNo">
              <el-input v-model="form.cardNo" placeholder="请输入就诊卡号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="身份证号" prop="idCard">
              <el-input v-model="form.idCard" placeholder="请输入身份证号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio label="0">正常</el-radio>
                <el-radio label="1">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listAccount, getAccount, addAccount, updateAccount } from "@/api/points/account";

export default {
  name: "PointsAccount",
  data() {
    return {
      loading: true,
      showSearch: true,
      total: 0,
      accountList: [],
      title: "",
      open: false,
      form: {},
      rules: {
        patientId: [
          { required: true, message: "患者ID不能为空", trigger: "blur" }
        ],
        patientName: [
          { required: true, message: "患者姓名不能为空", trigger: "blur" }
        ]
      },
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        patientName: null,
        cardNo: null,
        idCard: null,
        status: null
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      this.loading = true;
      listAccount(this.queryParams).then(response => {
        this.accountList = response.rows;
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
      this.handleQuery();
    },
    handleAdd() {
      this.form = {
        status: "0",
        totalPoints: 0,
        usedPoints: 0,
        availablePoints: 0,
        frozenPoints: 0
      };
      this.title = "新增积分账户";
      this.open = true;
    },
    handleUpdate(row) {
      getAccount(row.id).then(response => {
        this.form = response.data;
        this.title = "修改积分账户";
        this.open = true;
      });
    },
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id) {
            updateAccount(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addAccount(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    cancel() {
      this.open = false;
    }
  }
};
</script>
