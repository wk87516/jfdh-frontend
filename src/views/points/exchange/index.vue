<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="项目名称" prop="itemName">
        <el-input v-model="queryParams.itemName" placeholder="请输入项目名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="项目类型" prop="itemType">
        <el-select v-model="queryParams.itemType" placeholder="请选择项目类型" clearable>
          <el-option label="检验" value="1" />
          <el-option label="检查" value="2" />
          <el-option label="治疗" value="3" />
          <el-option label="药品" value="4" />
          <el-option label="其他" value="5" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="isActive">
        <el-select v-model="queryParams.isActive" placeholder="请选择状态" clearable>
          <el-option label="启用" value="Y" />
          <el-option label="禁用" value="N" />
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

    <el-table v-loading="loading" :data="exchangeList">
      <el-table-column label="项目编码" align="center" prop="itemCode" width="150" />
      <el-table-column label="项目名称" align="center" prop="itemName" width="200" />
      <el-table-column label="项目类型" align="center" prop="itemType" width="100">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.itemType === '1'" type="info">检验</el-tag>
          <el-tag v-else-if="scope.row.itemType === '2'" type="primary">检查</el-tag>
          <el-tag v-else-if="scope.row.itemType === '3'" type="success">治疗</el-tag>
          <el-tag v-else-if="scope.row.itemType === '4'" type="danger">药品</el-tag>
          <el-tag v-else>其他</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="所需积分" align="center" prop="pointsRequired" width="100" />
      <el-table-column label="参考金额" align="center" prop="amount" width="100" />
      <el-table-column label="专属项目" align="center" prop="isExclusive" width="90">
        <template slot-scope="scope">
          <el-tag :type="scope.row.isExclusive === 'Y' ? 'danger' : 'info'">
            {{ scope.row.isExclusive === 'Y' ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="库存" align="center" width="80">
        <template slot-scope="scope">
          <span v-if="scope.row.stockQuantity === -1">不限</span>
          <span v-else>{{ scope.row.stockRemaining || scope.row.stockQuantity }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="isActive" width="80">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.isActive" active-value="Y" inactive-value="N" @change="handleStatusChange(scope.row)" />
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

    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="项目编码" prop="itemCode">
              <el-input v-model="form.itemCode" placeholder="请输入项目编码" :disabled="!!form.id" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="项目名称" prop="itemName">
              <el-input v-model="form.itemName" placeholder="请输入项目名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="项目类型" prop="itemType">
              <el-select v-model="form.itemType" placeholder="请选择项目类型">
                <el-option label="检验" value="1" />
                <el-option label="检查" value="2" />
                <el-option label="治疗" value="3" />
                <el-option label="药品" value="4" />
                <el-option label="其他" value="5" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所需积分" prop="pointsRequired">
              <el-input-number v-model="form.pointsRequired" :min="0" :precision="2" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="参考金额">
              <el-input-number v-model="form.amount" :min="0" :precision="2" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="专属项目">
              <el-switch v-model="form.isExclusive" active-value="Y" inactive-value="N" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="库存数量">
              <el-input-number v-model="form.stockQuantity" :min="-1" placeholder="-1表示不限" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.isActive">
                <el-radio label="Y">启用</el-radio>
                <el-radio label="N">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="HIS编码">
          <el-input v-model="form.hisItemCodes" placeholder="多个用逗号分隔" />
        </el-form-item>
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
import { listExchangeItem, addExchangeItem, updateExchangeItem, delExchangeItem } from "@/api/points/exchange";

export default {
  name: "PointsExchange",
  data() {
    return {
      loading: true,
      showSearch: true,
      total: 0,
      exchangeList: [],
      title: "",
      open: false,
      form: {},
      rules: {
        itemCode: [
          { required: true, message: "项目编码不能为空", trigger: "blur" }
        ],
        itemName: [
          { required: true, message: "项目名称不能为空", trigger: "blur" }
        ],
        itemType: [
          { required: true, message: "项目类型不能为空", trigger: "change" }
        ],
        pointsRequired: [
          { required: true, message: "所需积分不能为空", trigger: "blur" }
        ]
      },
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        itemName: null,
        itemType: null,
        isActive: null
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      this.loading = true;
      listExchangeItem(this.queryParams).then(response => {
        this.exchangeList = response.rows;
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
        isExclusive: "Y",
        isActive: "Y",
        stockQuantity: -1,
        sortOrder: 0
      };
      this.title = "新增兑换项目";
      this.open = true;
    },
    handleUpdate(row) {
      this.form = Object.assign({}, row);
      this.title = "修改兑换项目";
      this.open = true;
    },
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id) {
            updateExchangeItem(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addExchangeItem(this.form).then(response => {
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
      const id = row.id;
      this.$modal.confirm('是否确认删除兑换项目【' + row.itemName + '】？').then(function() {
        return delExchangeItem(id);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    handleStatusChange(row) {
      let text = row.isActive === "Y" ? "启用" : "禁用";
      this.$modal.confirm('确认要' + text + '【' + row.itemName + '】兑换项目吗？').then(() => {
        this.$modal.msgSuccess(text + "成功");
      }).catch(() => {
        row.isActive = row.isActive === "Y" ? "N" : "Y";
      });
    }
  }
};
</script>
