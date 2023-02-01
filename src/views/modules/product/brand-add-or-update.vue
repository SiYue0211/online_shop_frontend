<template>
  <el-dialog
    :title="!dataForm.brandId ? 'Add' : 'Update'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="140px">
    <el-form-item label="name" prop="name">
      <el-input v-model="dataForm.name" placeholder="brand name"></el-input>
    </el-form-item>
    <el-form-item label="logo" prop="logo">
      <single-upload v-model="dataForm.logo" @input="doOthers"></single-upload>
    </el-form-item>
    <el-form-item label="descript" prop="descript">
      <el-input v-model="dataForm.descript" placeholder="description"></el-input>
    </el-form-item>
    <el-form-item label="show_status" prop="showStatus">
      <el-switch
        v-model="dataForm.showStatus"
        :active-value="1"
        :inactive-value="0"
        active-color="#13ce66"
        inactive-color="#ff4949">
      </el-switch>
    </el-form-item>
    <el-form-item label="first_letter" prop="firstLetter">
      <el-input v-model="dataForm.firstLetter" placeholder=""></el-input>
    </el-form-item>
    <el-form-item label="sort" prop="sort">
      <el-input v-model.number="dataForm.sort" placeholder=""></el-input>
    </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">Cancel</el-button>
      <el-button type="primary" @click="dataFormSubmit()">Confirm</el-button>
    </span>
  </el-dialog>
</template>

<script>
import SingleUpload from '../../../components/upload/singleUpload.vue'
export default {
  components: {SingleUpload},
  data () {
    return {
      visible: false,
      logo: '',
      dataForm: {
        brandId: 0,
        name: '',
        logo: '',
        descript: '',
        showStatus: 1,
        firstLetter: '',
        sort: 0
      },
      dataRule: {
        name: [
            { required: true, message: 'brand name cannot be null', trigger: 'blur' }
        ],
        logo: [
            { required: true, message: 'logo url cannot be null', trigger: 'blur' }
        ],
        descript: [
            { required: true, message: 'description cannot be null', trigger: 'blur' }
        ],
        showStatus: [
            { required: true, message: '0: invisible, 1:visible cannot be null', trigger: 'blur' }
        ],
        firstLetter: [
          { validator: (rule, value, callback) => {
            if (value === '') {
              callback(new Error('FirstLetter must be required'))
            } else if (!/^[a-zA-Z]$/.test(value)) {
              callback(new Error('FirstLetter must between a-z/A-Z'))
            } else {
              callback()
            }
          },
            trigger: 'blur' }
        ],
        sort: [
          { validator: (rule, value, callback) => {
            if (value === '') {
              callback(new Error('Sort must be required'))
            } else if (!Number.isInteger(value) || value < 0) {
              callback(new Error('Sort must be a positive integer'))
            } else {
              callback()
            }
          },
            trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    init (id) {
      this.dataForm.brandId = id || 0
      this.visible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        if (this.dataForm.brandId) {
          this.$http({
            url: this.$http.adornUrl(`/product/brand/info/${this.dataForm.brandId}`),
            method: 'get',
            params: this.$http.adornParams()
          }).then(({data}) => {
            if (data && data.code === 0) {
              this.dataForm.name = data.brand.name
              this.dataForm.logo = data.brand.logo
              this.dataForm.descript = data.brand.descript
              this.dataForm.showStatus = data.brand.showStatus
              this.dataForm.firstLetter = data.brand.firstLetter
              this.dataForm.sort = data.brand.sort
            }
          })
        }
      })
    },
      // 表单提交
    dataFormSubmit () {
      this.getLogo()
      console.log('dataForm submit: ', this.dataForm)
      console.log('input3: ', this.logo)
      this.dataForm.logo = this.logo

      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.$http({
            url: this.$http.adornUrl(`/product/brand/${!this.dataForm.brandId ? 'save' : 'update'}`),
            method: 'post',
            data: this.$http.adornData({
              'brandId': this.dataForm.brandId || undefined,
              'name': this.dataForm.name,
              'logo': this.dataForm.logo,
              'descript': this.dataForm.descript,
              'showStatus': this.dataForm.showStatus,
              'firstLetter': this.dataForm.firstLetter,
              'sort': this.dataForm.sort
            })
          }).then(({data}) => {
            if (data && data.code === 0) {
              this.$message({
                message: 'Operation Succeeded',
                type: 'success',
                duration: 1500,
                onClose: () => {
                  this.visible = false
                  this.$emit('refreshDataList')
                }
              })
            } else {
              this.$message.error(data.msg)
            }
          })
        }
      })
    },
    getLogo () {
      console.log('logo...', this.dataForm.logo)
      console.log('new log...', SingleUpload.data().logo)
      console.log('length...', SingleUpload.data().logo.length === 0)
      this.logo = SingleUpload.data().logo.length === 0 ? this.dataForm.logo : SingleUpload.data().logo
      console.log(this.dataForm.logo)
      console.log('dataForm=> ', this.dataForm)
    },
    doOthers (data) {
      console.log('do Ohter')
      this.logo = data
    }
  }
}
</script>
