<template>
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
            <el-select v-model="form.ruleType" placeholder="请选择规则类型" @change="ruleTypeChange">
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
          <el-form-item label="科室类型" prop="departmentType">
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
          <el-form-item label="积分比例" prop="pointsRate">
            <el-input-number v-model="form.pointsRate" :min="0" :max="1" :step="0.1" :precision="4" placeholder="如0.5表示50%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="固定积分">
            <el-input-number v-model="form.fixedPoints" :min="0" :precision="2" placeholder="有值时优先使用" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="最低金额门槛">
            <el-input-number v-model="form.minAmount" :min="0" :precision="2" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="单次最高积分">
            <el-input-number v-model="form.maxPoints" :min="0" :precision="2" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="优先级" prop="priority">
            <el-input-number v-model="form.priority" :min="0" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio label="0">启用</el-radio>
              <el-radio label="1">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="生效开始时间">
            <el-date-picker v-model="form.validFrom" type="date" placeholder="选择日期" value-format="yyyy-MM-dd" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="生效结束时间">
            <el-date-picker v-model="form.validTo" type="date" placeholder="选择日期" value-format="yyyy-MM-dd" />
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
</template>

<script>
import { addRule, updateRule, getRule } from "@/api/points/rule";

export default {
  name: "PointsRuleForm",
  data() {
    return {
      open: false,
      title: "",
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
      }
    };
  },
  methods: {
    init(row) {
      if (row && row.id) {
        this.title = "修改积分规则";
        getRule(row.id).then(response => {
          this.form = response.data;
        });
      } else {
        this.title = "新增积分规则";
        this.form = {
          status: "0",
          priority: 0,
          pointsRate: 0.5,
          isIncludeDrug: "N"
        };
      }
      this.open = true;
    },
    ruleTypeChange(value) {
      if (value !== '2') {
        this.form.departmentType = undefined;
        this.form.isIncludeDrug = "N";
      }
    },
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id) {
            updateRule(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.$emit("refresh");
            });
          } else {
            addRule(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.$emit("refresh");
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
