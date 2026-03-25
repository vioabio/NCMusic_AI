<template>
  <!-- v-model 控制显示隐藏 -->
  <el-dialog
    title="意见反馈"
    v-model="visible"
    width="500px"
    @closed="handleClosed"
    :close-on-click-modal="true"
    :z-index="9999"
    append-to-body
  >
    <el-form
      ref="feedbackFormRef"
      :model="formData"
      :rules="rules"
      label-width="80px"
      label-position="top"
    >
      <!-- 反馈类型 -->
      <el-form-item label="反馈类型" prop="type">
        <el-radio-group v-model="formData.type">
          <el-radio label="bug">产品缺陷</el-radio>
          <el-radio label="suggestion">功能建议</el-radio>
          <el-radio label="other">其他</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 反馈内容 -->
      <el-form-item label="反馈内容" prop="content">
        <el-input
          v-model="formData.content"
          type="textarea"
          :rows="4"
          placeholder="请详细描述您遇到的问题或建议..."
        ></el-input>
      </el-form-item>

      <!-- 联系方式 -->
      <el-form-item label="联系方式" prop="contact">
        <el-input
          v-model="formData.contact"
          placeholder="手机号或邮箱 (选填)"
        ></el-input>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">
          提交反馈
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, defineExpose } from 'vue';
import { ElMessage } from 'element-plus';

const visible = ref(false);
const submitting = ref(false);
const feedbackFormRef = ref(null);

// 表单数据
const formData = reactive({
  type: 'suggestion',
  content: '',
  contact: ''
});

// 表单校验规则
const rules = {
  type: [{ required: true, message: '请选择反馈类型', trigger: 'change' }],
  content: [
    { required: true, message: '请输入反馈内容', trigger: 'blur' },
    { min: 5, message: '内容不能少于5个字符', trigger: 'blur' }
  ]
};

// 暴露给父组件的方法：打开弹窗
const open = () => {
  visible.value = true;
};

// 提交逻辑
const submitForm = async () => {
  if (!feedbackFormRef.value) return;
  
  await feedbackFormRef.value.validate((valid) => {
    if (valid) {
      submitting.value = true;
      
      // 模拟后端 API 请求
      setTimeout(() => {
        console.log('提交的数据：', formData);
        ElMessage.success('提交成功，感谢您的反馈！');
        submitting.value = false;
        visible.value = false; // 关闭弹窗
      }, 1000);
    }
  });
};

// 弹窗完全关闭后的回调：重置表单
const handleClosed = () => {
  feedbackFormRef.value.resetFields();
};

// 使用 defineExpose 暴露方法给外部
defineExpose({ open });
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>