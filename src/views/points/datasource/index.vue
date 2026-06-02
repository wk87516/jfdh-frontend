<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="90px">
      <el-form-item label="数据源类型" prop="sourceType">
        <el-select v-model="queryParams.sourceType" placeholder="请选择数据源类型" clearable>
          <el-option label="HIS系统" value="HIS" />
          <el-option label="公卫系统" value="GW" />
        </el-select>
      </el-form-item>
      <el-form-item label="数据源名称" prop="sourceName">
        <el-input v-model="queryParams.sourceName" placeholder="请输入数据源名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="数据库类型" prop="dbType">
        <el-select v-model="queryParams.dbType" placeholder="请选择数据库类型" clearable>
          <el-option label="MySQL" value="MYSQL" />
          <el-option label="Oracle" value="ORACLE" />
          <el-option label="SQLServer" value="SQLSERVER" />
        </el-select>
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

    <el-table v-loading="loading" :data="configList">
      <el-table-column label="数据源类型" align="center" prop="sourceType" width="100">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.sourceType === 'HIS'" type="warning">HIS系统</el-tag>
          <el-tag v-else type="success">公卫系统</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="数据源名称" align="center" prop="sourceName" width="150" />
      <el-table-column label="数据库类型" align="center" prop="dbType" width="100">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.dbType === 'ORACLE'" type="danger">Oracle</el-tag>
          <el-tag v-else-if="scope.row.dbType === 'MYSQL'" type="primary">MySQL</el-tag>
          <el-tag v-else>SQLServer</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="主机地址" align="center" prop="host" width="150" />
      <el-table-column label="端口" align="center" prop="port" width="80" />
      <el-table-column label="数据库名称" align="center" prop="databaseName" width="120" />
      <el-table-column label="用户名" align="center" prop="username" width="100" />
      <el-table-column label="视图名称" align="center" prop="viewName" width="150" />
      <el-table-column label="状态" align="center" prop="status" width="80">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.status" active-value="0" inactive-value="1" @change="handleStatusChange(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="180">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-connection" @click="handleTest(scope.row)">测试</el-button>
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
            <el-form-item label="数据源类型" prop="sourceType">
              <el-select v-model="form.sourceType" placeholder="请选择数据源类型" :disabled="!!form.id">
                <el-option label="HIS系统" value="HIS" />
                <el-option label="公卫系统" value="GW" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数据源名称" prop="sourceName">
              <el-input v-model="form.sourceName" placeholder="请输入数据源名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="数据库类型" prop="dbType">
              <el-select v-model="form.dbType" placeholder="请选择数据库类型" @change="handleDbTypeChange">
                <el-option label="MySQL" value="MYSQL" />
                <el-option label="Oracle" value="ORACLE" />
                <el-option label="SQLServer" value="SQLSERVER" />
              </el-select>
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
        <el-divider content-position="left">连接信息</el-divider>
        <el-row>
          <el-col :span="12">
            <el-form-item label="主机地址" prop="host">
              <el-input v-model="form.host" placeholder="请输入主机地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="端口" prop="port">
              <el-input v-model="form.port" placeholder="请输入端口" type="number" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="数据库名称" prop="databaseName">
              <el-input v-model="form.databaseName" :placeholder="form.dbType === 'ORACLE' ? '请输入SID' : '请输入数据库名称'" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="form.username" placeholder="请输入用户名" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="密码" prop="password">
              <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="视图名称" prop="viewName">
              <el-input v-model="form.viewName" placeholder="请输入视图名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider content-position="left">自动生成信息</el-divider>
        <el-form-item label="连接URL">
          <el-input v-model="form.url" readonly placeholder="自动生成连接URL" />
        </el-form-item>
        <el-form-item label="驱动类名">
          <el-input v-model="form.driverClassName" readonly placeholder="自动生成驱动类名" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" placeholder="请输入描述" :rows="3" />
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
import { listConfig, getConfig, delConfig, addConfig, updateConfig, testConnection } from "@/api/points/datasource";

export default {
  name: "DataSourceConfig",
  data() {
    return {
      loading: true,
      showSearch: true,
      total: 0,
      configList: [],
      title: "",
      open: false,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        sourceType: null,
        sourceName: null,
        dbType: null,
        status: null
      },
      form: {},
      rules: {
        sourceType: [{ required: true, message: "数据源类型不能为空", trigger: "change" }],
        sourceName: [{ required: true, message: "数据源名称不能为空", trigger: "blur" }],
        dbType: [{ required: true, message: "数据库类型不能为空", trigger: "change" }],
        host: [{ required: true, message: "主机地址不能为空", trigger: "blur" }],
        port: [{ required: true, message: "端口不能为空", trigger: "blur" }],
        databaseName: [{ required: true, message: "数据库名称不能为空", trigger: "blur" }],
        username: [{ required: true, message: "用户名不能为空", trigger: "blur" }],
        password: [{ required: true, message: "密码不能为空", trigger: "blur" }],
        viewName: [{ required: true, message: "视图名称不能为空", trigger: "blur" }]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      this.loading = true;
      listConfig(this.queryParams).then(response => {
        this.configList = response.data || response.rows || [];
        this.total = response.total || 0;
        this.loading = false;
      }).catch(() => {
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
      this.resetForm("form");
      this.open = true;
      this.title = "添加数据源配置";
      this.form.status = "0";
    },
    handleUpdate(row) {
      this.resetForm("form");
      const id = row.id || this.ids;
      getConfig(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改数据源配置";
      });
    },
    handleTest(row) {
      this.$modal.confirm('是否测试该数据源连接？').then(function() {
        return testConnection(row.id);
      }).then(() => {
        this.$modal.msgSuccess("连接成功！");
      }).catch(() => {});
    },
    handleStatusChange(row) {
      let text = row.status === "0" ? "启用" : "停用";
      this.$modal.confirm('确认要"' + text + '""' + row.sourceName + '"配置吗？').then(function() {
        return updateConfig(row);
      }).then(() => {
        this.$modal.msgSuccess(text + "成功");
      }).catch(function() {
        row.status = row.status === "0" ? "1" : "0";
      });
    },
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateConfig(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addConfig(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除数据源配置编号为"' + ids + '"的数据项？').then(function() {
        return delConfig(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    handleDbTypeChange() {
      this.buildConnectionUrl();
    },
    buildConnectionUrl() {
      if (!this.form.host || !this.form.port || !this.form.databaseName) {
        return;
      }
      
      const dbType = this.form.dbType;
      const host = this.form.host;
      const port = this.form.port;
      const databaseName = this.form.databaseName;
      
      if (dbType === 'ORACLE') {
        this.form.url = `jdbc:oracle:thin:@${host}:${port}:${databaseName}`;
        this.form.driverClassName = 'oracle.jdbc.OracleDriver';
      } else if (dbType === 'MYSQL') {
        this.form.url = `jdbc:mysql://${host}:${port}/${databaseName}?useUnicode=true&characterEncoding=utf8&zeroDateTimeBehavior=convertToNull&useSSL=true&serverTimezone=GMT%2B8`;
        this.form.driverClassName = 'com.mysql.cj.jdbc.Driver';
      } else if (dbType === 'SQLSERVER') {
        this.form.url = `jdbc:sqlserver://${host}:${port};databaseName=${databaseName}`;
        this.form.driverClassName = 'com.microsoft.sqlserver.jdbc.SQLServerDriver';
      }
    },
    cancel() {
      this.open = false;
      this.resetForm("form");
    },
    resetForm(ref) {
      if (this.$refs[ref]) {
        this.$refs[ref].resetFields();
      }
    }
  },
  watch: {
    'form.host': {
      handler() { this.buildConnectionUrl(); },
      deep: true
    },
    'form.port': {
      handler() { this.buildConnectionUrl(); },
      deep: true
    },
    'form.databaseName': {
      handler() { this.buildConnectionUrl(); },
      deep: true
    }
  }
};
</script>