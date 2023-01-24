<template>
  <div>
    <el-switch
        v-model="draggable"
        active-text="Drag available"
        inactive-text="No drag">
    </el-switch>
    <el-button
        type="primary"
        @click="batchSave"
        v-if="draggable"
      >Batch Save
    </el-button>
    <el-button
        type="danger"
        @click="batchDelete"
      >Batch Delete
    </el-button>
    <el-tree
        :data="menus"
        :expand-on-click-node="false"
        :props="defaultProps"
        node-key="catId"
        show-checkbox
        :default-expanded-keys="expandedKey"
        :draggable="draggable"
        :allow-drop="allowDrop"
        @node-drop="handleDrop"
        ref="menuTree"
    >
    <span slot-scope="{ node, data }" class="custom-tree-node">
        <span>{{ node.label }}</span>
        <span>
          <el-button
              v-if="node.level <=2"
              size="mini"
              type="text"
              @click="() => append(data)">
            Append
          </el-button>
          <el-button
              size="mini"
              type="text"
              @click="() => edit(data)">
            Edit
          </el-button>
          <el-button
              v-if="node.childNodes.length == 0"
              size="mini"
              type="text"
              @click="() => remove(node, data)">
            Delete
          </el-button>
        </span>
      </span>
    </el-tree>
    <el-dialog
        :title="this.title"
        :visible.sync="dialogVisible"
        width="30%"
        :close-on-click-modal=false
        >
      <el-form :model="category">
        <el-form-item label="Category Name">
          <el-input v-model="category.name"></el-input>
        </el-form-item>
        <el-form-item label="Category Icon">
          <el-input v-model="category.icon"></el-input>
        </el-form-item>
        <el-form-item label="Category Unit">
          <el-input v-model="category.productUnit"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="dialogVisible = false">Cancel</el-button>
    <el-button type="primary" @click="submitData">Confirm</el-button>
  </span>
    </el-dialog>
  </div>


</template>

