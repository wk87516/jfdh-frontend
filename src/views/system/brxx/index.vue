<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="病历号" prop="bah">
        <el-input
          v-model="queryParams.bah"
          placeholder="请输入病历号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="卡号" prop="kh">
        <el-input
          v-model="queryParams.kh"
          placeholder="请输入卡号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="姓名" prop="xm">
        <el-input
          v-model="queryParams.xm"
          placeholder="请输入姓名"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="性别" prop="xb">
        <el-input
          v-model="queryParams.xb"
          placeholder="请输入性别"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="出生日期" prop="csrq">
        <el-date-picker clearable
          v-model="queryParams.csrq"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择出生日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="婚姻状况" prop="hyzk">
        <el-input
          v-model="queryParams.hyzk"
          placeholder="请输入婚姻状况"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="家庭住址" prop="jtzz">
        <el-input
          v-model="queryParams.jtzz"
          placeholder="请输入家庭住址"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="主要联系方式" prop="lxfsZj">
        <el-input
          v-model="queryParams.lxfsZj"
          placeholder="请输入主要联系方式"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="手机号码" prop="lxfsSj">
        <el-input
          v-model="queryParams.lxfsSj"
          placeholder="请输入手机号码"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="联系地址" prop="lxfsLxdz">
        <el-input
          v-model="queryParams.lxfsLxdz"
          placeholder="请输入联系地址"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="建档日期" prop="jdrq">
        <el-date-picker clearable
          v-model="queryParams.jdrq"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择建档日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="建档人员" prop="jdry">
        <el-input
          v-model="queryParams.jdry"
          placeholder="请输入建档人员"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="启用标志" prop="qybz">
        <el-input
          v-model="queryParams.qybz"
          placeholder="请输入启用标志"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="业务关联码" prop="ywgms">
        <el-input
          v-model="queryParams.ywgms"
          placeholder="请输入业务关联码"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="患者主索引" prop="empi">
        <el-input
          v-model="queryParams.empi"
          placeholder="请输入患者主索引"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:brxx:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:brxx:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:brxx:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:brxx:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="brxxList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="病历号" align="center" prop="bah" />
      <el-table-column label="卡号" align="center" prop="kh" />
      <el-table-column label="姓名" align="center" prop="xm" />
      <el-table-column label="性别" align="center" prop="xb" />
      <el-table-column label="出生日期" align="center" prop="csrq" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.csrq, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="婚姻状况" align="center" prop="hyzk" />
      <el-table-column label="身份证号" align="center" prop="sfzh" />
      <el-table-column label="家庭住址" align="center" prop="jtzz" />
      <el-table-column label="主要联系方式" align="center" prop="lxfsZj" />
      <el-table-column label="手机号码" align="center" prop="lxfsSj" />
      <el-table-column label="联系地址" align="center" prop="lxfsLxdz" />
      <el-table-column label="建档日期" align="center" prop="jdrq" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.jdrq, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="建档人员" align="center" prop="jdry" />
      <el-table-column label="启用标志" align="center" prop="qybz" />
      <el-table-column label="业务关联码" align="center" prop="ywgms" />
      <el-table-column label="患者主索引" align="center" prop="empi" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:brxx:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:brxx:remove']"
          >删除</el-button>
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

    <!-- 添加或修改患者信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="卡号" prop="kh">
          <el-input v-model="form.kh" placeholder="请输入卡号" />
        </el-form-item>
        <el-form-item label="姓名" prop="xm">
          <el-input v-model="form.xm" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="性别" prop="xb">
          <el-input v-model="form.xb" placeholder="请输入性别" />
        </el-form-item>
        <el-form-item label="出生日期" prop="csrq">
          <el-date-picker clearable
            v-model="form.csrq"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="请选择出生日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="婚姻状况" prop="hyzk">
          <el-input v-model="form.hyzk" placeholder="请输入婚姻状况" />
        </el-form-item>
        <el-form-item label="家庭住址" prop="jtzz">
          <el-input v-model="form.jtzz" placeholder="请输入家庭住址" />
        </el-form-item>
        <el-form-item label="主要联系方式" prop="lxfsZj">
          <el-input v-model="form.lxfsZj" placeholder="请输入主要联系方式" />
        </el-form-item>
        <el-form-item label="手机号码" prop="lxfsSj">
          <el-input v-model="form.lxfsSj" placeholder="请输入手机号码" />
        </el-form-item>
        <el-form-item label="联系地址" prop="lxfsLxdz">
          <el-input v-model="form.lxfsLxdz" placeholder="请输入联系地址" />
        </el-form-item>
        <el-form-item label="建档日期" prop="jdrq">
          <el-date-picker clearable
            v-model="form.jdrq"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="请选择建档日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="建档人员" prop="jdry">
          <el-input v-model="form.jdry" placeholder="请输入建档人员" />
        </el-form-item>
        <el-form-item label="启用标志" prop="qybz">
          <el-input v-model="form.qybz" placeholder="请输入启用标志" />
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
import { listBrxx, getBrxx, delBrxx, addBrxx, updateBrxx } from "@/api/system/brxx"

export default {
  name: "Brxx",
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
      // 患者信息表格数据
      brxxList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        bah: null,
        kh: null,
        xm: null,
        xb: null,
        csrq: null,
        hyzk: null,
        jtzz: null,
        lxfsZj: null,
        lxfsSj: null,
        lxfsLxdz: null,
        jdrq: null,
        jdry: null,
        qybz: null,
        ywgms: null,
        empi: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        jdrq: [
          { required: true, message: "建档日期不能为空", trigger: "blur" }
        ],
        qybz: [
          { required: true, message: "启用标志不能为空", trigger: "blur" }
        ],
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询患者信息列表 */
    getList() {
      this.loading = true
      listBrxx(this.queryParams).then(response => {
        this.brxxList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        bah: null,
        kh: null,
        xm: null,
        xb: null,
        csrq: null,
        hyzk: null,
        sfzh: null,
        jtzz: null,
        lxfsZj: null,
        lxfsSj: null,
        lxfsLxdz: null,
        jdrq: null,
        jdry: null,
        qybz: null,
        ywgms: null,
        empi: null
      }
      this.resetForm("form")
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm")
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.sfzh)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = "添加患者信息"
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const sfzh = row.sfzh || this.ids
      getBrxx(sfzh).then(response => {
        this.form = response.data
        this.open = true
        this.title = "修改患者信息"
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.bah != null) {
            updateBrxx(this.form).then(response => {
              this.$modal.msgSuccess("修改成功")
              this.open = false
              this.getList()
            })
          } else {
            addBrxx(this.form).then(response => {
              this.$modal.msgSuccess("新增成功")
              this.open = false
              this.getList()
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const sfzhs = row.sfzh || this.ids
      this.$modal.confirm('是否确认删除患者信息编号为"' + sfzhs + '"的数据项？').then(function() {
        return delBrxx(sfzhs)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/brxx/export', {
        ...this.queryParams
      }, `brxx_${new Date().getTime()}.xlsx`)
    }
  }
}
</script>
