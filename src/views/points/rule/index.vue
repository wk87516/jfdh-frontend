<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="规则名称" prop="ruleName">
        <el-input v-model="queryParams.ruleName" placeholder="请输入规则名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="规则类型" prop="ruleType">
        <el-select v-model="queryParams.ruleType" placeholder="请选择规则类型" clearable>
          <el-option label="挂号积分" value="1" />
          <el-option label="缴费积分" value="2" />
          <el-option label="签约积分" value="3" />
          <el-option label="服务包积分" value="4" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option label="启用" value="0" />
          <el-option label="禁用" value="1" />
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

    <el-table v-loading="loading" :data="ruleList">
      <el-table-column label="规则编码" align="center" prop="ruleCode" width="150" />
      <el-table-column label="规则名称" align="center" prop="ruleName" width="150" />
      <el-table-column label="规则类型" align="center" prop="ruleType" width="100">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.ruleType === '1'" type="info">挂号积分</el-tag>
          <el-tag v-else-if="scope.row.ruleType === '2'" type="primary">缴费积分</el-tag>
          <el-tag v-else-if="scope.row.ruleType === '3'" type="success">签约积分</el-tag>
          <el-tag v-else type="warning">服务包积分</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="科室类型" align="center" prop="departmentType" width="100">
        <template slot-scope="scope">
          <span v-if="!scope.row.departmentType">不限</span>
          <el-tag v-else-if="scope.row.departmentType === 'general'" type="info">普通科室</el-tag>
          <el-tag v-else-if="scope.row.departmentType === 'special'" type="warning">特殊科室</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="积分比例" align="center" width="100">
        <template slot-scope="scope">
          <span v-if="scope.row.pointsRate">{{ (scope.row.pointsRate * 100).toFixed(0) }}%</span>
          <span v-else-if="scope.row.fixedPoints">{{ scope.row.fixedPoints }}分</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="包含药品" align="center" prop="isIncludeDrug" width="90">
        <template slot-scope="scope">
          <el-tag :type="scope.row.isIncludeDrug === 'Y' ? 'danger' : 'info'">
            {{ scope.row.isIncludeDrug === 'Y' ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="优先级" align="center" prop="priority" width="80" />
      <el-table-column label="状态" align="center" prop="status" width="80">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.status" active-value="0" inactive-value="1" @change="handleStatusChange(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="120">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="title" :visible.sync="open" width="700px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="规则编码" prop="ruleCode">
              <el-input v-model="form.ruleCode" placeholder="请输入规则编码" :disabled="!!form.id" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="规则名称" prop="ruleName">
              <el-input v-model="form.ruleName" placeholder="请输入规则名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="规则类型" prop="ruleType">
              <el-select v-model="form.ruleType" placeholder="请选择规则类型">
                <el-option label="挂号积分" value="1" />
                <el-option label="缴费积分" value="2" />
                <el-option label="签约积分" value="3" />
                <el-option label="服务包积分" value="4" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="来源系统" prop="sourceSystem">
              <el-select v-model="form.sourceSystem" placeholder="请选择来源系统">
                <el-option label="HIS" value="1" />
                <el-option label="公卫" value="2" />
                <el-option label="自定义" value="3" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="form.ruleType === '2'">
          <el-col :span="12">
            <el-form-item label="科室类型">
              <el-select v-model="form.departmentType" placeholder="请选择科室类型">
                <el-option label="不限" :value="undefined" />
                <el-option label="普通科室" value="general" />
                <el-option label="特殊科室" value="special" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否包含药品">
              <el-switch v-model="form.isIncludeDrug" active-value="Y" inactive-value="N" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="积分比例">
              <el-input-number v-model="form.pointsRate" :min="0" :max="1" :step="0.1" :precision="4" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="固定积分">
              <el-input-number v-model="form.fixedPoints" :min="0" :precision="2" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="优先级">
              <el-input-number v-model="form.priority" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio label="0">启用</el-radio>
                <el-radio label="1">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
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
import { listRule, getRule, addRule, updateRule, delRule, changeRuleStatus } from "@/api/points/rule";

export default {
  name: "PointsRule",
  data() {
    return {
      loading: true,
      showSearch: true,
      total: 0,
      ruleList: [],
      title: "",
      open: false,
      form: {},
      rules: {
        ruleCode: [
          { required: true, message: "规则编码不能为空", trigger: "blur" }
        ],
        ruleName: [
          { required: true, message: "规则名称不能为空", trigger: "blur" }
        ],
        ruleType: [
          { required: true, message: "规则类型不能为空", trigger: "change" }
        ],
        sourceSystem: [
          { required: true, message: "来源系统不能为空", trigger: "change" }
        ]
      },
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        ruleName: null,
        ruleType: null,
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
      listRule(this.queryParams).then(response => {
        this.ruleList = response.rows;
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
        priority: 0,
        pointsRate: 0.5,
        isIncludeDrug: "N"
      };
      this.title = "新增积分规则";
      this.open = true;
    },
    handleUpdate(row) {
      getRule(row.id).then(response => {
        this.form = response.data;
        this.title = "修改积分规则";
        this.open = true;
      });
    },
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id) {
            updateRule(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addRule(this.form).then(response => {
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
    },
    handleDelete(row) {
      const ids = row.id;
      this.$modal.confirm('是否确认删除积分规则【' + row.ruleName + '】？').then(function() {
        return delRule(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    handleStatusChange(row) {
      let text = row.status === "0" ? "启用" : "禁用";
      this.$modal.confirm('确认要' + text + '【' + row.ruleName + '】积分规则吗？').then(function() {
        return changeRuleStatus(row.id, row.status);
      }).then(() => {
        this.$modal.msgSuccess(text + "成功");
      }).catch(() => {
        row.status = row.status === "0" ? "1" : "0";
      });
    }
  }
};
</script>
