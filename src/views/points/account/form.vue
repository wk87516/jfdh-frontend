<template>
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
      <el-row>
        <el-col :span="12">
          <el-form-item label="累计积分">
            <el-input-number v-model="form.totalPoints" :min="0" :precision="2" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="可用积分">
            <el-input-number v-model="form.availablePoints" :min="0" :precision="2" disabled />
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
import { addAccount, updateAccount, getAccount } from "@/api/points/account";

export default {
  name: "PointsAccountForm",
  data() {
    return {
      open: false,
      title: "",
      form: {},
      rules: {
        patientId: [
          { required: true, message: "患者ID不能为空", trigger: "blur" }
        ],
        patientName: [
          { required: true, message: "患者姓名不能为空", trigger: "blur" }
        ]
      }
    };
  },
  methods: {
    init(row) {
      if (row && row.id) {
        this.title = "修改积分账户";
        getAccount(row.id).then(response => {
          this.form = response.data;
        });
      } else {
        this.title = "新增积分账户";
        this.form = {
          status: "0",
          totalPoints: 0,
          usedPoints: 0,
          availablePoints: 0,
          frozenPoints: 0
        };
      }
      this.open = true;
    },
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id) {
            updateAccount(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.$emit("refresh");
            });
          } else {
            addAccount(this.form).then(response => {
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