<script>
export default {
  props: {},
  data () {
    return {
      menus: [],
      expandedKey: [],
      dialogVisible: false,
      title: '',
      category: {name: '', parentCid: 0, catLevel: 0, showStatus: 1, sort: 0, catId: null, icon: '', productUnit: ''},
      dialogType: '',
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      maxLevel: 0,
      updateNodes: [],
      draggable: false,
      parentCid: []
    }
  },
  methods: {
    getMenus () {
      this.$http({
        url: this.$http.adornUrl('/product/category/list/tree'),
        method: 'get'
      }).then(({data}) => {
        console.log('success!', data.data)
        this.menus = data.data
      })
    },
    append (data) {
      this.dialogVisible = true
      this.dialogType = 'add'
      this.title = 'Append'
      this.category.parentCid = data.catId
      this.category.catLevel = data.catLevel * 1 + 1
      this.category.name = ''
      this.category.catId = null
      this.category.icon = ''
      this.category.productUnit = ''
      console.log('append', data)
    },
    edit (data) {
      console.log('Edit data: ', data)
      this.dialogVisible = true
      this.dialogType = 'edit'
      this.title = 'Edit'
      // Send the request to get the latest info
      this.$http({
        url: this.$http.adornUrl(`/product/category/info/${data.catId}`),
        method: 'get'
      }).then(({data}) => {
        this.category.name = data.data.name
        this.category.catId = data.data.catId
        this.category.icon = data.data.icon
        this.category.productUnit = data.data.productUnit
        this.category.parentCid = data.data.parentCid
      })
    },
    remove (node, data) {
      var ids = [data.catId]

      this.$confirm(`This will permanently delete [${data.name}]. Continue?`, 'Warning', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.$http({
          url: this.$http.adornUrl('/product/category/delete'),
          method: 'post',
          data: this.$http.adornData(ids, false)
        }).then(({data}) => {
          this.$message({
            message: `Delete successfully!]`,
            type: 'success'
          })
          this.getMenus()
          this.expandedKey = [node.parent.data.catId]
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Delete canceled'
        })
      })
    },
    submitCategory () {
      this.$http({
        url: this.$http.adornUrl('/product/category/save'),
        method: 'post',
        data: this.$http.adornData(this.category, false)
      }).then(({data}) => {
        this.$message({
          message: `Edit save successfully!]`,
          type: 'success'
        })
        this.dialogVisible = false
        this.getMenus()
        this.expandedKey = [this.category.parentCid]
      })
      console.log('submitted data', this.category)
    },
    editCategory () {
      let {catId, name, productUnit, icon} = this.category
      let data = {catId: catId, name: name, icon: icon, productUnit: productUnit}
      this.$http({
        url: this.$http.adornUrl('/product/category/update'),
        method: 'post',
        data: this.$http.adornData(data, false)
      }).then(({data}) => {
        this.$message({
          message: `Save successfully!]`,
          type: 'success'
        })
        this.dialogVisible = false
        this.getMenus()
        this.expandedKey = [this.category.parentCid]
      })
      console.log('submitted data', this.category)
    },
    submitData () {
      if (this.dialogType === 'add') {
        this.submitCategory()
      } else if (this.dialogType === 'edit') {
        this.editCategory()
      }
    },
    allowDrop (draggingNode, dropNode, type) {
    // The total layers must smaller than 3
    //   1. Check the layer number of current node
      this.getNodeLayer(draggingNode)
      console.log('allowDrop:', {draggingNode, dropNode, type})
      let depth = Math.abs(this.maxLevel - draggingNode.level) + 1
      if (type === 'inner') {
        return (depth + dropNode.level) <= 3
      } else {
        return (depth + dropNode.parent.level) <= 3
      }
    },
    getNodeLayer (node) {
    //   Get the depth of leaves
      if (node.childNodes != null && node.childNodes.length > 0) {
        for (let i = 0; i < node.childNodes.length; i++) {
          if (node.childNodes[i].catLevel > this.maxLevel) {
            this.maxLevel = node.childNodes[i].catLevel
          }
          this.getNodeLayer(node.childNodes[i])
        }
      }
    },
    handleDrop (draggingNode, dropNode, dropType, ev) {
      // Get the latest parent cid
      let parentCid = 0
      let siblings = null
      if (dropType === 'before' || dropType === 'after') {
        parentCid = dropNode.parent.data.catId === undefined ? 0 : dropNode.parent.data.catId
        siblings = dropNode.parent.childNodes
      } else {
        parentCid = dropNode.data.catId
        siblings = dropNode.childNodes
      }
      // Get the latest order
      for (let i = 0; i < siblings.length; i++) {
        if (siblings[i].data.catId === draggingNode.data.catId) {
          let catLevel = draggingNode
          if (siblings[i].level !== catLevel) {
            catLevel = siblings[i].level
            // Change the layer of children
            this.updateChildrenLevel(siblings[i])
          }
          this.updateNodes.push({catId: siblings[i].data.catId, sort: i, parentCid: parentCid})
        } else {
          this.updateNodes.push({catId: siblings[i].data.catId, sort: i})
        }
      }
      this.parentCid.push(parentCid)
      // Get the latest layer
      console.log('update Nodes', this.updateNodes)
    },
    updateChildrenLevel (node) {
      for (let i = 0; i < node.childNodes.length; i++) {
        let curNode = node.childNodes[i].data
        this.updateNodes.push({catId: curNode.catId, catLevel: node.childNodes[i].level})
        this.updateChildrenLevel(node.childNodes[i])
      }
    },
    batchSave () {
      this.$http({
        url: this.$http.adornUrl('/product/category/batchUpdate'),
        method: 'post',
        data: this.$http.adornData(this.updateNodes, false)
      }).then(({data}) => {
        this.$message({
          message: 'Drag and drop success',
          type: 'success'
        })
        this.getMenus()
        this.expandedKey = this.parentCid
        this.updateNodes = []
        this.maxLevel = 0
        this.parentCid = 0
      })
    },
    batchDelete () {
      let catIds = []
      let checkedNodes = this.$refs.menuTree.getCheckedNodes()
      console.log('CheckedNodes:', checkedNodes)
      for (let i = 0; i < checkedNodes.length; i++) {
        catIds.push(checkedNodes[i].catId)
      }
      this.$confirm(`This will permanently batch delete [${catIds}]. Continue?`, 'Warning', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.$http({
          url: this.$http.adornUrl('/product/category/delete'),
          method: 'post',
          data: this.$http.adornData(catIds, false)
        }).then(({data}) => {
          this.$message({
            message: `Delete successfully!`,
            type: 'success'
          })
          this.getMenus()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Delete canceled'
        })
      })
    }
  },
  created () {
    this.getMenus()
  }
}
</script>

<style scoped>

</style>
