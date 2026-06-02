<template>
  <div class="registration-system">
    <!-- 顶部操作按钮区 -->
    <el-row class="operation-bar">
      <el-button type="primary" icon="el-icon-edit">挂号(G)</el-button>
      <el-button type="success" icon="el-icon-plus">加号</el-button>
      <el-button type="warning" icon="el-icon-delete">退号(T)</el-button>
      <el-button type="info" icon="el-icon-folder-add">建档(N)</el-button>
      <el-button icon="el-icon-refresh">重打条码</el-button>
      <el-button icon="el-icon-plus-circle">添加卡</el-button>
      <el-button icon="el-icon-edit">修改档案</el-button>
      <el-button icon="el-icon-setting">设置发票(S)</el-button>
      <el-button icon="el-icon-calculator">计算器(C)</el-button>
      <el-button type="danger" icon="el-icon-delete">清空界面(Q)</el-button>
      <el-button icon="el-icon-user">点名医生</el-button>
      <el-button type="danger" icon="el-icon-exit">退出</el-button>
    </el-row>

    <!-- 基本信息输入区 -->
    <el-row class="info-inputs">
      <el-col :span="6">
        <el-select v-model="socialSecurityCardType" placeholder="社会保障卡">
          <el-option label="社会保障卡" value="social_security"></el-option>
          <el-option label="医保卡" value="medical_insurance"></el-option>
          <el-option label="身份证" value="id_card"></el-option>
        </el-select>
        <el-input v-model="cardNumber" placeholder="卡号" style="width: 150px;"></el-input>
      </el-col>
      <el-col :span="3">
        <el-input v-model="cardBalance" placeholder="卡余额"></el-input>
      </el-col>
      <el-col :span="3">
        <el-input v-model="currentInvoice" placeholder="当前发票" readonly value="0040"></el-input>
      </el-col>
      <el-col :span="3">
        <el-input v-model="registeredNumber" placeholder="已挂流水号"></el-input>
      </el-col>
    </el-row>

    <!-- 个人信息区 -->
    <el-row class="personal-info">
      <el-col :span="3">
        <el-form-item label="姓名:">
          <el-input v-model="patientInfo.name"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="2">
        <el-form-item label="性别:">
          <el-radio-group v-model="patientInfo.gender">
            <el-radio label="男"></el-radio>
            <el-radio label="女"></el-radio>
          </el-radio-group>
        </el-form-item>
      </el-col>
      <el-col :span="2">
        <el-form-item label="年龄:">
          <el-input v-model="patientInfo.age" type="number"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="3">
        <el-form-item label="病人性质:">
          <el-select v-model="patientInfo.type">
            <el-option label="普通" value="ordinary"></el-option>
            <el-option label="医保" value="medical"></el-option>
            <el-option label="公费" value="public"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="4">
        <el-form-item label="病人挂号性质:">
          <el-select v-model="registrationType">
            <el-option label="普通门诊" value="ordinary_clinic"></el-option>
            <el-option label="专家门诊" value="expert_clinic"></el-option>
            <el-option label="急诊" value="emergency"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="3">
        <el-form-item label="联系电话:">
          <el-input v-model="patientInfo.phone"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="5">
        <el-form-item label="联系地址:">
          <el-input v-model="patientInfo.address"></el-input>
        </el-form-item>
      </el-col>
    </el-row>

    <!-- 挂号信息区 -->
    <el-row class="registration-info">
      <el-col :span="3">
        <el-form-item label="科室:">
          <el-input v-model="searchDept"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="3">
        <el-form-item label="医生:">
          <el-input v-model="searchDoctor"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="2">
        <el-form-item label="诊别:">
          <el-input v-model="clinicType"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="2">
        <el-form-item label="总别:">
          <el-input v-model="generalType"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="3">
        <el-form-item label="挂号日期:">
          <el-date-picker
            v-model="registrationDate"
            type="date"
            value-format="yyyy/MM/dd"
            placeholder="选择日期">
          </el-date-picker>
        </el-form-item>
      </el-col>
      <el-col :span="2">
        <el-form-item label="班次:">
          <el-select v-model="shift">
            <el-option label="上午" value="morning"></el-option>
            <el-option label="下午" value="afternoon"></el-option>
            <el-option label="晚上" value="evening"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="4">
        <el-form-item label="知情同意书状态:">
          <el-radio-group v-model="consentStatus">
            <el-radio label="agree">同意</el-radio>
            <el-radio label="disagree">不同意</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-col>
    </el-row>

    <!-- 主要内容区 -->
    <el-row class="main-content">
      <!-- 左侧科室列表 -->
      <el-col :span="12">
        <el-card>
          <el-table
            :data="departments"
            @row-click="handleDepartmentClick"
            highlight-current-row
            border>
            <el-table-column prop="id" label="序号" width="60"></el-table-column>
            <el-table-column prop="deptCode" label="科室编号" width="80"></el-table-column>
            <el-table-column prop="deptName" label="科室名称" width="120"></el-table-column>
            <el-table-column prop="doctorCode" label="医生代码" width="100"></el-table-column>
            <el-table-column prop="doctorName" label="医生姓名" width="100"></el-table-column>
            <el-table-column prop="clinicType" label="诊别" width="80"></el-table-column>
            <el-table-column prop="totalNumber" label="总号数" width="80"></el-table-column>
            <el-table-column prop="remainingNumber" label="剩余号数" width="80"></el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 右侧区域 -->
      <el-col :span="12">
        <!-- 已选项目 -->
        <el-card style="margin-bottom: 15px;">
          <el-table
            :data="selectedItems"
            border>
            <el-table-column prop="id" label="序号" width="60"></el-table-column>
            <el-table-column prop="checked" label="选择" width="60">
              <template slot-scope="scope">
                <el-checkbox v-model="scope.row.checked"></el-checkbox>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="类型" width="80"></el-table-column>
            <el-table-column prop="price" label="单价" width="80"></el-table-column>
            <el-table-column prop="code" label="项目代码" width="100"></el-table-column>
            <el-table-column prop="name" label="收费项目名称"></el-table-column>
          </el-table>
          
          <div class="total-amount">
            <span>合计：{{ totalAmount.toFixed(2) }}</span>
            <span class="selected-amount">已选择: {{ totalAmount.toFixed(2) }}</span>
          </div>
        </el-card>

        <!-- 时间段列表 -->
        <el-card>
          <el-table
            :data="timeSlots"
            @row-click="handleTimeSlotClick"
            highlight-current-row
            border>
            <el-table-column prop="id" label="序号" width="60"></el-table-column>
            <el-table-column prop="startTime" label="开始时间" width="100"></el-table-column>
            <el-table-column prop="endTime" label="结束时间" width="100"></el-table-column>
            <el-table-column prop="advanceTime" label="提前预约时限" width="120"></el-table-column>
            <el-table-column prop="totalQuota" label="总额度人数" width="100"></el-table-column>
            <el-table-column prop="registeredCount" label="已挂号人数" width="100"></el-table-column>
            <el-table-column prop="status" label="状态" width="80">
              <template slot-scope="scope">
                <el-tag :type="scope.row.status === '正常' ? 'success' : 'danger'">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 卡片信息
      socialSecurityCardType: 'social_security',
      cardNumber: '',
      cardBalance: '',
      currentInvoice: '0040',
      registeredNumber: '',
      
      // 患者信息
      patientInfo: {
        name: '',
        gender: '男',
        age: '',
        type: 'ordinary',
        phone: '',
        address: ''
      },
      
      // 挂号信息
      registrationType: 'ordinary_clinic',
      searchDept: '',
      searchDoctor: '',
      clinicType: '',
      generalType: '',
      registrationDate: '2025/08/09',
      shift: 'afternoon',
      consentStatus: '',
      
      // 科室列表数据
      departments: [
        { id: 1, deptCode: '112', deptName: '妇幼保健部', doctorCode: '', doctorName: '', clinicType: '普通号', totalNumber: 500, remainingNumber: 500 },
        { id: 2, deptCode: '183', deptName: '针科', doctorCode: '', doctorName: '', clinicType: '普通号', totalNumber: 220, remainingNumber: 220 },
        { id: 3, deptCode: '138', deptName: '全科', doctorCode: '', doctorName: '', clinicType: '普通号', totalNumber: 240, remainingNumber: 240 },
        { id: 4, deptCode: '147', deptName: '疫苗接种门诊', doctorCode: '', doctorName: '', clinicType: '普通号', totalNumber: 500, remainingNumber: 500 },
        { id: 5, deptCode: '185', deptName: '护理门诊', doctorCode: '', doctorName: '', clinicType: '普通号', totalNumber: 220, remainingNumber: 220 },
        { id: 6, deptCode: '198', deptName: '糖尿病专科门诊', doctorCode: '', doctorName: '', clinicType: '普通号', totalNumber: 84, remainingNumber: 84 },
        { id: 7, deptCode: '199', deptName: '骨质疏松专科门诊', doctorCode: '', doctorName: '', clinicType: '普通号', totalNumber: 84, remainingNumber: 84 },
        { id: 8, deptCode: '200', deptName: '高血压专科门诊', doctorCode: '', doctorName: '', clinicType: '普通号', totalNumber: 84, remainingNumber: 84 },
        { id: 9, deptCode: '201', deptName: '慢阻肺专科门诊', doctorCode: '', doctorName: '', clinicType: '普通号', totalNumber: 84, remainingNumber: 84 },
        { id: 10, deptCode: '202', deptName: '营养门诊', doctorCode: '', doctorName: '', clinicType: '普通号', totalNumber: 84, remainingNumber: 84 },
        { id: 11, deptCode: '203', deptName: '护理门诊', doctorCode: '', doctorName: '', clinicType: '普通号', totalNumber: 84, remainingNumber: 84 }
      ],
      
      // 已选项目
      selectedItems: [
        { id: 1, checked: true, type: '诊查费', price: 10.00, code: '100006', name: '一般诊疗费' }
      ],
      
      // 时间段数据
      timeSlots: [
        { id: 1, startTime: '12:30', endTime: '13:00', advanceTime: 20, totalQuota: 20, registeredCount: 0, status: '正常' },
        { id: 2, startTime: '13:00', endTime: '13:30', advanceTime: 20, totalQuota: 20, registeredCount: 0, status: '正常' },
        { id: 3, startTime: '13:30', endTime: '14:00', advanceTime: 20, totalQuota: 20, registeredCount: 0, status: '正常' },
        { id: 4, startTime: '14:00', endTime: '14:30', advanceTime: 20, totalQuota: 20, registeredCount: 0, status: '正常' },
        { id: 5, startTime: '14:30', endTime: '15:00', advanceTime: 20, totalQuota: 20, registeredCount: 0, status: '正常' },
        { id: 6, startTime: '15:00', endTime: '15:30', advanceTime: 20, totalQuota: 20, registeredCount: 0, status: '正常' },
        { id: 7, startTime: '15:30', endTime: '16:00', advanceTime: 20, totalQuota: 20, registeredCount: 0, status: '正常' },
        { id: 8, startTime: '16:00', endTime: '16:30', advanceTime: 20, totalQuota: 20, registeredCount: 0, status: '正常' },
        { id: 9, startTime: '16:30', endTime: '17:00', advanceTime: 20, totalQuota: 20, registeredCount: 0, status: '正常' },
        { id: 10, startTime: '17:00', endTime: '17:30', advanceTime: 20, totalQuota: 40, registeredCount: 0, status: '正常' }
      ],
      
      // 当前选中的科室和时间段
      currentDepartment: null,
      currentTimeSlot: null
    };
  },
  computed: {
    // 计算总金额
    totalAmount() {
      return this.selectedItems
        .filter(item => item.checked)
        .reduce((sum, item) => sum + item.price, 0);
    }
  },
  methods: {
    // 处理科室点击
    handleDepartmentClick(row) {
      this.currentDepartment = row;
    },
    
    // 处理时间段点击
    handleTimeSlotClick(row) {
      this.currentTimeSlot = row;
    }
  }
};
</script>

<style scoped>
.operation-bar {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.operation-bar .el-button {
  margin-right: 8px;
}

.info-inputs, .personal-info, .registration-info {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid #eaeaea;
}

.main-content {
  margin-top: 15px;
}

.el-col {
  padding-right: 10px;
}

.total-amount {
  margin-top: 10px;
  padding: 10px;
  text-align: right;
  background-color: #f5f7fa;
  border-top: 1px solid #eaeaea;
}

.total-amount span {
  margin-left: 20px;
  font-weight: bold;
}

.selected-amount {
  color: #f56c6c;
}

.el-table .current-row {
  background-color: #e6f7ff;
}
</style>
