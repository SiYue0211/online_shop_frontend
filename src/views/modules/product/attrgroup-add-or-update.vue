<template>
  <el-dialog
    :title="!dataForm.attrGroupId ? 'Add' : 'Update'"
    :close-on-click-modal="false"
    :visible.sync="visible"
    @closed="dialogClose"
  >
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
    <el-form-item label="attr_group_name" prop="attrGroupName">
      <el-input v-model="dataForm.attrGroupName" placeholder=""></el-input>
    </el-form-item>
    <el-form-item label="sort" prop="sort">
      <el-input v-model="dataForm.sort" placeholder=""></el-input>
    </el-form-item>
    <el-form-item label="descript" prop="descript">
      <el-input v-model="dataForm.descript" placeholder=""></el-input>
    </el-form-item>
    <el-form-item label="icon" prop="icon">
      <el-input v-model="dataForm.icon" placeholder=""></el-input>
    </el-form-item>
    <el-form-item label="catelog_id" prop="catalogPath">
      <el-cascader
        v-model="dataForm.catalogPath"
        :props="props"
        :options="categories"
        filterable
        placeholder="Try searching"
      >
      </el-cascader>
    </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">Cancel</el-button>
      <el-button type="primary" @click="dataFormSubmit()">Confirm</el-button>
    </span>
  </el-dialog>
</template>

<script>
  export default {
    data () {
      return {
        visible: false,
        categories: [],
        dataForm: {
          attrGroupId: 0,
          attrGroupName: '',
          sort: '',
          descript: '',
          icon: '',
          catalogPath: [],
          catelogId: ''
        },
        dataRule: {
          attrGroupName: [
            { required: true, message: ' cannot be null', trigger: 'blur' }
          ],
          sort: [
            { required: true, message: ' cannot be null', trigger: 'blur' }
          ],
          descript: [
            { required: true, message: ' cannot be null', trigger: 'blur' }
          ],
          icon: [
            { required: true, message: ' cannot be null', trigger: 'blur' }
          ],
          catelogId: [
            { required: true, message: ' cannot be null', trigger: 'blur' }
          ]
        },
        props: {
          value: 'catId',
          label: 'name',
          children: 'children'
        }
      }
    },
    methods: {
      init (id) {
        this.dataForm.attrGroupId = id || 0
        this.visible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields()
          if (this.dataForm.attrGroupId) {
            this.$http({
              url: this.$http.adornUrl(`/product/attrgroup/info/${this.dataForm.attrGroupId}`),
              method: 'get',
              params: this.$http.adornParams()
            }).then(({data}) => {
              if (data && data.code === 0) {
                this.dataForm.attrGroupName = data.attrGroup.attrGroupName
                this.dataForm.sort = data.attrGroup.sort
                this.dataForm.descript = data.attrGroup.descript
                this.dataForm.icon = data.attrGroup.icon
                this.dataForm.catelogId = data.attrGroup.catelogId
                // Get the path from root
                this.dataForm.catalogPath = data.attrGroup.catalogPath
              }
            })
          }
        })
      },
      // 表单提交
      dataFormSubmit () {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/product/attrgroup/${!this.dataForm.attrGroupId ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'attrGroupId': this.dataForm.attrGroupId || undefined,
                'attrGroupName': this.dataForm.attrGroupName,
                'sort': this.dataForm.sort,
                'descript': this.dataForm.descript,
                'icon': this.dataForm.icon,
                'catelogId': this.dataForm.catalogPath[this.dataForm.catalogPath.length - 1]
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
      getCategories () {
        this.$http({
          url: this.$http.adornUrl('/product/category/list/tree'),
          method: 'get'
        }).then(({data}) => {
          this.categories = data.data
        })
      },
      dialogClose () {
        this.dataForm.catalogPath = []
      }
    },
    created () {
      this.getCategories()
    }
  }
</script>
