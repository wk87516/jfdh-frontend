<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="90px">
      <el-form-item label="业务类型" prop="businessType">
        <el-select v-model="queryParams.businessType" placeholder="请选择业务类型" clearable>
          <el-option label="药品目录" value="catalog" />
          <el-option label="全量库存" value="inventory" />
          <el-option label="增量库存" value="increment" />
        </el-select>
      </el-form-item>
      <el-form-item label="业务主键" prop="businessKey">
        <el-input v-model="queryParams.businessKey" placeholder="请输入业务主键" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="上传状态" prop="uploadStatus">
        <el-select v-model="queryParams.uploadStatus" placeholder="请选择上传状态" clearable>
          <el-option label="待上传" value="0" />
          <el-option label="上传成功" value="1" />
          <el-option label="上传失败" value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间">
        <el-date-picker
          v-model="dateRange"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['points:hisUploadRecord:remove']">删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="recordList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="记录ID" align="center" prop="id" width="80" />
      <el-table-column label="业务类型" align="center" prop="businessType" width="100">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.businessType === 'catalog'" type="success">药品目录</el-tag>
          <el-tag v-else-if="scope.row.businessType === 'inventory'" type="primary">全量库存</el-tag>
          <el-tag v-else-if="scope.row.businessType === 'increment'" type="warning">增量库存</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="业务主键" align="center" prop="businessKey" width="150" :show-overflow-tooltip="true" />
      <el-table-column label="上传状态" align="center" prop="uploadStatus" width="100">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.uploadStatus === '0'" type="info">待上传</el-tag>
          <el-tag v-else-if="scope.row.uploadStatus === '1'" type="success">上传成功</el-tag>
          <el-tag v-else-if="scope.row.uploadStatus === '2'" type="danger">上传失败</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="失败次数" align="center" prop="failCount" width="90" />
      <el-table-column label="上传时间" align="center" prop="uploadTime" width="160">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.uploadTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="160">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最后错误信息" align="center" prop="lastErrorMsg" min-width="200" :show-overflow-tooltip="true" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="180">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-view" @click="handleView(scope.row)" v-hasPermi="['points:hisUploadRecord:query']">查看详情</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['points:hisUploadRecord:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 详情对话框 -->
    <el-dialog title="上传记录详情" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="记录ID">{{ form.id }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="业务类型">
              <el-tag v-if="form.businessType === 'catalog'" type="success">药品目录</el-tag>
              <el-tag v-else-if="form.businessType === 'inventory'" type="primary">全量库存</el-tag>
              <el-tag v-else-if="form.businessType === 'increment'" type="warning">增量库存</el-tag>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="业务主键">{{ form.businessKey }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="上传状态">
              <el-tag v-if="form.uploadStatus === '0'" type="info">待上传</el-tag>
              <el-tag v-else-if="form.uploadStatus === '1'" type="success">上传成功</el-tag>
              <el-tag v-else-if="form.uploadStatus === '2'" type="danger">上传失败</el-tag>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="失败次数">{{ form.failCount || 0 }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="上传时间">{{ parseTime(form.uploadTime) }}</el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="数据内容">
              <el-input v-model="form.dataContent" type="textarea" :rows="6" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="响应内容">
              <el-input v-model="form.responseContent" type="textarea" :rows="6" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="错误信息">
              <el-input v-model="form.lastErrorMsg" type="textarea" :rows="3" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="创建时间">{{ parseTime(form.createTime) }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="更新时间">{{ parseTime(form.updateTime) }}</el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="form.remark" type="textarea" :rows="2" readonly />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="open = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listUploadRecord, getUploadRecord, delUploadRecord } from "@/api/points/his-upload-record";

export default {
  name: "HisUploadRecord",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 上传记录表格数据
      recordList: [],
      // 日期范围
      dateRange: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 表单参数
      form: {},
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        businessType: null,
        businessKey: null,
        uploadStatus: null
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询上传记录列表 */
    getList() {
      this.loading = true;
      listUploadRecord(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.recordList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        businessType: null,
        businessKey: null,
        dataContent: null,
        uploadStatus: null,
        responseContent: null,
        uploadTime: null,
        failCount: null,
        lastErrorMsg: null,
        remark: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 查看详情按钮操作 */
    handleView(row) {
      this.reset();
      const id = row.id || this.ids[0];
      getUploadRecord(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "查看上传记录详情";
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除上传记录编号为"' + ids + '"的数据项？').then(function() {
        return delUploadRecord(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    }
  }
};
</script>
